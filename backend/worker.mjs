import {handleRequest} from './core.mjs';
import {handleDiagramRequest} from './diagram-check.mjs';
export default {fetch(request,env){const path=new URL(request.url).pathname;return path==='/api/diagram-check'||path==='/diagram-health'?handleDiagramRequest(request,env):handleRequest(request,env)}};
// One Durable Object provides an atomic global daily cap across all Worker instances.
export class RweQuota {
  constructor(ctx,env){this.ctx=ctx;this.env=env}
  async fetch(request){
    const {client}=await request.json();if(typeof client!=='string'||!/^[a-f0-9]{64}$/.test(client))return new Response(null,{status:400});
    const now=new Date(),day=now.toISOString().slice(0,10),hour=now.toISOString().slice(0,13);
    const bound=(v,f,max)=>{const n=Number(v);return Number.isInteger(n)&&n>0?Math.min(n,max):f};
    const daily=bound(this.env.RWE_DAILY_LIMIT,30,200),perHour=bound(this.env.RWE_IP_HOURLY_LIMIT,3,20);
    const allowed=await this.ctx.storage.transaction(async tx=>{
      let state=await tx.get('quota');if(!state||state.day!==day)state={day,total:0,clients:{}};
      const c=state.clients[client]?.hour===hour?state.clients[client]:{hour,count:0};
      if(state.total>=daily||c.count>=perHour)return false;
      state.total++;c.count++;state.clients[client]=c;await tx.put('quota',state);return true;
    });
    // An alarm removes quota data after this UTC day; no raw IP or query is retained.
    if(allowed)await this.ctx.storage.setAlarm(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1)+60000);
    return new Response(null,{status:allowed?204:429,headers:allowed?{}:{'Retry-After':'3600'}});
  }
  async alarm(){
    const today=new Date().toISOString().slice(0,10);
    const keep=await this.ctx.storage.transaction(async tx=>{const state=await tx.get('quota');if(state&&state.day>=today)return true;await tx.delete('quota');return false});
    if(keep){const now=new Date();await this.ctx.storage.setAlarm(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()+1)+60000)}
  }
}
