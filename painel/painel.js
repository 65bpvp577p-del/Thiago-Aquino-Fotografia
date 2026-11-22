const sample=[
{id:"demo-1",client_name:"Cliente exemplo A",client_phone:"(00) 00000-0000",service:"Ensaio fotográfico",preferred_date:"2026-12-05",preferred_time:"15:00",status:"new",details:"Exemplo fictício de ensaio externo."},
{id:"demo-2",client_name:"Cliente exemplo B",client_phone:"(00) 00000-0000",service:"Cobertura de evento",preferred_date:"2026-12-12",preferred_time:"18:00",status:"reviewing",details:"Exemplo fictício de evento familiar."},
{id:"demo-3",client_name:"Cliente exemplo C",client_phone:"(00) 00000-0000",service:"Formatura",preferred_date:"2026-12-19",preferred_time:"10:00",status:"approved",details:"Exemplo fictício de sessão de formatura."}
];
const labels={new:"Novo",reviewing:"Em análise",proposed:"Proposta enviada",approved:"Aprovado",declined:"Recusado",completed:"Concluído",cancelled:"Cancelado"};
const tbody=document.getElementById("requests"),filter=document.getElementById("status-filter"),stats=document.getElementById("stats"),dialog=document.getElementById("details-dialog");
function render(){
 const items=sample.filter(item=>!filter.value||item.status===filter.value);
 tbody.replaceChildren();stats.replaceChildren();
 for(const [label,count] of [["Solicitações de exemplo",sample.length],["Aguardando análise",sample.filter(x=>x.status==="new"||x.status==="reviewing").length],["Aprovadas (exemplo)",sample.filter(x=>x.status==="approved").length]]){
 const card=document.createElement("div");card.className="stat";const title=document.createElement("span");title.textContent=label;const number=document.createElement("strong");number.textContent=String(count);card.append(title,number);stats.append(card);
 }
 for(const item of items){
 const tr=document.createElement("tr");
 for(const value of [item.client_name,item.service,item.preferred_date+" "+item.preferred_time,labels[item.status]]){
 const td=document.createElement("td");td.textContent=value;if(value===labels[item.status])td.className="status";tr.append(td);
 }
 const td=document.createElement("td"),button=document.createElement("button");button.type="button";button.textContent="Visualizar";button.addEventListener("click",()=>show(item));td.append(button);tr.append(td);tbody.append(tr);
 }
 if(!items.length){const tr=document.createElement("tr"),td=document.createElement("td");td.colSpan=5;td.textContent="Nenhum exemplo neste filtro.";tr.append(td);tbody.append(tr);}
}
function show(item){
 const dl=document.getElementById("details");dl.replaceChildren();
 for(const [label,value] of [["Cliente",item.client_name],["Contato",item.client_phone],["Serviço",item.service],["Data preferida",item.preferred_date],["Horário preferido",item.preferred_time],["Situação",labels[item.status]],["Observações",item.details]]){
 const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;dd.textContent=value;dl.append(dt,dd);
 }
 dialog.showModal();
}
document.getElementById("close-dialog").addEventListener("click",()=>dialog.close());
filter.addEventListener("change",render);
render();
