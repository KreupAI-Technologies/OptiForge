import { readFileSync } from 'fs';
import { execSync } from 'child_process';
const ROOT='/Users/sabujohnbosco/KreupAI/ManufacturingOS/b3-erp/frontend', APP=ROOT+'/src/app';
const pf=execSync(`find ${APP} -name page.tsx`,{encoding:'utf8'}).trim().split('\n');
const f2r=f=>{let r=f.replace(APP,'').replace(/\/page\.tsx$/,'').replace(/\/\([^)]+\)/g,'');return r===''?'/':r;};
const routes=new Set(),dyn=[];for(const f of pf){const r=f2r(f);routes.add(r);if(r.includes('['))dyn.push(r);}
function exists(p){p=p.split('?')[0].split('#')[0];if(p.length>1)p=p.replace(/\/$/,'');if(routes.has(p))return true;const s=p.split('/').filter(Boolean);for(const dr of dyn){const d=dr.split('/').filter(Boolean);if(d.some(x=>x.startsWith('[...'))){/*catch*/}else if(d.length!==s.length)continue;let ok=true;for(let i=0;i<d.length;i++){if(d[i]&&d[i].startsWith('['))continue;if(d[i]!==s[i]){ok=false;break;}}if(ok)return true;}return false;}
for(const file of ['src/components/Sidebar.tsx','src/components/MegaMenu.tsx']){
  const src=readFileSync(ROOT+'/'+file,'utf8');
  const links=new Set();let m;const re=/href:\s*['"]([^'"]+)['"]/g;
  while((m=re.exec(src)))if(m[1].startsWith('/')&&!m[1].startsWith('/api'))links.add(m[1]);
  const broken=[...links].filter(l=>!l.includes('${')&&!exists(l)).sort();
  console.log(`\n### ${file} — ${links.size} links, ${broken.length} BROKEN`);
  broken.forEach(b=>console.log('  '+b));
}
