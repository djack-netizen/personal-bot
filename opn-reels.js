/* OPN Juicebox - App Logic v4 - Thumbnail Cards */
var currentCategory='restaurants',selectedReels=new Set(),docUrl='',calendarDate=new Date(),selectedShootDate=null,clockStartH=10,clockStartM=0,clockStartAM=true,clockEndH=2,clockEndM=0,clockEndAM=false;

function setCategory(cat){
  currentCategory=cat;
  document.querySelectorAll('.vending-btn').forEach(function(b){b.classList.toggle('active',b.dataset.cat===cat);});
  if(document.getElementById('results').classList.contains('show'))renderResults();
}

function initiate(){
  var btn=document.getElementById('initiateBtn');
  if(btn.disabled)return;
  btn.classList.add('running');
  btn.disabled=true;
  selectedReels.clear();
  updateSelBar();
  var overlay=document.getElementById('juiceboxOverlay');
  var juice=document.getElementById('jbJuice');
  var progress=document.getElementById('jbProgress');
  overlay.classList.add('active');
  juice.style.transition='none';
  juice.style.height='100%';
  juice.classList.remove('draining');
  createBubbles();
  var messages=['Connecting to Instagram...','Pulling latest reels...','Analyzing engagement...','Ranking by virality...','Loading results...'];
  progress.textContent=messages[0];
  setTimeout(function(){juice.style.transition='height 6s ease-in-out';juice.classList.add('draining');},200);
  var msgIdx=0;
  var msgInterval=setInterval(function(){msgIdx++;if(msgIdx<messages.length)progress.textContent=messages[msgIdx];},1200);
  var startTime=Date.now();
  fetchLiveData(currentCategory).then(function(){
    var elapsed=Date.now()-startTime;
    var remaining=Math.max(0,5000-elapsed);
    setTimeout(function(){
      clearInterval(msgInterval);
      overlay.classList.remove('active');
      juice.classList.remove('draining');
      btn.classList.remove('running');
      btn.disabled=false;
      renderResults();
      document.getElementById('results').classList.add('show');
      document.getElementById('results').scrollIntoView({behavior:'smooth'});
    },remaining);
  }).catch(function(err){
    console.error('Initiate error:',err);
    clearInterval(msgInterval);
    overlay.classList.remove('active');
    juice.classList.remove('draining');
    btn.classList.remove('running');
    btn.disabled=false;
    alert('Failed to load data. Please try again.');
  });
}

function createBubbles(){
  var c=document.getElementById('jbBubbles');
  c.innerHTML='';
  for(var i=0;i<12;i++){
    var b=document.createElement('div');
    b.className='jb-bubble';
    b.style.left=Math.random()*90+'%';
    b.style.bottom=Math.random()*40+'%';
    b.style.animationDelay=Math.random()*3+'s';
    b.style.animationDuration=(1+Math.random()*2)+'s';
    b.style.width=(4+Math.random()*8)+'px';
    b.style.height=b.style.width;
    c.appendChild(b);
  }
}

function renderResults(){
  var data=LOCAL_DATA[currentCategory]||[];
  var grid=document.getElementById('grid');
  var title=document.getElementById('resultsTitle');
  var count=document.getElementById('resultsCount');
  var catNames={restaurants:'Restaurant',hotels:'Hotel',spa:'Spa',b2b:'B2B Tech'};
  title.textContent='Top '+catNames[currentCategory]+' Reels';
  count.textContent=data.length+' results';
  if(!data.length){
    grid.innerHTML='<div style="text-align:center;padding:40px;color:#8A8A8A;font-family:Oswald;text-transform:uppercase;letter-spacing:1px">No reels found. Try again.</div>';
    return;
  }
  grid.innerHTML=data.map(function(item,i){
    var ini=item.account.slice(0,2).toUpperCase();
    var dlUrl='https://djack-netizen.github.io/personal-bot/dl.html?url='+encodeURIComponent(item.reelUrl);
    var isSel=selectedReels.has(currentCategory+':'+i);
    var thumbHtml='';
    if(item.thumbnail){
      thumbHtml='<div class="card-thumb-wrap" onclick="window.open(\''+item.reelUrl+'\',\'_blank\')">'+'<img class="card-thumb" src="'+item.thumbnail+'" alt="@'+item.account+' reel" loading="lazy" onerror="this.parentElement.innerHTML=\'<div class=card-thumb-fallback>\u25B6 View on Instagram</div>\'"/>'+'<div class="card-play-overlay"><div class="card-play-btn">\u25B6</div></div>'+'</div>';
    }else{
      thumbHtml='<div class="card-thumb-wrap card-thumb-fallback-wrap" onclick="window.open(\''+item.reelUrl+'\',\'_blank\')">'+'<div class="card-thumb-fallback">\u25B6 View on Instagram</div>'+'</div>';
    }
    return '<div class="card'+(isSel?' selected':'')+'" data-idx="'+i+'">'+
      '<div class="card-check"><input type="checkbox" '+(isSel?'checked':'')+' onchange="toggleSelect(\''+currentCategory+'\','+i+',this.checked)"></div>'+
      '<div class="card-top"><div class="avatar">'+ini+'</div><span class="username">@'+item.account+'</span></div>'+
      thumbHtml+
      '<div class="card-stats">'+
        '<div class="card-stat"><div class="stat-val">'+formatNum(item.views)+'</div><div class="stat-label">Views</div></div>'+
        '<div class="card-stat"><div class="stat-val">'+formatNum(item.likes)+'</div><div class="stat-label">Likes</div></div>'+
        '<div class="card-stat"><div class="stat-val">'+formatNum(item.comments)+'</div><div class="stat-label">Comments</div></div>'+
        '<div class="card-stat"><div class="stat-val">'+item.engagement+'%</div><div class="stat-label">Eng.</div></div>'+
      '</div>'+
      '<div class="card-footer"><span class="card-date">'+formatDate(item.date)+'</span><a class="card-dl" href="'+dlUrl+'" target="_blank">\u2B07 Download</a></div>'+
    '</div>';
  }).join('');
}

function toggleSelect(cat,idx,checked){
  var key=cat+':'+idx;
  if(checked)selectedReels.add(key);else selectedReels.delete(key);
  document.querySelectorAll('.card').forEach(function(c){
    var ci=parseInt(c.dataset.idx);
    c.classList.toggle('selected',selectedReels.has(currentCategory+':'+ci));
  });
  updateSelBar();
}

function clearSelection(){
  selectedReels.clear();
  document.querySelectorAll('.card').forEach(function(c){c.classList.remove('selected');});
  document.querySelectorAll('.card-check input').forEach(function(cb){cb.checked=false;});
  updateSelBar();
}

function updateSelBar(){
  var bar=document.getElementById('selBar');
  var count=document.getElementById('selCount');
  var n=selectedReels.size;
  bar.classList.toggle('show',n>0);
  count.textContent=n+' reel'+(n!==1?'s':'')+' selected';
}

function buildCalendar(){
  var wrap=document.getElementById('calendarWrap');
  var today=new Date();
  var year=calendarDate.getFullYear(),month=calendarDate.getMonth();
  var firstDay=new Date(year,month,1).getDay();
  var daysInMonth=new Date(year,month+1,0).getDate();
  var daysInPrev=new Date(year,month,0).getDate();
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var html='<div class="calendar-nav"><button onclick="navCalendar(-1)">&lt;</button><span class="calendar-month">'+months[month]+' '+year+'</span><button onclick="navCalendar(1)">&gt;</button></div><div class="calendar-grid">';
  ['Su','Mo','Tu','We','Th','Fr','Sa'].forEach(function(d){html+='<div class="calendar-dow">'+d+'</div>';});
  for(var i=firstDay-1;i>=0;i--)html+='<div class="calendar-day other-month">'+(daysInPrev-i)+'</div>';
  for(var d=1;d<=daysInMonth;d++){
    var cls='calendar-day';
    if(d===today.getDate()&&month===today.getMonth()&&year===today.getFullYear())cls+=' today';
    if(selectedShootDate&&d===selectedShootDate.getDate()&&month===selectedShootDate.getMonth()&&year===selectedShootDate.getFullYear())cls+=' selected';
    html+='<div class="'+cls+'" onclick="selectCalDay('+d+')">'+d+'</div>';
  }
  var totalCells=firstDay+daysInMonth;
  var remaining=(7-totalCells%7)%7;
  for(var i=1;i<=remaining;i++)html+='<div class="calendar-day other-month">'+i+'</div>';
  html+='</div>';
  wrap.innerHTML=html;
}

function navCalendar(dir){calendarDate.setMonth(calendarDate.getMonth()+dir);buildCalendar();}
function selectCalDay(day){selectedShootDate=new Date(calendarDate.getFullYear(),calendarDate.getMonth(),day);buildCalendar();}

function buildClock(id,h,m,ampm){
  var wrap=document.getElementById(id);
  var hStr=(h<10?'0':'')+h,mStr=(m<10?'0':'')+m;
  wrap.innerHTML='<div class="clock-segment"><button onclick="adjClock(\''+id+'\',\'h\',1)">&#9650;</button><div class="clock-digit">'+hStr+'</div><button onclick="adjClock(\''+id+'\',\'h\',-1)">&#9660;</button></div><div class="clock-colon">:</div><div class="clock-segment"><button onclick="adjClock(\''+id+'\',\'m\',1)">&#9650;</button><div class="clock-digit">'+mStr+'</div><button onclick="adjClock(\''+id+'\',\'m\',-1)">&#9660;</button></div><div class="clock-ampm" onclick="adjClock(\''+id+'\',\'ap\',0)">'+(ampm?'AM':'PM')+'</div>';
}

function adjClock(id,type,dir){
  if(id==='clockStart'){
    if(type==='h')clockStartH=((clockStartH-1+dir+12)%12)+1;
    else if(type==='m')clockStartM=(clockStartM+dir*15+60)%60;
    else clockStartAM=!clockStartAM;
    buildClock('clockStart',clockStartH,clockStartM,clockStartAM);
  }else{
    if(type==='h')clockEndH=((clockEndH-1+dir+12)%12)+1;
    else if(type==='m')clockEndM=(clockEndM+dir*15+60)%60;
    else clockEndAM=!clockEndAM;
    buildClock('clockEnd',clockEndH,clockEndM,clockEndAM);
  }
}

function openPlanModal(){
  document.getElementById('planModal').classList.add('active');
  document.getElementById('planForm').style.display='block';
  document.getElementById('planLoading').style.display='none';
  document.getElementById('planResult').style.display='none';
  buildCalendar();
  buildClock('clockStart',clockStartH,clockStartM,clockStartAM);
  buildClock('clockEnd',clockEndH,clockEndM,clockEndAM);
}

function closePlanModal(){document.getElementById('planModal').classList.remove('active');}

function generateShotList(){
  var client=document.getElementById('clientSelect').value;
  if(!client){alert('Please select a client');return;}
  if(!selectedShootDate){alert('Please select a shoot date');return;}
  var shootDate=selectedShootDate.toISOString().slice(0,10);
  var shootStart=(clockStartH<10?'0':'')+clockStartH+':'+(clockStartM<10?'0':'')+clockStartM+' '+(clockStartAM?'AM':'PM');
  var shootEnd=(clockEndH<10?'0':'')+clockEndH+':'+(clockEndM<10?'0':'')+clockEndM+' '+(clockEndAM?'AM':'PM');
  var shotTypes=[].slice.call(document.querySelectorAll('.checkbox-group input:checked')).map(function(cb){return cb.value;});
  var reels=[];
  selectedReels.forEach(function(key){
    var parts=key.split(':');
    var cat=parts[0],idx=parseInt(parts[1]);
    if(LOCAL_DATA[cat]&&LOCAL_DATA[cat][idx])reels.push(LOCAL_DATA[cat][idx]);
  });
  var payload={client:client,shootDate:shootDate,shootStart:shootStart,shootEnd:shootEnd,shotTypes:shotTypes,reels:reels,category:currentCategory};
  var html=generateShotListDoc(payload);
  var win=window.open('','_blank');
  if(win){win.document.write(html);win.document.close();}
  else{alert('Pop-up blocked. Please allow pop-ups for this site.');}
  closePlanModal();
}

document.getElementById('planModal').addEventListener('click',function(e){if(e.target===document.getElementById('planModal'))closePlanModal();});

function formatNum(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString();}
function formatDate(d){if(!d)return'';var dt=new Date(d+'T00:00:00');return dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
