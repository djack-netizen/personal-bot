const SID='1TxAcALNsWi2PRQUZ2X7pOkE_hexkuL4779_p02r8xm8',HN='Daily Picks',SU=`https://docs.google.com/spreadsheets/d/${SID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(HN)}`;
// Apps Script web app URL — must be deployed as "Anyone" (not domain-restricted)
const GAS_URL='https://script.google.com/a/macros/openventures.io/s/AKfycbzA_lKg9H_HfLjZNfYPelTW5YL9_8p_JTWdIjYfnsXVUxSrv07ANkZP-TRr0YGkRdpx0g/exec';
let A=[],CF='all',SQ='',selectedDate=null;

// Local fallback data for days when Composio Sheets API is down
const LOCAL_DATA=[
  // Jul 19
  {date:'2026-07-19',rank:1,account:'thrillist',tiktokHandle:'',category:'Food Beverage Culture',reelUrl:'https://www.instagram.com/reel/DWHMOS8Dr0m/',views:741090,likes:1316,comments:34,engagement:0.2,priority:'HIGH',onTikTok:'No',posted:false,datePosted:'',notes:'',duration:92,textGrade:'A',sheetRow:9980},
  {date:'2026-07-19',rank:2,account:'guyfieri',tiktokHandle:'flavortown',category:'Celebrity Chefs',reelUrl:'https://www.instagram.com/reel/DafoiD6gfX5/',views:159787,likes:1432,comments:36,engagement:0.9,priority:'HIGH',onTikTok:'No',posted:false,datePosted:'',notes:'',duration:69,textGrade:'B',sheetRow:9981},
  {date:'2026-07-19',rank:3,account:'foodnetwork',tiktokHandle:'',category:'Cooking Shows Media',reelUrl:'https://www.instagram.com/reel/Da8YmengI_h/',views:249831,likes:2598,comments:52,engagement:1.1,priority:'HIGH',onTikTok:'No',posted:false,datePosted:'',notes:'',duration:76,textGrade:'B',sheetRow:9982},
  {date:'2026-07-19',rank:4,account:'davidchang',tiktokHandle:'',category:'Celebrity Chefs',reelUrl:'https://www.instagram.com/reel/DVY69J-jw1d/',views:156720,likes:1515,comments:100,engagement:1.0,priority:'HIGH',onTikTok:'No',posted:false,datePosted:'',notes:'',duration:60,textGrade:'A',sheetRow:9983},
  {date:'2026-07-19',rank:5,account:'davidchang',tiktokHandle:'',category:'Celebrity Chefs',reelUrl:'https://www.instagram.com/reel/DWpb6-hFsdM/',views:148522,likes:2409,comments:51,engagement:1.7,priority:'HIGH',onTikTok:'No',posted:false,datePosted:'',notes:'',duration:88,textGrade:'A',sheetRow:9984},
  {date:'2026-07-19',rank:6,account:'thrillist',tiktokHandle:'',category:'Food Beverage Culture',reelUrl:'https://www.instagram.com/reel/DadZ_ywOGMz/',views:99916,likes:1564,comments:49,engagement:1.6,priority:'MEDIUM',onTikTok:'No',posted:false,datePosted:'',notes:'',duration:98,textGrade:'A',sheetRow:9985},
  // Jul 18
  {date:'2026-07-18',rank:1,account:'masterchefonfox',tiktokHandle:'masterchefonfox',category:'Cooking Shows',reelUrl:'https://www.instagram.com/reel/Da1SazWzyOX/',views:488687,likes:18325,comments:142,engagement:3.8,priority:'HIGH',onTikTok:'',posted:false,datePosted:'',notes:'',duration:109,textGrade:'',sheetRow:9990},
  {date:'2026-07-18',rank:2,account:'infatuation',tiktokHandle:'infatuation',category:'Food Culture',reelUrl:'https://www.instagram.com/reel/Dakydx1OdzW/',views:412504,likes:7236,comments:67,engagement:1.8,priority:'HIGH',onTikTok:'',posted:false,datePosted:'',notes:'',duration:278,textGrade:'',sheetRow:9991},
  {date:'2026-07-18',rank:3,account:'guyfieri',tiktokHandle:'guyfieri',category:'Celebrity Chefs',reelUrl:'https://www.instagram.com/reel/DaOqbKPprUE/',views:320093,likes:11844,comments:318,engagement:3.8,priority:'HIGH',onTikTok:'',posted:false,datePosted:'',notes:'',duration:62,textGrade:'',sheetRow:9992},
  {date:'2026-07-18',rank:4,account:'infatuation',tiktokHandle:'infatuation',category:'Food Culture',reelUrl:'https://www.instagram.com/reel/DM8Kbp-uin-/',views:315615,likes:10257,comments:370,engagement:3.4,priority:'MEDIUM',onTikTok:'',posted:false,datePosted:'',notes:'',duration:81,textGrade:'',sheetRow:9993},
  {date:'2026-07-18',rank:5,account:'guyfieri',tiktokHandle:'guyfieri',category:'Celebrity Chefs',reelUrl:'https://www.instagram.com/reel/DZqGJsIielS/',views:301104,likes:7198,comments:133,engagement:2.4,priority:'MEDIUM',onTikTok:'',posted:false,datePosted:'',notes:'',duration:64,textGrade:'',sheetRow:9994},
];