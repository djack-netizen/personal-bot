function fN(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toLocaleString();}
function eH(s){const d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function openReel(u){if(u&&u.startsWith('http'))window.open(u,'_blank');}
function dlReel(u,b){if(!u)return;navigator.clipboard.writeText(u).then(()=>{if(b){const o=b.textContent;b.textContent='Copied!';b.style.background='var(--success)';b.style.borderColor='var(--success)';b.style.color='white';setTimeout(()=>{b.textContent=o;b.style.background='';b.style.borderColor='';b.style.color='';},1500);}}).catch(()=>{window.prompt('Copy:',u);});}
async function togglePosted(row,cb){
  const w=cb.closest('.toggle-wrap'),l=w.querySelector('.toggle-label'),t=cb.closest('.toggle'),p=cb.checked;
  l.textContent=p?'Posted':'Not Posted';l.className='toggle-label'+(p?' on':'');
  if(!GAS_URL){alert('Not configured');cb.checked=!p;l.textContent=!p?'Posted':'Not Posted';l.className='toggle-label'+(!p?' on':'');return;}
  t.classList.add('saving');
  try{await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({row:row,posted:p}),redirect:'follow'});const cl=A.find(c=>c.sheetRow===row);if(cl)cl.posted=p;}
  catch(err){cb.checked=!p;l.textContent=!p?'Posted':'Not Posted';l.className='toggle-label'+(!p?' on':'');alert('Failed');}
  t.classList.remove('saving');
}
document.getElementById('toolbar').addEventListener('click',e=>{const b=e.target.closest('.filter-btn');if(!b)return;CF=b.dataset.filter;document.querySelectorAll('.filter-btn').forEach(x=>x.className='filter-btn');if(CF==='HIGH')b.className='filter-btn active-red';else if(CF==='MEDIUM')b.className='filter-btn active-gold';else b.className='filter-btn active';rG();});
document.getElementById('searchBox').addEventListener('input',e=>{SQ=e.target.value;rG();});
buildDatePicker();fD();setInterval(fD,5*60*1000);
