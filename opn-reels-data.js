/* OPN Juicebox - Live Data Layer v4 */
var LOCAL_DATA={restaurants:[],hotels:[],spa:[],b2b:[]};
var DATA_URL='https://raw.githubusercontent.com/djack-netizen/personal-bot/main/opn-reels-live.json';
var EXTRA_URL='https://raw.githubusercontent.com/djack-netizen/personal-bot/main/opn-reels-extra.json';
function fetchLiveData(category){var t='?t='+Date.now();return Promise.all([fetch(DATA_URL+t).then(function(r){return r.ok?r.json():{};}),fetch(EXTRA_URL+t).then(function(r){return r.ok?r.json():{};})])
.then(function(results){var data=results[0],extra=results[1];if(data.categories){Object.keys(data.categories).forEach(function(cat){LOCAL_DATA[cat]=data.categories[cat];});}if(extra){Object.keys(extra).forEach(function(cat){if(extra[cat]&&extra[cat].length)LOCAL_DATA[cat]=extra[cat];});}return LOCAL_DATA[category]||[];}).catch(function(err){console.warn('Live data fetch failed:',err);return LOCAL_DATA[category]||[];});}
