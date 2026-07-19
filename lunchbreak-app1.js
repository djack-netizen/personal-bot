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

async function fD(){
  try{
    const r=await fetch(SU),t=await r.text(),j=JSON.parse(t.match(/google\.visualization\.Query\.setResponse\((.+)\);?/)[1]);
    const sheetData=j.table.rows.map((r,i)=>{
      const g=n=>{const c=r.c[n];return c?(c.f||c.v||''):'';};
      const sheetRow=i+2;
      return{
        rank:i+1,sheetRow:sheetRow,date:g(0),
        account:String(g(2)).replace(/^@/,''),
        tiktokHandle:String(g(3)).replace(/^@/,''),
        category:g(4),reelUrl:eU(g(5)),
        views:pN(g(6)),likes:pN(g(7)),comments:pN(g(8)),
        engagement:parseFloat(g(9))||0,
        priority:(g(10)||'').toUpperCase().trim(),
        onTikTok:g(11),
        posted:(g(12)||'').toLowerCase().includes('yes'),
        datePosted:g(13),notes:g(18),
        duration:pN(g(19)),
        textGrade:(g(20)||'').toUpperCase().trim(),
      };
    }).filter(c=>c.account);
    const sheetDates=new Set(sheetData.map(c=>c.date));
    const localOnly=(typeof LOCAL_DATA!=='undefined'?LOCAL_DATA:[]).filter(c=>!sheetDates.has(c.date));
    A=[...sheetData,...localOnly];rA();
  }catch(e){
    console.warn('Sheet failed, using local:',e);
    const ld=typeof LOCAL_DATA!=='undefined'?LOCAL_DATA:[];
    if(ld.length){A=ld;rA();}
    else{document.getElementById('clipGrid').innerHTML='<div class="empty-state"><div class="empty-state-title">Connection Issue</div><div class="empty-state-text">Refresh to retry.</div></div>';}
  }
}

function eU(v){if(!v)return'';const s=String(v);const m=s.match(/https?:\/\/[^\s"')]+/);return m?m[0]:s;}
function pN(v){if(!v)return 0;return parseInt(String(v).replace(/[^0-9.]/g,''))||0;}

function rA(){
  if(selectedDate&&A.length&&!A.some(c=>c.date===selectedDate)){
    const dates=[...new Set(A.map(c=>c.date))].sort().reverse();
    if(dates.length){selectedDate=dates[0];document.querySelectorAll('.date-chip').forEach(ch=>{ch.className='date-chip';if(ch.dataset.date===selectedDate)ch.className='date-chip active';});}
  }
  const dc=selectedDate?A.filter(c=>c.date===selectedDate):A;
  document.getElementById('todayCount').textContent=dc.length;
  document.getElementById('highCount').textContent=dc.filter(c=>c.priority==='HIGH').length;
  document.getElementById('allBadge').textContent=dc.length;
  document.getElementById('lastUpdated').textContent='Last scan: '+new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  rG();
}
function gF(){
  let c=selectedDate?A.filter(x=>x.date===selectedDate):[...A];
  if(CF==='HIGH'||CF==='MEDIUM'||CF==='LOW')c=c.filter(x=>x.priority===CF);
  else if(CF==='posted')c=c.filter(x=>x.posted);
  else if(CF==='unposted')c=c.filter(x=>!x.posted);
  if(SQ){const q=SQ.toLowerCase();c=c.filter(x=>x.account.toLowerCase().includes(q)||x.category.toLowerCase().includes(q));}
  return c;
}
function rG(){const g=document.getElementById('clipGrid'),cs=gF();if(!cs.length){g.innerHTML='<div class="empty-state"><div class="empty-state-title">No clips</div><div class="empty-state-text">Try a different date or filter.</div></div>';return;}g.innerHTML=cs.map(rC).join('');}
function rC(c){
  const ini=c.account.slice(0,2).toUpperCase(),eC=c.engagement>=5?'high-eng':'';
  const cc={'celebrity chefs':'#C8372D','cooking shows media':'#D4A843','cooking shows':'#D4A843','viral food creators':'#2D8B46','food beverage culture':'#6B4C8A','food culture':'#6B4C8A','bartenders mixology':'#2B4C7E'};
  const ac=cc[(c.category||'').toLowerCase()]||'#2B4C7E';
  const catLabel=(c.category||'Uncategorized').replace(/_/g,' ');
  let durHtml='';
  if(c.duration>0){const dk=c.duration>=60?'dur-ok':'dur-short',di=c.duration>=60?'\u2705':'\u26A0\uFE0F';durHtml=`<div class="card-stat"><div class="card-stat-value ${dk}">${di} ${c.duration}s</div><div class="card-stat-label">Duration</div></div>`;}
  let gb='';
  if(c.textGrade&&'ABCD'.includes(c.textGrade)){const gl={'A':'\uD83D\uDFE2','B':'\uD83D\uDD35','C':'\uD83D\uDFE1','D':'\uD83D\uDD34'};gb=`<span class="text-grade text-grade-${c.textGrade}">${gl[c.textGrade]} ${c.textGrade}</span>`;}
  let emb='';
  if(c.reelUrl){const m=c.reelUrl.match(/\/reel\/([^\/\?]+)/);if(m)emb=`<div class="reel-embed"><iframe src="https://www.instagram.com/reel/${m[1]}/embed/" frameborder="0" scrolling="no" allowtransparency="true" loading="lazy"></iframe></div>`;}
  try{return`<div class="card"><div class="card-header" onclick="openReel('${c.reelUrl}')"><div class="card-account"><div class="avatar" style="background:${ac}">${ini}</div><div><div class="account-name">@${c.account}${gb}</div><div class="account-category">${catLabel}${c.tiktokHandle?' \u00B7 TT: @'+c.tiktokHandle:''}</div></div></div>${c.priority?`<span class="priority-badge priority-${c.priority}">${c.priority}</span>`:''}</div>${emb}${c.notes?`<div class="card-caption">${eH(c.notes)}</div>`:''}\n<div class="card-stats"><div class="card-stat"><div class="card-stat-value">${fN(c.views)}</div><div class="card-stat-label">Views</div></div><div class="card-stat"><div class="card-stat-value">${fN(c.likes)}</div><div class="card-stat-label">Likes</div></div><div class="card-stat"><div class="card-stat-value">${fN(c.comments)}</div><div class="card-stat-label">Comments</div></div>${durHtml}<div class="card-stat"><div class="card-stat-value ${eC}">${c.engagement.toFixed(1)}%</div><div class="card-stat-label">Engagement</div></div></div>\n<div class="card-footer"><div class="card-date">${c.date||'-'}</div><div class="card-actions"><button class="card-action-btn" onclick="event.stopPropagation();openReel('${c.reelUrl}')">View</button><button class="card-action-btn download" onclick="event.stopPropagation();dlReel('${c.reelUrl}',this)">Copy</button><label class="toggle-wrap" onclick="event.stopPropagation()"><span class="toggle-label ${c.posted?'on':''}">${c.posted?'Posted':'Not Posted'}</span><label class="toggle" onclick="event.stopPropagation()"><input type="checkbox" ${c.posted?'checked':''} onchange="togglePosted(${c.sheetRow},this)"><span class="slider"></span></label></label></div></div></div>`;}
  catch(e){return'';}
}
