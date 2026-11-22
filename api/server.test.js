import test from "node:test";
import assert from "node:assert/strict";
import {createApp} from "./server.js";
const origin="https://studio.example";
const valid={client_name:"Ana Silva",client_phone:"98999999999",service_id:"ensaios",consent:true};
async function withServer(run,fetchImpl=async()=>({ok:true})){
 const server=createApp({supabaseUrl:"https://example.supabase.co",serviceKey:"test-key",allowedOrigin:origin,fetchImpl});
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 try{await run("http://127.0.0.1:"+server.address().port);}
 finally{await new Promise(resolve=>server.close(resolve));}
}
test("recusa origem não autorizada",()=>withServer(async url=>{
 const r=await fetch(url+"/api/requests",{method:"POST",headers:{"content-type":"application/json","origin":"https://outro.example"},body:JSON.stringify(valid)});
 assert.equal(r.status,403);
}));
test("recebe solicitação válida sem confirmar reserva",()=>withServer(async url=>{
 const r=await fetch(url+"/api/requests",{method:"POST",headers:{"content-type":"application/json","origin"},body:JSON.stringify(valid)});
 assert.equal(r.status,202);assert.match((await r.json()).message,/nenhum horário foi reservado/);
}));
test("recusa solicitação inválida",()=>withServer(async url=>{
 const r=await fetch(url+"/api/requests",{method:"POST",headers:{"content-type":"application/json","origin"},body:JSON.stringify({...valid,consent:false})});
 assert.equal(r.status,400);
}));
test("não declara sucesso quando banco falha",()=>withServer(async url=>{
 const r=await fetch(url+"/api/requests",{method:"POST",headers:{"content-type":"application/json","origin"},body:JSON.stringify(valid)});
 assert.equal(r.status,503);
},async()=>({ok:false,status:500})));
