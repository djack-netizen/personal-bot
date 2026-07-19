/* OPN Juicebox - Live Data Layer */
var LOCAL_DATA={restaurants:[],hotels:[],spa:[],b2b:[]};
var DATA_URL='https://raw.githubusercontent.com/djack-netizen/personal-bot/main/opn-reels-live.json';
var GAS_URL='https://script.google.com/macros/s/AKfycbzA_lKg9H_HfLjZNfYPelTW5YL9_8p_JTWdIjYfnsXVUxSrv07ANkZP-TRr0YGkRdpx0g/exec';
function fetchLiveData(category){return fetch(DATA_URL+'?t='+Date.now()).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json();}).then(function(data){if(data.categories){Object.keys(data.categories).forEach(function(cat){LOCAL_DATA[cat]=data.categories[cat];});}return LOCAL_DATA[category]||[];}).catch(function(err){console.warn('Live data fetch failed:',err);return LOCAL_DATA[category]||[];});}
function submitShotList(payload){return fetch(GAS_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(payload),redirect:'follow'}).then(function(r){return r.json();}).then(function(data){if(data.success&&data.docUrl)return data.docUrl;throw new Error(data.error||'Unknown error');});}
