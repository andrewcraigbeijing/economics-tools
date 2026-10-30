/* Same-origin hosting option for a single China-hosted Node process. */
import http from 'node:http';
import {readFile,mkdir,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isIP} from 'node:net';
import {handleRequest} from './core.mjs';
import {handleDiagramRequest} from './diagram-check.mjs';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function persistentQuota(directory,config={}){
 const filename=path.join(directory,'quota.json');let queue=Promise.resolve();
 const bound=(x,f,max)=>{const n=Number(x);return Number.isInteger(n)&&n>0?Math.min(n,max):f};
 return {idFromName:()=>'',get:()=>({fetch:async(_url,init)=>{const {client}=JSON.parse(init.body);if(!/^[a-f0-9]{64}$/.test(client))return new Response(null,{status:400});const job=queue.then(async()=>{const day=new Date().toISOString().slice(0,10),hour=new Date().toISOString().slice(0,13);let state;try{state=JSON.parse(await readFile(filename,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}if(!state||state.day!==day)state={day,total:0,clients:{}};const item=state.clients[client]?.hour===hour?state.clients[client]:{hour,count:0};if(state.total>=bound(config.RWE_DAILY_LIMIT,30,200)||item.count>=bound(config.RWE_IP_HOURLY_LIMIT,3,20))return new Response(null,{status:429,headers:{'Retry-After':'3600'}});state.total++;item.count++;state.clients[client]=item;await mkdir(directory,{recursive:true,mode:0o700});const temp=filename+'.'+process.pid+'.tmp';await writeFile(temp,JSON.stringify(state),{mode:0o600});await rename(temp,filename);return new Response(null,{status:204})});queue=job.catch(()=>{});return job}})};
}
export async function createChinaServer(config,dependencies={}){
 const origin=new URL(config.PUBLIC_ORIGIN||'http://127.0.0.1:3080');
 if(origin.pathname!=='/'||origin.search||origin.hash||origin.username||origin.password||(origin.protocol!=='https:'&&!(origin.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(origin.hostname))))throw new Error('PUBLIC_ORIGIN must be an HTTPS origin (HTTP is allowed only for loopback development).');
 const index=await readFile(path.join(project,'index.html'),'utf8');const assets=new Set(['index.html','style.css',...[...index.matchAll(/<script src="([^"?]+)(?:\?[^"\s]*)?"/g)].map(m=>m[1])]);
 const env={...config,ALLOWED_ORIGINS:origin.origin,DIAGRAM_VISION_PROVIDER:config.DIAGRAM_VISION_PROVIDER||'qwen',RWE_QUOTA:dependencies.quota||persistentQuota(config.QUOTA_DATA_DIR||path.join(project,'backend/.runtime'),config)};
 return http.createServer(async(req,res)=>{try{
  const url=new URL(req.url,origin);const pathname=url.pathname;
  if(['/api/diagram-check','/api/rwe','/diagram-health','/health'].includes(pathname)){
   const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value!==undefined)headers.set(key,Array.isArray(value)?value.join(','):value);
   // Never accept a client-supplied Cloudflare IP header on this standalone server.
   let address=req.socket.remoteAddress||'';if(config.TRUST_LOOPBACK_PROXY==='1'&&['127.0.0.1','::1','::ffff:127.0.0.1'].includes(address)){const forwarded=(req.headers['x-forwarded-for']||'').split(',')[0].trim();if(isIP(forwarded))address=forwarded}headers.set('CF-Connecting-IP',address);
   const request=new Request(new URL(pathname,origin),{method:req.method,headers,...(['GET','HEAD'].includes(req.method)?{}:{body:req,duplex:'half'})});
   const response=pathname==='/api/diagram-check'||pathname==='/diagram-health'?await handleDiagramRequest(request,env,dependencies):await handleRequest(request,env,dependencies);res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
  if(pathname==='/rwe-config.js'){
   const body='window.RWE_CONFIG = '+JSON.stringify({apiUrl:env.DEEPSEEK_API_KEY&&env.TAVILY_API_KEY?origin.origin+'/api/rwe':'',diagramApiUrl:env.DIAGRAM_VISION_API_KEY?origin.origin+'/api/diagram-check':''})+';';res.writeHead(200,{'Content-Type':'application/javascript','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:body);return;
  }
  const name=pathname==='/'?'index.html':pathname.slice(1);if(!assets.has(name)||name.includes('/')||name.includes('\\')){res.writeHead(404);res.end('Not found');return}
  const file=await readFile(path.join(project,name));res.writeHead(200,{'Content-Type':name.endsWith('.js')?'application/javascript':name.endsWith('.css')?'text/css':'text/html','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:file);
 }catch{res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify({error:'The service is temporarily unavailable.'}))}});
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const port=Number(process.env.PORT||3080);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('Invalid PORT');
 const server=await createChinaServer(process.env);server.listen(port,process.env.BIND_HOST||'127.0.0.1',()=>console.log('Econ Studio server started on the configured interface and port.'));
}
