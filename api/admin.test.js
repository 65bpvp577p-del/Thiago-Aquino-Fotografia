import test from "node:test";
import assert from "node:assert/strict";
import {createApp} from "./server.js";
const origin="https://studio.example";
async function run(request,fetchImpl){
 const app=createApp({supabaseUrl:"https://example.supabase.co",serviceKey:"private",anonKey:"public",adminUserId:"owner-id",allowedOrigin:origin,fetchImpl});
 await new Promise(resolve=>app.listen(0,"127.0.0.1",resolve));
 try{return await request("http://127.0.0.1:"+app.address().port);}
 finally{await new Promise(resolve=>app.close(resolve));}
}
test("painel recusa sessão ausente",async()=>{
 const response=await run(url=>fetch(url+"/api/admin/requests",{headers:{origin}}));
 assert.equal(response.status,401);
});
test("painel recusa outro usuário",async()=>{
 const response=await run(url=>fetch(url+"/api/admin/requests",{headers:{origin,authorization:"Bearer token"}}),async()=>({ok:true,json:async()=>({id:"other-id"})}));
 assert.equal(response.status,403);
});
test("painel devolve pedidos apenas ao administrador",async()=>{
 const calls=[];
 const response=await run(url=>fetch(url+"/api/admin/requests",{headers:{origin,authorization:"Bearer token"}}),async(url,options)=>{
  calls.push({url,options});
  return url.includes("/auth/v1/user")?{ok:true,json:async()=>({id:"owner-id"})}:{ok:true,json:async()=>[{id:"request-1",status:"new"}]};
 });
 assert.equal(response.status,200);
 assert.equal((await response.json()).requests[0].id,"request-1");
 assert.equal(calls.length,2);
});
test("painel não retorna dados se a origem for diferente",async()=>{
 const response=await run(url=>fetch(url+"/api/admin/requests",{headers:{origin:"https://other.example",authorization:"Bearer token"}}));
 assert.equal(response.status,403);
});
