(() => {
  "use strict";
  let cfg = window.SITE_CONFIG;
  if(new URLSearchParams(location.search).get("preview")==="1"){try{const preview=sessionStorage.getItem("studio_preview_config");if(preview)cfg=JSON.parse(preview);}catch(error){console.warn("Prévia indisponível",error);}}
  if (!cfg) throw new Error("site.config.js não carregado");
  const $ = id => document.getElementById(id);
  const setText = (id, value) => { const el=$(id); if(el) el.textContent=value || ""; };
  const el = (tag, className, text) => { const node=document.createElement(tag); if(className) node.className=className; if(text) node.textContent=text; return node; };
  document.documentElement.style.setProperty("--accent", cfg.brand.accent);
  document.documentElement.style.setProperty("--bg", cfg.brand.background);
  document.documentElement.style.setProperty("--fg", cfg.brand.foreground);
  document.title = cfg.brand.name + " " + cfg.brand.descriptor;
  setText("brand-name",cfg.brand.name); setText("brand-descriptor",cfg.brand.descriptor);
  setText("hero-eyebrow",cfg.hero.eyebrow); setText("hero-title",cfg.hero.title); setText("hero-description",cfg.hero.description);
  setText("about-title",cfg.about.title); setText("about-description",cfg.about.description);
  setText("contact-city",cfg.contact.city); setText("footer-brand",cfg.brand.name+" "+cfg.brand.descriptor);
  for(const [key,enabled] of Object.entries(cfg.features)){ if(!enabled) document.querySelectorAll('[data-feature="'+key+'"],[data-section="'+key+'"]').forEach(node=>node.hidden=true); }
  const grid=$("portfolio-grid");
  cfg.portfolio.forEach((item,index)=>{const card=el("article","portfolio-card"); if(item.imageUrl)card.style.backgroundImage="url("+JSON.stringify(item.imageUrl)+")";const inner=el("div");inner.append(el("small","",item.category),el("h3","",item.title));card.append(inner);if(!item.imageUrl)card.style.backgroundColor=["#b6aa9b","#9b968c","#a79b90"][index%3];grid.append(card);});
  // Rotação editorial: somente imagens reais configuradas, nunca placeholders.
  const motionPreference=window.matchMedia("(prefers-reduced-motion: reduce)");
  const candidateImages=[...(cfg.portfolio||[]).map(item=>item.imageUrl),...(cfg.albums||[]).flatMap(album=>[album.imageUrl,...(Array.isArray(album.photos)?album.photos.map(photo=>photo.imageUrl):[])])].filter(url=>typeof url==="string"&&url.trim());
  const uniqueImages=[...new Set(candidateImages)];
  const heroPhoto=$("hero-photo");
  let rotationTimer=null,heroIndex=0;
  function changeHero(url){
    const probe=new Image();
    probe.onload=()=>{
      const next=el("div","hero-rotating-image");
      next.style.backgroundImage="url("+JSON.stringify(url)+")";
      heroPhoto.append(next);
      requestAnimationFrame(()=>next.classList.add("is-visible"));
      const previous=heroPhoto.querySelectorAll(".hero-rotating-image");
      if(previous.length>1){const old=previous[0];old.classList.remove("is-visible");setTimeout(()=>old.remove(),1100);}
      const placeholder=heroPhoto.querySelector(".photo-placeholder");
      if(placeholder)placeholder.hidden=true;
    };
    probe.onerror=()=>console.warn("Imagem de destaque indisponível:",url);
    probe.src=url;
  }
  if(uniqueImages.length){
    const first=cfg.hero.imageUrl&&uniqueImages.includes(cfg.hero.imageUrl)?uniqueImages.indexOf(cfg.hero.imageUrl):0;
    heroIndex=first;changeHero(uniqueImages[heroIndex]);
    if(uniqueImages.length>1&&!motionPreference.matches){
      const startRotation=()=>{if(rotationTimer===null)rotationTimer=setInterval(()=>{if(document.hidden)return;heroIndex=(heroIndex+1)%uniqueImages.length;changeHero(uniqueImages[heroIndex]);},6500);};
      const stopRotation=()=>{if(rotationTimer!==null){clearInterval(rotationTimer);rotationTimer=null;}};
      startRotation();
      document.addEventListener("visibilitychange",()=>{if(document.hidden)stopRotation();else if(!motionPreference.matches)startRotation();});
      motionPreference.addEventListener("change",event=>{if(event.matches)stopRotation();else if(!document.hidden)startRotation();});
    }
  }
  // Entrada sutil das seções; conteúdo continua visível sem JavaScript.
  if("IntersectionObserver" in window&&!motionPreference.matches){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){entry.target.classList.add("is-in-view");observer.unobserve(entry.target);}
    }),{threshold:.12,rootMargin:"0px 0px -35px 0px"});
    document.querySelectorAll(".section-heading,.portfolio-card,.album-card,.service-card").forEach(node=>{
      node.classList.add("reveal-ready");observer.observe(node);
    });
  }
  const albumsGrid=$("albums-grid"),albumDialog=$("album-dialog"),photoDialog=$("photo-dialog");
  $("album-close").addEventListener("click",()=>albumDialog.close());
  $("photo-close").addEventListener("click",()=>photoDialog.close());
  for(const dialog of [albumDialog,photoDialog])dialog.addEventListener("click",event=>{if(event.target===dialog)dialog.close();});
  function openAlbum(album){
    setText("album-dialog-title",album.title||"Álbum");
    setText("album-dialog-description",album.subtitle||"");
    const photos=$("album-photos");photos.replaceChildren();
    const items=Array.isArray(album.photos)?album.photos.filter(photo=>photo&&typeof photo.imageUrl==="string"&&photo.imageUrl.trim()):[];
    if(!items.length){photos.append(el("p","gallery-empty","As fotografias deste álbum ainda não foram publicadas."));}
    items.forEach((photo,index)=>{
      const button=el("button","gallery-photo");button.type="button";
      const img=el("img");img.src=photo.imageUrl;img.alt=photo.alt||("Fotografia "+(index+1)+" de "+album.title);img.loading="lazy";
      const caption=el("span","",photo.caption||"Visualizar fotografia");
      button.append(img,caption);
      button.addEventListener("click",()=>{
        const large=$("photo-large");large.src=photo.imageUrl;large.alt=img.alt;
        setText("photo-caption",photo.caption||"");photoDialog.showModal();
      });
      photos.append(button);
    });
    albumDialog.showModal();
  }
  (cfg.albums||[]).forEach((album,index)=>{
    const card=el("article","album-card");
    const cover=el("div","album-cover");
    if(album.imageUrl)cover.style.backgroundImage="url("+JSON.stringify(album.imageUrl)+")";
    else cover.append(el("span","album-empty","CAPA DO ÁLBUM"));
    const body=el("div","album-body");
    body.append(el("small","",album.subtitle||"Coleção fotográfica"),el("h3","",album.title||"Álbum"));
    const count=Array.isArray(album.photos)?album.photos.length:0;
    body.append(el("p","",count?count+" fotografias":"Fotos em preparação"));
    card.append(cover,body);
    const button=el("button","album-open","Explorar álbum");button.type="button";button.addEventListener("click",()=>openAlbum(album));body.append(button);
    albumsGrid.append(card);
  });
  if(!(cfg.albums||[]).length)albumsGrid.append(el("p","","Nenhum álbum publicado."));
  const services=$("services-grid"),select=$("service-select"); select.append(new Option("Selecione um serviço",""));
  cfg.services.forEach(item=>{const card=el("article","service-card");card.append(el("h3","",item.title),el("p","",item.description));services.append(card);select.append(new Option(item.title,item.title));});
  const links=$("contact-links");
  if(cfg.contact.instagram){const a=el("a","","Instagram");a.href=cfg.contact.instagram;a.rel="noopener noreferrer";a.target="_blank";links.append(a);}
  if(cfg.contact.email){const a=el("a","",cfg.contact.email);a.href="mailto:"+cfg.contact.email;links.append(a);}
  if(cfg.contact.whatsapp){const a=el("a","","WhatsApp");a.href="https://wa.me/"+cfg.contact.whatsapp.replace(/\D/g,"");a.rel="noopener noreferrer";a.target="_blank";links.append(a);}
  const form=$("request-form");
  const hasContactChannel=Boolean((cfg.contact.whatsapp||"").replace(/\D/g,"") || (cfg.contact.email||"").trim());
  if(!hasContactChannel){
    const submit=form.querySelector('button[type="submit"]');
    if(submit){submit.disabled=true;submit.textContent="Atendimento em configuração";}
    for(const control of form.querySelectorAll("input,select,textarea"))control.disabled=true;
    setText("form-message","O formulário de orçamento estará disponível assim que o canal de atendimento for configurado. Nenhum dado será coletado por enquanto.");
  }
  const dateInput=form.querySelector('input[name="date"]');
  if(dateInput){const today=new Date();const localDate=new Date(today.getTime()-today.getTimezoneOffset()*60000).toISOString().slice(0,10);dateInput.min=localDate;}
  form.addEventListener("submit",event=>{
    event.preventDefault();
    if(!form.reportValidity())return;
    const data=Object.fromEntries(new FormData(form).entries());
    if(!cfg.features.booking){data.date="";data.time="";}
    const message=["Olá! Gostaria de solicitar um orçamento/agendamento.", "Nome: "+data.name,"Contato: "+data.phone,"Serviço: "+data.service,"Data: "+(data.date||"A definir"),"Horário preferido: "+(data.time||"A definir"),"Local: "+(data.location||"A definir"),"Detalhes: "+(data.details||"Não informado")].join("\n");
    const phone=(cfg.contact.whatsapp||"").replace(/\D/g,"");
    if(phone){window.open("https://wa.me/"+phone+"?text="+encodeURIComponent(message),"_blank","noopener,noreferrer");setText("form-message","Confira o WhatsApp e envie a mensagem para concluir a solicitação.");}
    else if(cfg.contact.email){window.location.href="mailto:"+cfg.contact.email+"?subject="+encodeURIComponent("Solicitação de orçamento")+"&body="+encodeURIComponent(message);setText("form-message","Confira seu aplicativo de e-mail e envie a mensagem.");}
    else setText("form-message","Canal de atendimento ainda não configurado. Sua solicitação não foi enviada.");
  });
})();