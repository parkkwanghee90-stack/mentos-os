const fs=require('fs');
const env=fs.readFileSync(__dirname+'/../../.env','utf8');
const SUPA=(env.match(/VITE_SUPABASE_URL=(.*)/)||[])[1].trim().replace(/["']/g,'');
const SKEY=(env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)||[])[1].trim().replace(/["']/g,'');
(async()=>{
  const[,,folder,...pids]=process.argv;let ok=0,fail=[];
  for(const pid of pids){
    const body=fs.readFileSync(`/tmp/geo_out/${folder}__${pid}.json`);JSON.parse(body);
    const r=await fetch(`${SUPA}/storage/v1/object/mentos-assets/math_hints/${folder}/${pid}.json`,{method:'POST',headers:{Authorization:'Bearer '+SKEY,'Content-Type':'application/json','x-upsert':'true'},body});
    r.ok?ok++:fail.push(pid+' '+r.status);
  }
  console.log('업로드',ok+'/'+pids.length,fail.length?('실패:'+fail.join(',')):'');
})();
