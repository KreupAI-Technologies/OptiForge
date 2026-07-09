import { readFileSync } from 'fs';
import { execSync } from 'child_process';
const ROOT='/Users/sabujohnbosco/KreupAI/ManufacturingOS/b3-erp/frontend', APP=ROOT+'/src/app';
const pageFiles=execSync(`find ${APP} -name page.tsx`,{encoding:'utf8'}).trim().split('\n');
const f2r=f=>{let r=f.replace(APP,'').replace(/\/page\.tsx$/,'').replace(/\/\([^)]+\)/g,'');return r===''?'/':r;};
const routes=new Set(),dyn=[];
for(const f of pageFiles){const r=f2r(f);routes.add(r);if(r.includes('['))dyn.push(r);}
function exists(pathRaw,prefix){let p=pathRaw.split('?')[0].split('#')[0];if(p.length>1)p=p.replace(/\/$/,'');if(routes.has(p))return true;const segs=p.split('/').filter(Boolean);for(const dr of dyn){const ds=dr.split('/').filter(Boolean);const cc=ds.some(s=>s.startsWith('[...'));if(!cc&&ds.length!==segs.length&&!prefix)continue;if(prefix&&ds.length<segs.length)continue;let ok=true;const n=prefix?Math.min(ds.length,segs.length):ds.length;for(let i=0;i<n;i++){if(ds[i]&&ds[i].startsWith('['))continue;if(ds[i]!==segs[i]){ok=false;break;}}if(ok)return true;}if(prefix){for(const r of routes)if(r===p||r.startsWith(p+'/'))return true;}return false;}
const files=execSync(`find ${ROOT}/src -name '*.tsx' -o -name '*.ts'`,{encoding:'utf8'}).trim().split('\n');
const pats=[/(?:href|to|path|route|url|link)\s*[:=]\s*[{]?\s*[`'"]([^`'"]*)[`'"]/g,/router\.(?:push|replace|prefetch)\s*\(\s*[`'"]([^`'"]*)[`'"]/g,/(?:redirect|navigate)\s*\(\s*[`'"]([^`'"]*)[`'"]/g];
const broken=new Map();
for(const f of files){
  if(f.includes('/src/services/')||f.includes('.service.ts'))continue; // API paths, not routes
  let src;try{src=readFileSync(f,'utf8');}catch{continue;}
  const t=new Set();for(const re of pats){re.lastIndex=0;let m;while((m=re.exec(src)))t.add(m[1]);}
  for(let x of t){
    if(!x.startsWith('/')||x.startsWith('/api')||x.startsWith('//')||x.startsWith('/attachments'))continue;
    if(/\.(png|jpe?g|svg|ico|css|js|pdf|webp|gif|woff2?|xlsx?|zip|docx?)$/i.test(x))continue;
    const isT=x.includes('${');
    let key=x;
    if(isT){const pre=x.split('${')[0].replace(/\/$/,'');if(pre.length<=1)continue;if(exists(pre,true))continue;key=pre+'/[id]';}
    else{if(exists(x,false))continue;}
    const rel=f.replace(ROOT+'/','');
    if(!broken.has(key))broken.set(key,new Set());broken.get(key).add(rel);
  }
}
const navRe=/(Sidebar|MegaMenu|CommandPalette|GlobalSearch|MobileBottomNav|MobileNavigation|KeyboardShortcuts|ShopFloorLayout|BreadcrumbNav)/;
const nav=[],hub=[],list=[];
for(const[k,fs] of broken){const arr=[...fs];const isNav=arr.some(a=>navRe.test(a));const isPage=arr.some(a=>a.startsWith('src/app/'));
  if(isNav)nav.push([k,fs]);else if(k.includes('/[id]'))list.push([k,fs]);else hub.push([k,fs]);}
const pr=(t,a)=>{console.log(`\n=== ${t} (${a.length}) ===`);for(const[k,fs] of a.sort((x,y)=>y[1].size-x[1].size))console.log(`${k}  <- ${[...fs].join(', ')}`);};
console.log('TOTAL distinct broken page routes:',broken.size);
pr('A. NAVIGATION-COMPONENT 404s (menus/search/shortcuts — user always sees these)',nav);
pr('B. HUB/QUICK-ACTION 404s (dashboard tiles & static links)',hub);
pr('C. LIST-ROW VIEW/EDIT 404s (row buttons -> unbuilt view/edit pages)',list);
