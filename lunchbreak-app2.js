function fN(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toLocaleString();}
function eH(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}
function openReel(u){if(u&&u.startsWith('http'))window.open(u,'_blank');}
function dlReel(u,btn){if(!u||!u.startsWith('http'))return;var dlUrl='https://djack-netizen.github.io/personal-bot/dl.html?url='+encodeURIComponent(u);window.open(dlUrl,'_blank');if(btn){var orig=btn.textContent;btn.textContent='Opening...';setTimeout(function(){btn.textContent=orig;},1500);}}
async function togglePosted(row,cb){
  var w=cb.closest('.toggle-wrap'),l=w.querySelector('.toggle-label'),t=cb.closest('.toggle'),p=cb.checked;
  l.textContent=p?'Posted':'Not Posted';l.className='toggle-label'+(p?' on':'');
  if(!GAS_URL){alert('Not configured');cb.checked=!p;l.textContent=!p?'Posted':'Not Posted';l.className='toggle-label'+(!p?' on':'');return;}
  t.classList.add('saving');
  try{await fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify({row:row,posted:p}),redirect:'follow'});var cl=A.find(function(c){return c.sheetRow===row;});if(cl)cl.posted=p;}
  catch(err){cb.checked=!p;l.textContent=!p?'Posted':'Not Posted';l.className='toggle-label'+(!p?' on':'');alert('Failed');}
  t.classList.remove('saving');
}
async function runScan(btn){
  if(!GAS_URL){alert('GAS URL not configured');return;}
  var orig=btn.innerHTML;
  btn.innerHTML='\u23F3 Scanning...';btn.disabled=true;btn.style.opacity='0.6';
  try{
    var r=await fetch(GAS_URL+'?action=scan',{redirect:'follow'});
    var data=await r.json();
    if(data.ok){
      btn.innerHTML='\u2705 '+data.clips+' clips';
      setTimeout(function(){fD();btn.innerHTML=orig;btn.disabled=false;btn.style.opacity='1';},2500);
    }else{
      btn.innerHTML='\u274C Error';
      setTimeout(function(){btn.innerHTML=orig;btn.disabled=false;btn.style.opacity='1';},2000);
    }
  }catch(err){
    btn.innerHTML='\u274C Failed';
    setTimeout(function(){btn.innerHTML=orig;btn.disabled=false;btn.style.opacity='1';},2000);
  }
}
document.getElementById('toolbar').addEventListener('click',function(e){var b=e.target.closest('.filter-btn');if(!b)return;CF=b.dataset.filter;document.querySelectorAll('.filter-btn').forEach(function(x){x.className='filter-btn';});if(CF==='HIGH')b.className='filter-btn active-red';else if(CF==='MEDIUM')b.className='filter-btn active-gold';else b.className='filter-btn active';rG();});
document.getElementById('searchBox').addEventListener('input',function(e){SQ=e.target.value;rG();});
buildDatePicker();fD();setInterval(fD,5*60*1000);