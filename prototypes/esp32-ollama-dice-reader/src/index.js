"use strict";
require("dotenv").config();
const {createCamera}=require("./camera");
const {createOllama}=require("./ollama");
const {createApp}=require("./app");
function numeric(name,fallback){
  const value=Number(process.env[name]);
  return Number.isFinite(value)&&value>0?value:fallback;
}
const host=process.env.HOST||"127.0.0.1";
const port=numeric("PORT",3000);
const model=process.env.OLLAMA_MODEL||"gemma3:4b";
const capture=createCamera({
  url:process.env.CAMERA_URL||"http://192.168.1.95/capture",
  timeoutMs:numeric("CAMERA_TIMEOUT_MS",10000)
});
const analyze=createOllama({
  url:process.env.OLLAMA_URL||"http://127.0.0.1:11434",
  model,timeoutMs:numeric("OLLAMA_TIMEOUT_MS",120000)
});
const {app}=createApp({
  capture,analyze,model,
  autoConfig:{
    intervalMs:numeric("AUTO_INTERVAL_MS",350),
    stableMs:numeric("AUTO_STABLE_MS",1000),
    occupancyThreshold:numeric("AUTO_OCCUPANCY_THRESHOLD",0.018),
    emptyThreshold:numeric("AUTO_EMPTY_THRESHOLD",0.008),
    motionThreshold:numeric("AUTO_MOTION_THRESHOLD",0.015)
  }
});
app.listen(port,host,()=>{
  console.log("Lector de dados: http://"+host+":"+port);
  console.log("Modelo Ollama: "+model);
});
