(() => {
  "use strict";
  const initial=structuredClone(window.SITE_CONFIG);
  const $=id=>document.getElementById(id);
  const fields={brandName:["brand","name"],descriptor:["brand","descriptor"],accent:["brand","accent"],city:["contact","city"],whatsapp:["contact","whatsapp"],email:["contact","email"],instagram:["contact","instagram"],heroTitle:["hero","title"],heroDescription:["hero","description"],heroImage:["hero","imageUrl"],aboutTitle:["about","title"],aboutDescription:["about","description"]};
  const flags=["portfolio","services","quotes","booking"];
  function fill(config){
    for(const [id,[group,key]] of Object.entries(fields))$(id).value=config[group][key]||"";
    for(const flag of flags)$(flag).checked=Boolean(config.features[flag]);
    $("servicesJson").value=JSON.stringify(config.services,null,2);
    $("portfolioJson").value=JSON.stringify(config.portfolio,null,2);
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
    if(!result.brand.name)throw new Error("Informe o nome da marca");
    if(result.contact.whatsapp&&!/^\d{10,15}$/.test(result.contact.whatsapp.replace(/\D/g,"")))throw new Error("WhatsApp deve conter DDI, DDD e número");
    for(const url of [result.contact.instagram,result.hero.imageUrl,...result.portfolio.map(x=>x.imageUrl||"")]){
      if(url&&!/^https:\/\//i.test(url))throw new Error("Use somente URLs HTTPS para imagens e Instagram");
    }
    return result;
  }
  function download(name,contents,mime){
    const blob=new Blob([contents],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function act(action){
    try{const config=collect();action(config);$("status").textContent="Configuração preparada com sucesso.";}catch(error){$("status").textContent="Verifique os dados: "+error.message;}
  }
  $("editor").addEventListener("submit",event=>{event.preventDefault();act(config=>download("site.config.js","window.SITE_CONFIG = "+JSON.stringify(config,null,2)+";\n","text/javascript"));});
  $("preview").addEventListener("click",()=>act(config=>{sessionStorage.setItem("studio_preview_config",JSON.stringify(config));window.open("./index.html?preview=1","_blank","noopener,noreferrer");}));
  $("reset").addEventListener("click",()=>{if(confirm("Restaurar os campos para os valores iniciais?")){fill(initial);$("status").textContent="Campos restaurados."; }});
  fill(initial);
})();