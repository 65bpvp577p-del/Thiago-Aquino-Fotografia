import {createServer} from "node:http";
import {validateRequest} from "./request-validation.js";

const PORT=Number(process.env.PORT||8787);
const SUPABASE_URL=(process.env.STUDIO_SUPABASE_URL||"").replace(/\/$/,"");
const SERVICE_KEY=process.env.STUDIO_SUPABASE_SERVICE_KEY||"";
const ALLOWED_ORIGIN=process.env.STUDIO_ALLOWED_ORIGIN||"";
const ADMIN_USER_ID=process.env.STUDIO_ADMIN_USER_ID||"";
const ANON_KEY=process.env.STUDIO_SUPABASE_ANON_KEY||"";
const MAX_BYTES=12000;
const buckets=new Map();
function send(res,status,body,headers={}) {
  res.writeHead(status,{"content-type":"application/json; charset=utf-8","cache-control":"no-store",...headers});
  res.end(JSON.stringify(body));
}
function rateLimited(ip){
  const now=Date.now(), previous=buckets.get(ip)||[];
  const recent=previous.filter(t=>now-t<60000);
  recent.push(now);buckets.set(ip,recent);
  if(buckets.size>5000)for(const [key,times] of buckets)if(times.every(t=>now-t>60000))buckets.delete(key);
  return recent.length>5;
}
async function readJson(req){
  let length=0,chunks=[];
  for await(const chunk of req){length+=chunk.length;if(length>MAX_BYTES)throw Object.assign(new Error("Corpo muito grande"),{status:413});chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString("utf8"));}
  catch{throw Object.assign(new Error("JSON inválido"),{status:400});}
}
export function createApp({supabaseUrl=SUPABASE_URL,serviceKey=SERVICE_KEY,allowedOrigin=ALLOWED_ORIGIN,adminUserId=ADMIN_USER_ID,anonKey=ANON_KEY,fetchImpl=fetch}={}){
  return createServer(async(req,res)=>{
    const origin=req.headers.origin;
    const cors=origin&&origin===allowedOrigin?{"access-control-allow-origin":origin,"vary":"Origin"}:{};
    if(req.url==="/health"&&req.method==="GET")return send(res,200,{ok:true},cors);
    if(req.url==="/api/admin/requests"&&req.method==="GET"){
      if(!allowedOrigin||origin!==allowedOrigin)return send(res,403,{error:"Origem não autorizada"});
      if(!supabaseUrl||!serviceKey||!adminUserId||!anonKey)return send(res,503,{error:"Painel não configurado"},cors);
      const token=(req.headers.authorization||"").match(/^Bearer ([A-Za-z0-9._~-]+)$/)?.[1];
      if(!token)return send(res,401,{error:"Autenticação necessária"},cors);
      try{
        const identity=await fetchImpl(supabaseUrl+"/auth/v1/user",{headers:{"apikey":anonKey,"authorization":"Bearer "+token},signal:AbortSignal.timeout(10000)});
        if(!identity.ok)return send(res,401,{error:"Sessão inválida"},cors);
        const user=await identity.json();
        if(user.id!==adminUserId)return send(res,403,{error:"Acesso não autorizado"},cors);
        const result=await fetchImpl(supabaseUrl+"/rest/v1/studio_requests?select=id,created_at,client_name,client_phone,service_id,preferred_date,preferred_time,location,details,status&order=created_at.desc&limit=100",{
          headers:{"apikey":serviceKey,"authorization":"Bearer "+serviceKey},signal:AbortSignal.timeout(10000)
        });
        if(!result.ok)return send(res,503,{error:"Não foi possível carregar os pedidos"},cors);
        return send(res,200,{requests:await result.json()},cors);
      }catch(error){console.error("Falha na leitura administrativa",error.name||"Error");return send(res,503,{error:"Painel temporariamente indisponível"},cors);}
    }
    if(req.url!=="/api/requests")return send(res,404,{error:"Não encontrado"},cors);
    if(!allowedOrigin||!origin||origin!==allowedOrigin)return send(res,403,{error:"Origem não autorizada"});
    if(req.method==="OPTIONS"){
      res.writeHead(204,{...cors,"access-control-allow-methods":"POST, OPTIONS","access-control-allow-headers":"Content-Type","access-control-max-age":"600"});return res.end();
    }
    if(req.method!=="POST")return send(res,405,{error:"Método não permitido"},cors);
    if(!String(req.headers["content-type"]||"").toLowerCase().startsWith("application/json"))return send(res,415,{error:"Envie JSON"},cors);
    const ip=req.socket.remoteAddress||"unknown"; // não confiar em X-Forwarded-For sem proxy validado
    if(rateLimited(ip))return send(res,429,{error:"Muitas solicitações. Tente mais tarde."},cors);
    if(!supabaseUrl||!serviceKey)return send(res,503,{error:"Atendimento temporariamente indisponível"},cors);
    try{
      const payload=await readJson(req);
      if(payload.website) return send(res,202,{message:"Solicitação recebida para análise. Nenhum horário foi reservado."},cors);
      const result=validateRequest(payload);
      if(!result.ok)return send(res,400,{error:"Dados inválidos",fields:result.errors},cors);
      const row={...result.value,consent_at:new Date().toISOString(),status:"new"};
      const upstream=await fetchImpl(supabaseUrl+"/rest/v1/studio_requests",{
        method:"POST",headers:{"apikey":serviceKey,"authorization":"Bearer "+serviceKey,"content-type":"application/json","prefer":"return=minimal"},
        body:JSON.stringify(row),signal:AbortSignal.timeout(10000)
      });
      if(!upstream.ok){console.error("Falha ao salvar solicitação",upstream.status);return send(res,503,{error:"Não foi possível registrar a solicitação"},cors);}
      return send(res,202,{message:"Solicitação recebida. Aguarde nosso contato; nenhum horário foi reservado."},cors);
    }catch(error){
      if(error.status)return send(res,error.status,{error:error.message},cors);
      console.error("Erro no atendimento",error.name||"Error");
      return send(res,503,{error:"Atendimento temporariamente indisponível"},cors);
    }
  });
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
  createApp().listen(PORT,()=>console.log("API do estúdio iniciada na porta "+PORT));
}
