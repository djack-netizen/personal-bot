const SID='1TxAcALNsWi2PRQUZ2X7pOkE_hexkuL4779_p02r8xm8',HN='Daily Picks',SU=`https://docs.google.com/spreadsheets/d/${SID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(HN)}`;
const GAS_URL='https://script.google.com/a/macros/openventures.io/s/AKfycbzA_lKg9H_HfLjZNfYPelTW5YL9_8p_JTWdIjYfnsXVUxSrv07ANkZP-TRr0YGkRdpx0g/exec';
let A=[],CF='all',SQ='',selectedDate=null;

function buildDatePicker(){
  const bar=document.getElementById('dateBar');
  const today=new Date();
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let html='';
  for(let i=0;i<15;i++){
    const d=new Date(today);d.setDate(today.getDate()-i);
    const iso=d.toISOString().slice(0,10);
    const label=i===0?'Today':i===1?'Yesterday':`${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}`;
    html+=`<button class="date-chip${i===0?' active':''}" data-date="${iso}">${label}</button>`;
  }
  bar.innerHTML=html;
  selectedDate=today.toISOString().slice(0,10);
  bar.addEventListener('click',e=>{
    const chip=e.target.closest('.date-chip');if(!chip)return;
    selectedDate=chip.dataset.date;
    bar.querySelectorAll('.date-chip').forEach(c=>c.className='date-chip');
    chip.className='date-chip active';
    rG();
  });
}

async function loadFromSheet(){
  let clips=[];
  try{
    const csvUrl='https://docs.google.com/spreadsheets/d/'+SID+'/export?format=csv&gid=0';
    const r=await fetch(csvUrl);
    if(!r.ok) throw new Error('CSV fetch failed');
    const txt=await r.text();
    if(txt.startsWith('<')) throw new Error('Got HTML redirect');
    const rows=txt.split('\n');
    for(let i=1;i<rows.length;i++){
      if(!rows[i].trim())continue;
      const cols=[];let cur='',inQ=false;
      for(let j=0;j<rows[i].length;j++){
        const ch=rows[i][j];
        if(ch==='"'){inQ=!inQ;}
        else if(ch===','&&!inQ){cols.push(cur);cur='';}
        else{cur+=ch;}
      }
      cols.push(cur);
      if(!cols[2])continue;
      const pn=v=>{if(!v)return 0;return parseInt(String(v).replace(/[^0-9.]/g,''))||0;};
      clips.push({
        date:cols[0]||'',rank:pn(cols[1]),account:String(cols[2]||'').replace(/^@/,''),
        tiktokHandle:String(cols[3]||'').replace(/^@/,''),category:cols[4]||'',
        reelUrl:cols[5]||'',views:pn(cols[6]),likes:pn(cols[7]),comments:pn(cols[8]),
        engagement:parseFloat(cols[9])||0,priority:(cols[10]||'').toUpperCase().trim(),
        onTikTok:cols[11]||'',posted:(cols[12]||'').toLowerCase().includes('yes'),
        datePosted:cols[13]||'',notes:cols[18]||'',duration:pn(cols[19]),
        textOverlayRisk:(cols[20]||'').toUpperCase().trim()
      });
    }
  }catch(e){
    try{
      const r2=await fetch(SU),t=await r2.text(),j=JSON.parse(t.match(/google\.visualization\.Query\.setResponse\((.+)\);?/)[1]);
      clips=j.table.rows.map((r,i)=>{
        const g=n=>{const c=r.c[n];return c?(c.f||c.v||''):'';};
        return{date:g(0),rank:i+1,account:String(g(2)).replace(/^@/,''),tiktokHandle:String(g(3)).replace(/^@/,''),category:g(4),reelUrl:eU(g(5)),views:pN(g(6)),likes:pN(g(7)),comments:pN(g(8)),engagement:parseFloat(g(9))||0,priority:(g(10)||'').toUpperCase().trim(),onTikTok:g(11),posted:(g(12)||'').toLowerCase().includes('yes'),datePosted:g(13),notes:g(18),duration:pN(g(19)),textOverlayRisk:(g(20)||'').toUpperCase().trim()};
      }).filter(c=>c.account);
    }catch(e2){}
  }
  return clips;
}

async function loadFromTodayJson(){
  try{
    const tr=await fetch('today.json?t='+Date.now());
    if(tr.ok){
      return await tr.json();
    }
  }catch(e){}
  return[];
}

async function fD(){
  // Load both sources in parallel — today.json ALWAYS loads
  const [sheetClips, todayClips] = await Promise.all([loadFromSheet(), loadFromTodayJson()]);
  
  let clips = sheetClips;
  // Merge today.json clips (dedup by URL)
  const urls=new Set(clips.map(c=>c.reelUrl));
  todayClips.forEach(c=>{if(!urls.has(c.reelUrl))clips.push(c);});
  
  A=clips.map((c,i)=>({
    rank:c.rank||i+1,sheetRow:i+2,date:c.date||'',
    account:String(c.account||'').replace(/^@/,''),
    tiktokHandle:String(c.tiktokHandle||'').replace(/^@/,''),
    category:c.category||'',reelUrl:c.reelUrl||'',
    views:c.views||0,likes:c.likes||0,comments:c.comments||0,
    engagement:c.engagement||0,priority:(c.priority||'').toUpperCase().trim(),
    onTikTok:c.onTikTok||'',posted:!!c.posted,datePosted:c.datePosted||'',
    notes:c.notes||'',duration:c.duration||0,
    textOverlayRisk:(c.textOverlayRisk||'').toUpperCase().trim(),
  })).filter(c=>c.account);
  
  if(!A.length){
    document.getElementById('clipGrid').innerHTML='<div class="empty-state"><div class="empty-state-title">No clips found</div><div class="empty-state-text">Run a scan to populate clips.</div></div>';
    return;
  }
  rA();
}

function eU(v){if(!v)return'';const s=String(v);const m=s.match(/https?:\/\/[^\s"')]+/);return m?m[0]:s;}
function pN(v){if(!v)return 0;return parseInt(String(v).replace(/[^0-9.]/g,''))||0;}

function rA(){
  const dateClips=selectedDate?A.filter(c=>c.date===selectedDate):A;
  const high=dateClips.filter(c=>c.priority==='HIGH');
  document.getElementById('todayCount').textContent=dateClips.length;
  document.getElementById('highCount').textContent=high.length;
  document.getElementById('allBadge').textContent=dateClips.length;
  document.getElementById('lastUpdated').textContent='Last scan: '+new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  rG();
}

function gF(){
  let c=selectedDate?A.filter(x=>x.date===selectedDate):[...A];
  if(CF==='HIGH'||CF==='MEDIUM'||CF==='LOW')c=c.filter(x=>x.priority===CF);
  else if(CF==='posted')c=c.filter(x=>x.posted);
  else if(CF==='unposted')c=c.filter(x=>!x.posted);
  if(SQ){const q=SQ.toLowerCase();c=c.filter(x=>x.account.toLowerCase().includes(q)||x.category.toLowerCase().includes(q)||(x.notes||'').toLowerCase().includes(q));}
  return c;
}

function rG(){
  const g=document.getElementById('clipGrid'),cs=gF();
  if(!cs.length){g.innerHTML='<div class="empty-state"><div class="empty-state-title">No clips for this day</div><div class="empty-state-text">Try picking a different date or changing filters.</div></div>';return;}
  g.innerHTML=cs.map(rC).join('');
}

function rC(c){
  const ini=c.account.slice(0,2).toUpperCase(),eC=c.engagement>=5?'high-eng':'';
  const cc={'celebrity_chefs':'#C8372D','cooking_shows_media':'#D4A843','viral_food_creators':'#2D8B46','food_beverage_culture':'#6B4C8A','bartenders_mixology':'#2B4C7E','chef':'#C8372D','cocktail':'#2B4C7E','food media':'#D4A843','bartender':'#6B4C8A','food creator':'#2D8B46','cinematic_restaurants':'#1A3456'};
  const ac=cc[(c.category||'').toLowerCase()]||'#2B4C7E';
  const catLabel=(c.category||'Uncategorized').replace(/_/g,' ');
  const dur=c.duration;
  let durHtml='';
  if(dur>0){
    const durClass=dur>=60?'dur-ok':'dur-short';
    const durIcon=dur>=60?'✅':'⚠️';
    durHtml=`<div class="card-stat"><div class="card-stat-value ${durClass}">${durIcon} ${dur}s</div><div class="card-stat-label">Duration</div></div>`;
  }
  let overlayBadge='';
  if(c.textOverlayRisk==='HIGH') overlayBadge='<span class="overlay-badge overlay-HIGH">⚠ Text Heavy</span>';
  else if(c.textOverlayRisk==='MEDIUM') overlayBadge='<span class="overlay-badge overlay-MEDIUM">Text Risk</span>';
  try{return`<div class="card" onclick="openReel('${c.reelUrl}')"><div class="card-header"><div class="card-account"><div class="avatar" style="background:${ac}">${ini}</div><div><div class="account-name">@${c.account}${overlayBadge}</div><div class="account-category">${catLabel}${c.tiktokHandle?' · TT: @'+c.tiktokHandle:''}</div></div></div>${c.priority?`<span class="priority-badge priority-${c.priority}">${c.priority}</span>`:''}</div>${c.notes?`<div class="card-caption">${eH(c.notes)}</div>`:''}
<div class="card-stats"><div class="card-stat"><div class="card-stat-value">${fN(c.views)}</div><div class="card-stat-label">Views</div></div><div class="card-stat"><div class="card-stat-value">${fN(c.likes)}</div><div class="card-stat-label">Likes</div></div><div class="card-stat"><div class="card-stat-value">${fN(c.comments)}</div><div class="card-stat-label">Comments</div></div>${durHtml}<div class="card-stat"><div class="card-stat-value ${eC}">${c.engagement.toFixed(1)}%</div><div class="card-stat-label">Engagement</div></div></div>
<div class="card-footer"><div class="card-date">${c.date||'-'}</div><div class="card-actions"><button class="card-action-btn" onclick="event.stopPropagation();openReel('${c.reelUrl}')">View Reel</button><button class="card-action-btn download" onclick="event.stopPropagation();dlReel('${c.reelUrl}',this)">Copy Link</button><label class="toggle-wrap" onclick="event.stopPropagation()"><span class="toggle-label ${c.posted?'on':''}">${c.posted?'Posted':'Not Posted'}</span><label class="toggle" onclick="event.stopPropagation()"><input type="checkbox" ${c.posted?'checked':''} onchange="togglePosted(${c.sheetRow},this)"><span class="slider"></span></label></label></div></div></div>`;}catch(e){return'';}
}

function fN(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toLocaleString();}
function eH(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function openReel(u){if(u&&u.startsWith('http'))window.open(u,'_blank');}
function dlReel(u,btn){if(!u||!u.startsWith('http'))return;navigator.clipboard.writeText(u).then(()=>{if(btn){const orig=btn.textContent;btn.textContent='Copied!';btn.style.background='var(--success)';btn.style.borderColor='var(--success)';btn.style.color='white';setTimeout(()=>{btn.textContent=orig;btn.style.background='';btn.style.borderColor='';btn.style.color='';},1500);}}).catch(()=>{window.prompt('Copy this link:',u);});}

async function togglePosted(row,cb){
  const wrap=cb.closest('.toggle-wrap');
  const label=wrap.querySelector('.toggle-label');
  const toggle=cb.closest('.toggle');
  const posted=cb.checked;
  label.textContent=posted?'Posted':'Not Posted';
  label.className='toggle-label'+(posted?' on':'');
  if(!GAS_URL){alert('Apps Script URL not configured.');cb.checked=!posted;label.textContent=!posted?'Posted':'Not Posted';label.className='toggle-label'+(!posted?' on':'');return;}
  toggle.classList.add('saving');
  try{
    await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({row:row,posted:posted}),redirect:'follow'});
    const clip=A.find(c=>c.sheetRow===row);
    if(clip) clip.posted=posted;
  }catch(err){
    cb.checked=!posted;
    label.textContent=!posted?'Posted':'Not Posted';
    label.className='toggle-label'+(!posted?' on':'');
    alert('Failed to save. Try again.');
  }
  toggle.classList.remove('saving');
}

document.getElementById('toolbar').addEventListener('click',e=>{const b=e.target.closest('.filter-btn');if(!b)return;CF=b.dataset.filter;document.querySelectorAll('.filter-btn').forEach(x=>x.className='filter-btn');if(CF==='HIGH')b.className='filter-btn active-red';else if(CF==='MEDIUM')b.className='filter-btn active-gold';else b.className='filter-btn active';rG();});
document.getElementById('searchBox').addEventListener('input',e=>{SQ=e.target.value;rG();});
buildDatePicker();
fD();
setInterval(fD,5*60*1000);
