(() => {
  "use strict";
  const initial=structuredClone(window.SITE_CONFIG);
  const $=id=>document.getElementById(id);
  const fields={brandName:["brand","name"],descriptor:["brand","descriptor"],accent:["brand","accent"],city:["contact","city"],whatsapp:["contact","whatsapp"],email:["contact","email"],instagram:["contact","instagram"],heroTitle:["hero","title"],heroDescription:["hero","description"],heroImage:["hero","imageUrl"],aboutTitle:["about","title"],aboutDescription:["about","description"]};
  const flags=["portfolio","albums","services","quotes","booking"];
  function fill(config){
    for(const [id,[group,key]] of Object.entries(fields))$(id).value=config[group][key]||"";
    for(const flag of flags)$(flag).checked=Boolean(config.features[flag]);
    $("servicesJson").value=JSON.stringify(config.services,null,2);
    $("portfolioJson").value=JSON.stringify(config.portfolio,null,2);
    renderAlbums(config.albums||[]);
  }
  function collect(){
    const result=structuredClone(initial);
    for(const [id,[group,key]] of Object.entries(fields))result[group][key]=$(id).value.trim();
    for(const flag of flags)result.features[flag]=$(flag).checked;
    for(const [id,key] of [["servicesJson","services"],["portfolioJson","portfolio"]]){
      const data=JSON.parse($(id).value);
      if(!Array.isArray(data))throw new Error(key+" deve ser uma lista JSON");
      if(data.length>100)throw new Error(key+" excede o limite de 100 itens");
      for(const item of data){
        if(!item||typeof item!=="object"||typeof item.title!=="string"||!item.title.trim())throw new Error("Todos os itens de "+key+" precisam de título");
        if(key==="services"&&typeof item.description!=="string")throw new Error("Cada serviço precisa de descrição");
        if(key==="portfolio"&&typeof item.category!=="string")throw new Error("Cada item do portfólio precisa de categoria");
      }
      result[key]=data;
    }
    result.albums=collectAlbums();
    if(!result.brand.name)throw new Error("Informe o nome da marca");
    if(result.contact.whatsapp&&!/^\d{10,15}$/.test(result.contact.whatsapp.replace(/\D/g,"")))throw new Error("WhatsApp deve conter DDI, DDD e número");
    for(const url of [result.hero.imageUrl,...result.portfolio.map(x=>x.imageUrl||"")]){
      if(url&&!isSafeUrl(url))throw new Error("Use URLs HTTPS ou caminhos locais ./assets/ para imagens; Instagram exige HTTPS");
    }
    if(result.contact.instagram&&!/^https:\/\//i.test(result.contact.instagram))throw new Error("Instagram deve usar HTTPS");
    return result;
  }
  function isSafeUrl(value){return /^https:\/\//i.test(value)||/^\.\/assets\/[a-zA-Z0-9_./-]+$/.test(value)&&!value.includes("..");}
  function albumField(label,value,field){
    const wrapper=document.createElement("label");wrapper.textContent=label;
    const input=document.createElement("input");input.value=value||"";input.dataset.field=field;input.maxLength=300;wrapper.append(input);return wrapper;
  }
  function renderAlbums(albums){
    const container=$("album-editor");container.replaceChildren();
    albums.forEach(album=>addAlbum(album));
  }
  function addAlbum(album={}){
    const section=document.createElement("section");section.className="album-editor-card";
    section.append(albumField("Título",album.title,"title"),albumField("Descrição",album.subtitle,"subtitle"),albumField("Capa (URL ou caminho)",album.imageUrl,"imageUrl"));
    const photos=document.createElement("textarea");photos.dataset.field="photos";photos.rows=5;photos.placeholder="Uma fotografia por linha: URL | legenda | texto alternativo";
    photos.value=(album.photos||[]).map(p=>[p.imageUrl||"",p.caption||"",p.alt||""].join(" | ")).join("\n");
    const photoLabel=document.createElement("label");photoLabel.textContent="Fotografias (uma por linha)";photoLabel.append(photos);section.append(photoLabel);
    const remove=document.createElement("button");remove.type="button";remove.textContent="Excluir álbum";remove.addEventListener("click",()=>section.remove());section.append(remove);
    $("album-editor").append(section);
  }
  function collectAlbums(){
    const cards=[...document.querySelectorAll(".album-editor-card")];
    if(cards.length>50)throw new Error("Máximo de 50 álbuns");
    return cards.map((card,index)=>{
      const value=name=>card.querySelector('[data-field="'+name+'"]').value.trim();
      const title=value("title"),subtitle=value("subtitle"),imageUrl=value("imageUrl");
      if(!title)throw new Error("O álbum "+(index+1)+" precisa de título");
      if(imageUrl&&!isSafeUrl(imageUrl))throw new Error("Capa inválida no álbum "+title);
      const lines=value("photos").split("\n").map(s=>s.trim()).filter(Boolean);
      if(lines.length>300)throw new Error("Máximo de 300 fotos por álbum");
      const photos=lines.map(line=>{
        const [url,caption="",alt=""]=line.split("|").map(s=>s.trim());
        if(!url||!isSafeUrl(url))throw new Error("URL inválida em fotografia do álbum "+title);
        return {imageUrl:url,caption,alt};
      });
      return {id:"album-"+(index+1),title,subtitle,imageUrl,photos};
    });
  }
  $("add-album").addEventListener("click",()=>addAlbum());
  function download(name,contents,mime){
    const blob=new Blob([contents],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function act(action){
    try{const config=collect();action(config);$("status").textContent="Configuração preparada com sucesso.";}catch(error){$("status").textContent="Verifique os dados: "+error.message;}
  }
  $("editor").addEventListener("submit",event=>{event.preventDefault();act(config=>download("site.config.js","window.SITE_CONFIG = "+JSON.stringify(config,null,2)+";\n","text/javascript"));});
  $("preview").addEventListener("click",()=>act(config=>{sessionStorage.setItem("studio_preview_config",JSON.stringify(config));window.location.assign("./index.html?preview=1");}));
  $("reset").addEventListener("click",()=>{if(confirm("Restaurar os campos para os valores iniciais?")){fill(initial);$("status").textContent="Campos restaurados."; }});
  fill(initial);
})();