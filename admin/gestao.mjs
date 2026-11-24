import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { createAdminAuth } from '../auth/admin-auth.mjs';
const $ = id => document.getElementById(id);
const cfg = window.SUPABASE_PUBLIC_CONFIG || {};
const notice = (s,err=false) => { $('notice').textContent=s; $('notice').className=err?'error':''; };
const money = n => Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const date = d => d ? d.split('-').reverse().join('/') : 'A definir';
const sum = (items,fn) => items.reduce((a,x)=>a+Number(fn(x)||0),0);
const client = createClient(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const auth = createAdminAuth(client);
let jobs=[],transactions=[],activeTab='agenda',editingFinance=null,busy=false;
const v=id=>$(id).value.trim();
const fmtJob = j => ({client_name:j.client_name,client_phone:j.client_phone,client_email:j.client_email,service_name:j.service_name,event_date:j.event_date,start_time:j.start_time,location:j.location,status:j.status,quote_status:j.quote_status,description:j.description,total_amount:j.total_amount,valid_until:j.valid_until});
async function query(promise){const {data,error}=await promise;if(error)throw error;return data;}
async function run(fn){if(busy)return;busy=true;try{await fn();}catch(e){notice(e.message||'Erro ao salvar dados.',true);}finally{busy=false;}}
const received = id => sum(transactions.filter(t=>t.job_id===id&&t.kind==='receita'&&t.paid_at),t=>t.amount);
const expense = id => sum(transactions.filter(t=>t.job_id===id&&t.kind==='despesa'&&t.paid_at),t=>t.amount);
const balance = j => Math.max(0,Number(j.total_amount)-received(j.id));
async function refresh(){
  jobs=await query(client.from('photo_jobs').select('*').order('created_at',{ascending:false}));
  transactions=await query(client.from('photo_job_transactions').select('*').order('created_at',{ascending:false}));
  draw();
  if(editingFinance)drawFinance(editingFinance);
}

let calendarDate=new Date(),selectedDate=null;
const isoDay=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const addDays=(d,n)=>new Date(d.getFullYear(),d.getMonth(),d.getDate()+n);
const calendarJobs=day=>jobs.filter(j=>j.event_date===day).sort((a,b)=>(a.start_time||'').localeCompare(b.start_time||''));
function calendarNode(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;}
function calendarDetails(day){
  selectedDate=day;
  const wrap=$('calendarDetails');wrap.replaceChildren();
  const title=calendarNode('h3','',new Date(day+'T12:00:00').toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'}));wrap.append(title);
  const found=calendarJobs(day);
  if(!found.length)wrap.append(calendarNode('p','', 'Nenhum trabalho marcado para este dia.'));
  for(const j of found){
    const item=calendarNode('div','calendar-list-item');
    const desc=calendarNode('div','');
    desc.append(calendarNode('strong','',(j.start_time?j.start_time.slice(0,5)+' · ':'')+j.client_name),calendarNode('p','',j.service_name+' · '+j.status+(j.location?' · '+j.location:'')));
    const actions=calendarNode('div','row');
    const edit=calendarNode('button','secondary','Editar');edit.onclick=()=>openEditor(j);
    const finance=calendarNode('button','secondary','Financeiro');finance.onclick=()=>{editingFinance=j.id;drawFinance(j.id);$('financePanel').scrollIntoView({behavior:'smooth'});};
    actions.append(edit,finance);item.append(desc,actions);wrap.append(item);
  }
  const add=calendarNode('button','','+ Agendar neste dia');
  add.onclick=()=>{activeTab='agenda';openEditor();$('eventDate').value=day;};
  wrap.append(add);
}
function renderCalendar(){
  const mode=$('calendarMode').value,root=$('calendarGrid');root.replaceChildren();
  const cursor=new Date(calendarDate.getFullYear(),calendarDate.getMonth(),calendarDate.getDate());
  const today=isoDay(new Date());
  let start,count;
  if(mode==='month'){const first=new Date(cursor.getFullYear(),cursor.getMonth(),1);start=addDays(first,-((first.getDay()+6)%7));const last=new Date(cursor.getFullYear(),cursor.getMonth()+1,0);count=Math.ceil(((last-start)/86400000+1)/7)*7;}
  else if(mode==='week'){start=addDays(cursor,-((cursor.getDay()+6)%7));count=7;}
  else {start=cursor;count=1;}
  root.style.gridTemplateColumns=mode==='day'?'1fr':'repeat(7,minmax(0,1fr))';
  $('calendarTitle').textContent=mode==='month'?cursor.toLocaleDateString('pt-BR',{month:'long',year:'numeric'}):mode==='week'?'Semana de '+start.toLocaleDateString('pt-BR',{day:'numeric',month:'long',year:'numeric'}):cursor.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  if(mode!=='day')for(const label of ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'])root.append(calendarNode('div','calendar-weekday',label));
  for(let i=0;i<count;i++){
    const day=addDays(start,i),key=isoDay(day),items=calendarJobs(key);
    const cell=calendarNode('button','calendar-day'+(key===today?' today':'')+(selectedDate===key?' selected':'')+(mode==='month'&&day.getMonth()!==cursor.getMonth()?' other-month':''));
    cell.type='button';cell.setAttribute('aria-label',day.toLocaleDateString('pt-BR')+' — '+items.length+' compromissos');
    cell.append(calendarNode('span','calendar-day-number',String(day.getDate())));
    for(const j of items.slice(0,mode==='month'?3:30)){
      cell.append(calendarNode('span','calendar-event '+j.status,(j.start_time?j.start_time.slice(0,5)+' ':'')+j.client_name));
    }
    if(items.length>3&&mode==='month')cell.append(calendarNode('span','calendar-event','+'+(items.length-3)+' outros'));
    cell.onclick=()=>{calendarDetails(key);renderCalendar();};
    root.append(cell);
  }
  if(selectedDate)calendarDetails(selectedDate);
}
$('calendarMode').onchange=()=>{selectedDate=null;renderCalendar();};
$('calendarPrev').onclick=()=>{const m=$('calendarMode').value;calendarDate=m==='month'?new Date(calendarDate.getFullYear(),calendarDate.getMonth()-1,1):addDays(calendarDate,m==='week'?-7:-1);selectedDate=null;renderCalendar();};
$('calendarNext').onclick=()=>{const m=$('calendarMode').value;calendarDate=m==='month'?new Date(calendarDate.getFullYear(),calendarDate.getMonth()+1,1):addDays(calendarDate,m==='week'?7:1);selectedDate=null;renderCalendar();};
$('calendarToday').onclick=()=>{calendarDate=new Date();selectedDate=isoDay(calendarDate);renderCalendar();};

function draw(){
  renderCalendar();
  const active=jobs.filter(j=>j.status!=='orcamento'&&j.status!=='cancelado');
  $('kConfirmed').textContent=active.filter(j=>j.status==='confirmado').length;
  $('kContracted').textContent=money(sum(active,j=>j.total_amount));
  $('kReceived').textContent=money(sum(transactions.filter(t=>t.kind==='receita'&&t.paid_at),t=>t.amount));
  $('kPending').textContent=money(sum(active,j=>balance(j)));
  $('kExpenses').textContent=money(sum(transactions.filter(t=>t.kind==='despesa'&&t.paid_at),t=>t.amount));
  $('kResult').textContent=money(sum(transactions.filter(t=>t.paid_at),t=>t.kind==='receita'?t.amount:-t.amount));
  $('tabAgenda').setAttribute('aria-pressed',String(activeTab==='agenda'));
  $('tabQuotes').setAttribute('aria-pressed',String(activeTab==='quotes'));
  const q=v('search').toLowerCase(),status=v('filter');
  const shown=jobs.filter(j=>(activeTab==='quotes'?j.status==='orcamento':j.status!=='orcamento')&&(!status||j.status===status)&&(!q||(j.client_name+' '+j.service_name).toLowerCase().includes(q))).sort((a,b)=>(a.event_date||'9999').localeCompare(b.event_date||'9999'));
  const tbody=$('jobRows');tbody.replaceChildren();
  if(!shown.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=7;td.textContent='Nenhum registro encontrado.';tr.append(td);tbody.append(tr);}
  for(const j of shown){
    const tr=document.createElement('tr');
    const values=[j.client_name+' — '+j.service_name,date(j.event_date)+(j.start_time?' '+j.start_time.slice(0,5):''),j.status==='orcamento'?'Orçamento: '+j.quote_status:j.status,money(j.total_amount),money(received(j.id)),money(balance(j))];
    for(const val of values){const td=document.createElement('td');td.textContent=val;tr.append(td);}
    const td=document.createElement('td');
    const edit=document.createElement('button');edit.textContent='Editar';edit.className='secondary';edit.onclick=()=>openEditor(j);
    const fin=document.createElement('button');fin.textContent='Financeiro';fin.className='secondary';fin.onclick=()=>{editingFinance=j.id;drawFinance(j.id);$('financePanel').scrollIntoView({behavior:'smooth'});};
    td.append(edit,fin);tr.append(td);tbody.append(tr);
  }
}
function openEditor(j=null){
  $('jobForm').reset();
  $('jobId').value=j?.id||'';
  const mapping={client:'client_name',phone:'client_phone',clientEmail:'client_email',service:'service_name',eventDate:'event_date',startTime:'start_time',location:'location',total:'total_amount',status:'status',quoteStatus:'quote_status',validUntil:'valid_until',description:'description'};
  for(const [id,key] of Object.entries(mapping))if(j&&j[key]!=null)$(id).value=key==='start_time'?String(j[key]).slice(0,5):j[key];
  if(!j){$('status').value=activeTab==='quotes'?'orcamento':'aguardando';$('total').value='0';}
  $('editorTitle').textContent=j?'Editar registro':'Novo '+(activeTab==='quotes'?'orçamento':'agendamento');
  $('deleteJob').hidden=!j;$('jobEditor').hidden=false;$('jobEditor').scrollIntoView({behavior:'smooth'});
}
function drawFinance(id){
  const j=jobs.find(x=>x.id===id);if(!j){$('financePanel').hidden=true;editingFinance=null;return;}
  $('financePanel').hidden=false;$('transactionJob').value=id;
  $('financeTitle').textContent='Financeiro — '+j.client_name+' / '+j.service_name;
  $('financeSummary').textContent='Contratado: '+money(j.total_amount)+' | Recebido: '+money(received(id))+' | A receber: '+money(balance(j))+' | Despesas pagas: '+money(expense(id));
  const body=$('transactionRows');body.replaceChildren();
  for(const t of transactions.filter(x=>x.job_id===id)){
    const tr=document.createElement('tr');
    for(const value of [t.kind==='receita'?'Entrada':'Saída',t.description||'—',money(t.amount),date(t.due_date),t.paid_at?date(t.paid_at):'Pendente']){
      const td=document.createElement('td');td.textContent=value;tr.append(td);
    }
    const td=document.createElement('td'),btn=document.createElement('button');btn.type='button';btn.className='secondary';btn.textContent=t.paid_at?'Reabrir':'Marcar pago';
    btn.onclick=()=>run(async()=>{await query(client.from('photo_job_transactions').update({paid_at:t.paid_at?null:new Date().toLocaleDateString('en-CA')}).eq('id',t.id));await refresh();notice('Movimentação atualizada.');});
    const del=document.createElement('button');del.type='button';del.className='danger';del.textContent='Excluir';
    del.onclick=()=>run(async()=>{if(!confirm('Excluir esta movimentação?'))return;await query(client.from('photo_job_transactions').delete().eq('id',t.id));await refresh();notice('Movimentação excluída.');});
    td.append(btn,del);tr.append(td);body.append(tr);
  }
}
$('jobForm').addEventListener('submit',e=>{e.preventDefault();run(async()=>{
  const data={client_name:v('client'),client_phone:v('phone'),client_email:v('clientEmail'),service_name:v('service'),event_date:v('eventDate')||null,start_time:v('startTime')||null,location:v('location'),status:v('status'),quote_status:v('quoteStatus'),description:v('description'),total_amount:Number(v('total')),valid_until:v('validUntil')||null,updated_at:new Date().toISOString()};
  if(!Number.isFinite(data.total_amount)||data.total_amount<0)throw Error('Valor inválido.');
  const id=v('jobId');
  const saved = id
    ? await query(client.from('photo_jobs').update(data).eq('id',id).select('id').single())
    : await query(client.from('photo_jobs').insert(data).select('id').single());
  if (!saved?.id) throw Error('O banco não confirmou a gravação do agendamento.');
  await refresh();
  if (!jobs.some(job => job.id === saved.id)) throw Error('O registro foi enviado, mas não apareceu na consulta. Verifique as permissões do Supabase.');
  $('jobEditor').hidden=true;notice('Agendamento gravado e conferido no banco de dados.');
});});
$('transactionForm').addEventListener('submit',e=>{e.preventDefault();run(async()=>{
  const amount=Number(v('amount'));if(!Number.isFinite(amount)||amount<=0)throw Error('Informe um valor maior que zero.');
  await query(client.from('photo_job_transactions').insert({job_id:v('transactionJob'),kind:v('kind'),description:v('transactionDescription'),amount,due_date:v('dueDate')||null,paid_at:v('paidAt')||null,payment_method:v('method')}));
  $('transactionForm').reset();await refresh();notice('Movimentação registrada.');
});});
$('deleteJob').onclick=()=>run(async()=>{const id=v('jobId');if(!id||!confirm('Excluir este serviço e todas as movimentações financeiras vinculadas?'))return;await query(client.from('photo_jobs').delete().eq('id',id));$('jobEditor').hidden=true;await refresh();notice('Registro excluído.');});
$('newJob').onclick=()=>openEditor();
$('cancelEditor').onclick=()=>$('jobEditor').hidden=true;
$('closeFinance').onclick=()=>{$('financePanel').hidden=true;editingFinance=null;};
$('tabAgenda').onclick=()=>{activeTab='agenda';$('filter').value='';draw();};
$('tabQuotes').onclick=()=>{activeTab='quotes';$('filter').value='';draw();};
$('search').oninput=draw;$('filter').onchange=draw;
$('logout').onclick=()=>run(async()=>{await auth.signOut();location.assign('./');});
run(async()=>{
  try{
    const status=await auth.restoreSession();
    if(!status.authorized){$('gate').hidden=false;notice('Acesso restrito.');return;}
    $('app').hidden=false;$('logout').hidden=false;
    await refresh();notice('Gestão conectada com segurança.');
  }catch(e){$('gate').hidden=false;notice(e.message||'Não foi possível carregar a gestão. Execute a migração 003 no Supabase.',true);}
});
