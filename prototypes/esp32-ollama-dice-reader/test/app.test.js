"use strict";
const {test}=require("node:test");
const assert=require("node:assert/strict");
const {createApp}=require("../src/app");
const {createCamera,isJpeg}=require("../src/camera");
const {normalizeDice,createOllama}=require("../src/ollama");
const {changedFraction}=require("../src/vision");
const JPEG=Buffer.from([255,216,255,217]);

async function withServer(app,cb){
  const server=app.listen(0,"127.0.0.1");
  await new Promise(resolve=>server.once("listening",resolve));
  try{await cb("http://127.0.0.1:"+server.address().port);}
  finally{await new Promise(resolve=>server.close(resolve));}
}
test("valida tipo de dado, rango, confianza y cara superior",()=>{
  assert.equal(normalizeDice({dado:"d20",valor:21,confianza:"alta",cara_superior_visible:true}).valor,null);
  assert.equal(normalizeDice({dado:"d20",valor:17,confianza:"baja",cara_superior_visible:true}).valor,null);
  assert.equal(normalizeDice({dado:"d20",valor:17,confianza:"alta",cara_superior_visible:false}).valor,null);
  assert.equal(normalizeDice({dado:"d20",valor:17,confianza:"alta",cara_superior_visible:true}).valor,17);
});
test("diferencia entre fotogramas",()=>{
  assert.equal(changedFraction(Buffer.from([0,0,0]),Buffer.from([0,32,60])),2/3);
});
test("cámara acepta JPEG y rechaza HTML",async()=>{
  const capture=createCamera({url:"http://192.168.1.95/capture",fetchFn:async()=>new Response(JPEG,{headers:{"Content-Type":"image/jpeg"}})});
  assert.equal(isJpeg(await capture()),true);
  const invalid=createCamera({url:"http://192.168.1.95/capture",fetchFn:async()=>new Response("<html>no camera</html>",{headers:{"Content-Type":"text/html"}})});
  await assert.rejects(invalid(),/no JPEG/);
});
test("enlace con Ollama envía imagen en Base64 y esquema JSON",async()=>{
  const analyze=createOllama({
    url:"http://localhost:11434",model:"gemma3:4b",
    fetchFn:async(_,init)=>{
      const body=JSON.parse(init.body);
      assert.equal(body.model,"gemma3:4b");
      assert.equal(body.messages[0].images[0],JPEG.toString("base64"));
      assert.equal(body.format.type,"object");
      return Response.json({message:{content:JSON.stringify({
        dado:"d6",valor:5,cara_superior_visible:true,confianza:"alta",observacion:"Cara superior visible"
      })}});
    }
  });
  assert.equal((await analyze(JPEG)).valor,5);
});
test("API expone salud, lectura e imagen",async()=>{
  const {app}=createApp({
    capture:async()=>JPEG,
    analyze:async()=>({estado:"reconocido",dado:"d20",valor:14,confianza:"alta",observacion:"ok"})
  });
  await withServer(app,async base=>{
    assert.equal((await (await fetch(base+"/api/health")).json()).ok,true);
    const result=await (await fetch(base+"/api/read",{method:"POST"})).json();
    assert.equal(result.valor,14);
    assert.equal((await (await fetch(base+"/api/state")).json()).latest.valor,14);
    assert.match((await fetch(base+"/api/last-image")).headers.get("content-type"),/image\/jpeg/);
  });
});
test("bloquea lecturas simultáneas",async()=>{
  let finish;
  const wait=new Promise(resolve=>finish=resolve);
  const {app}=createApp({
    capture:async()=>JPEG,
    analyze:async()=>{await wait;return {valor:null};}
  });
  await withServer(app,async base=>{
    const first=fetch(base+"/api/read",{method:"POST"});
    await new Promise(resolve=>setTimeout(resolve,50));
    assert.equal((await fetch(base+"/api/read",{method:"POST"})).status,409);
    finish();
    assert.equal((await first).status,200);
  });
});
test("modo automático exige calibración",async()=>{
  const {app}=createApp({capture:async()=>JPEG,analyze:async()=>({})});
  await withServer(app,async base=>{
    assert.equal((await fetch(base+"/api/auto/start",{method:"POST"})).status,400);
  });
});
