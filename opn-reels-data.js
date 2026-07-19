/* OPN Juicebox - Live Data Layer v3 */
var LOCAL_DATA={restaurants:[],hotels:[],spa:[],b2b:[]};
var DATA_URL='https://raw.githubusercontent.com/djack-netizen/personal-bot/main/opn-reels-live.json';
function fetchLiveData(category){return fetch(DATA_URL+'?t='+Date.now()).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(data){if(data.categories){Object.keys(data.categories).forEach(function(cat){LOCAL_DATA[cat]=data.categories[cat];});}return LOCAL_DATA[category]||[];}).catch(function(err){console.warn('Live data fetch failed:',err);return LOCAL_DATA[category]||[];});}

var CREATIVE_ANGLES={
  restaurants:[
    'Focus on plating close-up with slow motion pour/drizzle',
    'Show the chef\'s hands in action, tight crop, moody lighting',
    'Table-level wide shot showing full spread with guests reaching',
    'Behind-the-bar POV: shaker/stir/pour with ambient chatter audio',
    'Walk-in reveal: push-in from exterior to seated table in one take',
    'Ingredient close-ups cutting to final dish (match-cut transitions)',
    'Server carry: follow the plate from kitchen window to table drop',
    'Steam/sizzle macro: extreme close-up of heat hitting the pan',
    'Guest reaction: candid joy when dish arrives (no staging)',
    'Time-lapse: empty table to full service in 10 seconds',
    'Cocktail build: overhead pour sequence with color contrast',
    'Flames/torching: dramatic brulee or flambe moment',
    'Stacking/layering: dessert or burger assembly in slow motion',
    'Ambient vibe: panning exterior at golden hour, hear the buzz inside',
    'Menu flip: close-up hands opening menu, rack focus to dish'
  ],
  hotels:[
    'Room reveal: open door push-in, bed to view in one smooth take',
    'Rooftop/pool sunrise timelapse, 5 seconds, punchy colors',
    'Lobby walk-through: Steadicam following a guest checking in',
    'Amenity detail shots: toiletries, robe texture, pillow fluff',
    'Window view reveal: curtains pull back, city/ocean/mountains',
    'Night mode: moody hallway lighting, leading lines to room door',
    'Bath draw: overhead shot of water filling with petals/bubbles',
    'Balcony morning: coffee pour with skyline in soft focus behind',
    'Concierge interaction: genuine smile, key handoff moment',
    'Pool splash: slow-mo dive or cannonball with golden light',
    'Sunset transition: same angle, day to night in 3-second blend',
    'Minibar/wine moment: uncork, pour, cheers with view',
    'Spa reveal: steam room door opens, light floods through',
    'Turndown service: chocolate on pillow, lamp click, intimate',
    'Elevator doors open to penthouse: dramatic wide reveal'
  ],
  spa:[
    'Oil pour on skin: extreme macro, warm tones, ASMR-friendly',
    'Steam room reveal: glass door opens, fog rolls out',
    'Treatment sequence: hands working shoulders in rhythm',
    'Product texture: cream swirl on marble, satisfying close-up',
    'Before/after glow: same angle, soft lighting, subtle difference',
    'Water feature: trickling fountain with bokeh background',
    'Hot stone placement: deliberate, meditative, slow motion',
    'Robe walk: guest walks barefoot down serene hallway',
    'Face mask application: brush strokes on skin, overhead',
    'Candle lighting sequence: multiple wicks in a row',
    'Nature sounds + visual: outdoor treatment with wind in trees',
    'Hand/foot detail: nail care or reflexology close-up',
    'Sauna bucket pour: steam explosion in slow motion',
    'Tea service: post-treatment cup being poured, steam rising',
    'Breathing moment: chest rises and falls, total calm'
  ],
  b2b:[
    'Screen recording: fast-forward workflow with cursor highlights',
    'Before/after split screen: messy process vs clean solution',
    'Team reaction: genuine "aha" moment in a meeting room',
    'Desk setup reveal: organized workspace, tool in context',
    'Notification pop: satisfying UI animation with sound design',
    'Whiteboard to execution: sketch becomes real product',
    'Speed demo: complete a task in under 15 seconds',
    'Dashboard zoom: data changing in real-time, numbers climbing',
    'Unboxing/onboarding: first-time user experience in 30 seconds',
    'Collaboration moment: two screens, ping/response in real-time',
    'Pain point dramatization: frustrated without, smooth with',
    'CEO/founder 10-second hot take: one insight, authentic',
    'Customer quote overlay: testimonial text on product footage',
    'Integration montage: tools connecting, data flowing',
    'Milestone celebration: team Slack/notification of big win'
  ]
};

function getCreativeSuggestion(category, account, index){
  var angles=CREATIVE_ANGLES[category]||CREATIVE_ANGLES.restaurants;
  var hash=(account.length*7+index*13)%angles.length;
  return angles[hash];
}

function generateTimeSlots(startTime, endTime, numShots){
  // Parse times like "10:00 AM" into minutes
  function parseTime(t){
    var parts=t.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if(!parts)return 0;
    var h=parseInt(parts[1]),m=parseInt(parts[2]),ampm=parts[3].toUpperCase();
    if(ampm==='PM'&&h!==12)h+=12;
    if(ampm==='AM'&&h===12)h=0;
    return h*60+m;
  }
  function formatTime(mins){
    var h=Math.floor(mins/60)%24,m=mins%60;
    var ampm=h>=12?'PM':'AM';
    if(h>12)h-=12;if(h===0)h=12;
    return (h<10?'0':'')+h+':'+(m<10?'0':'')+m+' '+ampm;
  }
  var startMins=parseTime(startTime),endMins=parseTime(endTime);
  if(endMins<=startMins)endMins+=24*60;
  var totalDuration=endMins-startMins;
  var slotDuration=Math.floor(totalDuration/numShots);
  var slots=[];
  for(var i=0;i<numShots;i++){
    var slotStart=startMins+(i*slotDuration);
    var slotEnd=slotStart+slotDuration;
    slots.push(formatTime(slotStart%1440)+' - '+formatTime(slotEnd%1440));
  }
  return slots;
}

function generateShotListDoc(payload){
  var client=payload.client,shootDate=payload.shootDate,shootStart=payload.shootStart,shootEnd=payload.shootEnd,shotTypes=payload.shotTypes,reels=payload.reels,category=payload.category||'restaurants';
  var dateStr=new Date(shootDate+'T12:00:00').toLocaleDateString('en-US',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  var totalShots=reels.length+shotTypes.length;
  var timeSlots=generateTimeSlots(shootStart,shootEnd,totalShots);
  
  var html='<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Shot List - '+client+' - '+shootDate+'</title>';
  html+='<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Barlow,sans-serif;padding:40px;max-width:1000px;margin:0 auto;color:#1a1a1a;line-height:1.5}h1{font-family:Oswald,sans-serif;font-size:28px;color:#C8372D;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px}h2{font-family:Oswald,sans-serif;font-size:20px;color:#0F1923;margin:28px 0 12px;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #D4A853;padding-bottom:6px}.subtitle{font-size:14px;color:#666;margin-bottom:24px}table{width:100%;border-collapse:collapse;margin:12px 0 24px;font-size:12px}th{background:#0F1923;color:#fff;padding:8px 10px;text-align:left;font-family:Oswald,sans-serif;font-weight:500;letter-spacing:0.5px}td{padding:8px 10px;border-bottom:1px solid #e8e0d4;vertical-align:top}tr:nth-child(even){background:#fdf6ec}.details-table td{border:1px solid #e8e0d4;padding:8px 12px}.details-table td:first-child{font-weight:600;width:140px;background:#f8f4ee}.suggestion{font-style:italic;color:#2B4C7E;font-size:11px;margin-top:4px}.time-col{font-family:Oswald,sans-serif;font-weight:500;white-space:nowrap;color:#C8372D;font-size:11px}.notes{margin-top:24px}.notes p{margin:6px 0;padding:4px 0}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #e8e0d4;font-size:11px;color:#8a8a8a}.print-btn{position:fixed;top:20px;right:20px;padding:10px 20px;background:#C8372D;color:#fff;border:none;border-radius:6px;font-family:Oswald,sans-serif;font-size:14px;cursor:pointer;text-transform:uppercase;letter-spacing:1px}.print-btn:hover{background:#E8564D}@media print{.print-btn{display:none}}</style>';
  html+='<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600&family=Barlow:wght@400;500;600&display=swap" rel="stylesheet">';
  html+='</head><body>';
  html+='<button class="print-btn" onclick="window.print()">Print / Save PDF</button>';
  html+='<h1>OPN AGENCY \u2014 SHOT LIST</h1>';
  html+='<p class="subtitle">Generated by Juicebox: OPN</p>';
  html+='<table class="details-table"><tr><td>Client</td><td>'+client+'</td></tr><tr><td>Shoot Date</td><td>'+dateStr+'</td></tr><tr><td>Time</td><td>'+shootStart+' \u2014 '+shootEnd+'</td></tr><tr><td>Shot Types</td><td>'+(shotTypes.join(', ')||'General')+'</td></tr><tr><td>Total Shots</td><td>'+totalShots+'</td></tr></table>';
  
  html+='<h2>SHOT SCHEDULE</h2>';
  html+='<table><tr><th>Time</th><th>#</th><th>Shot</th><th>Inspired By</th><th>Our Angle (How to Differentiate)</th><th>Type</th><th>Status</th></tr>';
  var n=0;
  for(var i=0;i<reels.length;i++){
    var r=reels[i];
    var suggestion=getCreativeSuggestion(category,r.account,i);
    var slot=timeSlots[n]||'';
    html+='<tr><td class="time-col">'+slot+'</td><td>'+(n+1)+'</td><td>Recreate @'+r.account+' ('+fmtN(r.views)+' views)<br><a href="'+r.reelUrl+'" target="_blank" style="font-size:10px;color:#2B4C7E">View original</a></td><td>@'+r.account+'</td><td class="suggestion">'+suggestion+'</td><td>'+(shotTypes[i%shotTypes.length]||'General')+'</td><td>\u2610</td></tr>';
    n++;
  }
  for(var t=0;t<shotTypes.length;t++){
    var slot=timeSlots[n]||'';
    html+='<tr><td class="time-col">'+slot+'</td><td>'+(n+1)+'</td><td>'+shotTypes[t]+' \u2014 B-roll / establishing</td><td>Original</td><td class="suggestion">Capture ambient + detail shots to use as transitions between main content</td><td>'+shotTypes[t]+'</td><td>\u2610</td></tr>';
    n++;
  }
  html+='</table>';
  
  html+='<h2>NOTES</h2><div class="notes"><p>\u2022 Equipment:</p><p>\u2022 Talent/Staff needed:</p><p>\u2022 Props/Setup:</p><p>\u2022 Posting schedule:</p></div>';
  html+='<div class="footer">Generated by Juicebox: OPN \u2014 '+new Date().toLocaleDateString()+'</div>';
  html+='</body></html>';
  return html;
}
function fmtN(n){if(n>=1e6)return(n/1e6).toFixed(1)+'M';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString();}
