"use strict";
const { thumbnail, changedFraction } = require("./vision");

class AutoReader {
  constructor({capture,analyze,onReading,config={},log=console}) {
    Object.assign(this,{capture,analyze,onReading,log});
    this.intervalMs=config.intervalMs??350;
    this.stableMs=config.stableMs??1000;
    this.occupancyThreshold=config.occupancyThreshold??0.018;
    this.emptyThreshold=config.emptyThreshold??0.008;
    this.motionThreshold=config.motionThreshold??0.015;
    this.running=false; this.calibrated=false;
    this.baseline=null; this.previous=null; this.phase="detenido";
    this.lastError=null; this.lastOccupancy=null; this.lastMotion=null;
    this.timer=null; this.stableSince=null; this.occupiedFrames=0; this.emptyFrames=0;
    this.tickInProgress=false;
  }
  status(){
    return {running:this.running,calibrated:this.calibrated,phase:this.phase,
      lastError:this.lastError,occupancy:this.lastOccupancy,motion:this.lastMotion};
  }
  async calibrate(){
    if(this.running||this.tickInProgress)throw new Error("Detené el modo automático antes de calibrar");
    const image=await this.capture();
    this.baseline=await thumbnail(image);
    this.calibrated=true;this.previous=this.baseline;this.phase="calibrado";this.lastError=null;
    return image;
  }
  start(){
    if(!this.calibrated)throw new Error("Primero calibrá con la zona vacía");
    if(this.running)return;
    this.running=true;this.phase="esperando_dado";this.previous=this.baseline;
    this.occupiedFrames=0;this.emptyFrames=0;this.lastError=null;
    this.schedule(0);
  }
  stop(){
    this.running=false;this.phase="detenido";
    if(this.timer)clearTimeout(this.timer);
    this.timer=null;
  }
  schedule(delay){
    if(this.running)this.timer=setTimeout(()=>this.tick(),delay);
  }
  async tick(){
    if(!this.running||this.tickInProgress)return;
    this.tickInProgress=true;
    try {
      const image=await this.capture();
      const frame=await thumbnail(image);
      if(!this.running)return;
      const occupancy=changedFraction(this.baseline,frame);
      const motion=changedFraction(this.previous,frame);
      this.previous=frame;
      this.lastOccupancy=Number(occupancy.toFixed(4));
      this.lastMotion=Number(motion.toFixed(4));
      this.lastError=null;
      if(this.phase==="esperando_dado"){
        this.occupiedFrames=occupancy>=this.occupancyThreshold?this.occupiedFrames+1:0;
        if(this.occupiedFrames>=2){this.phase="estabilizando";this.stableSince=Date.now();}
      } else if(this.phase==="estabilizando"){
        if(occupancy<this.emptyThreshold){this.phase="esperando_dado";this.occupiedFrames=0;}
        else if(motion>=this.motionThreshold)this.stableSince=Date.now();
        else if(Date.now()-this.stableSince>=this.stableMs){
          this.phase="analizando";
          try { const result=await this.analyze(image);this.onReading(image,result); }
          catch(error){this.lastError=error.message;this.log.error("Lectura automática:",error.message);}
          if(this.running){this.phase="esperando_retiro";this.emptyFrames=0;}
        }
      } else if(this.phase==="esperando_retiro"){
        this.emptyFrames=occupancy<=this.emptyThreshold?this.emptyFrames+1:0;
        if(this.emptyFrames>=4){
          this.phase="esperando_dado";this.occupiedFrames=0;this.stableSince=null;
        }
      }
    } catch(error){
      this.lastError=error.message;
      this.log.error("Monitoreo automático:",error.message);
    } finally {
      this.tickInProgress=false;
      this.schedule(this.intervalMs);
    }
  }
}
module.exports={AutoReader};
