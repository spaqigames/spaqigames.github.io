// Builds one page per game (<id>/index.html) and sitemap.xml.
// Run from the site root:  node tools/build-pages.mjs
// Game text comes from tools/desc/<id>.txt (the Play Store full description).
// Screenshots live in img/<id>/1.jpg, 2.jpg ...
// When a game goes live on Play, change its status here AND in index.html, then rerun.
import fs from "node:fs";
import path from "node:path";

const SITE = "https://spaqigames.github.io";
const YT_CHANNEL = "https://www.youtube.com/channel/UCo7da2hQ9MoqaId3OvBrw-Q";

// title = what shows in Google results: game name + the words people search for.
const GAMES = [
  {id:"big-bass-chuck", name:"Big Bass Chuck", pkg:"bigbasschuck", yt:"lF2-GQLeyz8", status:"live", app:false,
   title:"Big Bass Chuck – 3D Fishing Game for Android",
   genre:["Fishing","Simulation","Sports"],
   meta:"Free 3D fishing game for Android. Fish 250+ real places built from real maps, from Lake Erie to Loch Ness, with lake monsters, Sasquatch and plenty of jokes."},
  {id:"wally", name:"Wally and the Wobblelands", pkg:"wally", yt:"Oy1qVvWPEck", status:"live", app:false,
   title:"Wally and the Wobblelands – Retro Side-Scrolling Action RPG for Android",
   genre:["Action","Adventure","Platformer","RPG"],
   meta:"A funny retro side-scrolling action RPG for Android in the classic Monster World style: 20 chapters, 20 bosses, swords, spells and offline play."},
  {id:"eldimir-keepers", name:"Eldimir: Keepers of the Light", pkg:"eldimirkeepers", yt:"3RtMaeiSxco", status:"live", app:false,
   title:"Eldimir: Keepers of the Light – 3D Tower Defense Game for Android",
   genre:["Tower defense","Strategy"],
   meta:"A funny, gentle 3D tower defense game for Android: 14 chapters, 8 towers with upgrade choices, a wizard, a very good snail, and bosses who are redeemed, not destroyed."},
  {id:"pip", name:"Pip & the Mumblewood", pkg:"pipwizard", yt:"-UE1Xa0MGX8", status:"live", app:false,
   title:"Pip & the Mumblewood – Funny Wizard Adventure Game for Android",
   genre:["Adventure","Action","Puzzle"],
   meta:"A funny top-down wizard adventure for Android: 14 chapters of dungeons, puzzles and boss fights, five spells, dance-offs and a stolen moon. Plays offline."},
  {id:"eldimir", name:"Eldimir & Mossback", pkg:"eldimir", yt:"nrk4Mkl9e9g", status:"live", app:false,
   title:"Eldimir & Mossback – 3D Wizard Adventure Game for Android",
   genre:["Adventure","Action"],
   meta:"A magical, funny 3D adventure for Android: an old wizard and his dog-sized snail bring the light back to an enchanted forest. 14 chapters, 5 bosses, Christian faith themes."},
  {id:"lil-ribbit", name:"Lil' Ribbit", pkg:"lilribbit", yt:"N5pKOyZUUV8", status:"live", app:false,
   title:"Lil' Ribbit – 3D Frog Pet Game for Kids on Android",
   genre:["Virtual pet","Casual","Kids"],
   meta:"A 3D virtual pet game for kids on Android: hatch an egg, raise a tadpole and grow your own silly frog. Your pet never dies. Pond Adventure, mini-games and 40 jokes."},
  {id:"lil-ribbit-2", name:"Lil' Ribbit 2", pkg:"lilribbit2", yt:"hKwjEPnQjnY", status:"live", app:false,
   title:"Lil' Ribbit 2: The Great Giggle Heist – 3D Frog Platformer for Android",
   genre:["Platformer","Adventure","Kids"],
   meta:"A big, silly 3D frog platformer for Android: 10 worlds, 30 levels, 10 bosses and 12 hats. Rescue the tadpoles and stop Snivelwart the sneezing toad wizard."},
  {id:"capital-quest", name:"Capital Quest", pkg:"statesandcapitals", yt:"09aeS_hQgv0", status:"live", app:false,
   title:"Capital Quest – US State Capitals Quiz Game for Android",
   genre:["Trivia","Educational","Geography"],
   meta:"Learn all 50 US state capitals on a real map, then world capitals and flags. Daily challenge, map quiz and custom quizzes for teachers and parents. Android, works offline."},
  {id:"birdwatch", name:"Songbird Safari", pkg:"birdwatch", yt:"T767CXsbol0", status:"later", app:false,
   title:"Songbird Safari – Relaxing 3D Birdwatching Game with Real Bird Songs",
   genre:["Simulation","Educational","Nature"],
   meta:"A calm 3D birdwatching game for Android: six habitats, 62 real bird species of the northeastern US, real recorded bird songs, a field guide, birdsong sleep sounds and a bird alarm clock."},
  {id:"frogeffects", name:"FrogEffects", pkg:"frogeffects", yt:"50kgJY3Cljk", status:"later", app:true, category:"EducationalApplication",
   title:"FrogEffects – 3D Frogs with Real Frog Calls and Facts",
   genre:["Education","Science","Animals"],
   meta:"Meet 52 species of frogs and toads in 3D on Android. Tap for facts, hear each species' real recorded call, take the frog quiz, and fall asleep or wake up to real frog calls. Great for kids and teachers."},
  {id:"walkies", name:"Walkies", pkg:"walkies", yt:"", status:"later", app:false,
   title:"Walkies – Dog Walking Game for Seniors on Android",
   genre:["Simulation","Pets","Health & fitness"],
   meta:"A dog ownership game for older adults: pick from 261 breeds, raise a pup, take it on real walks that count your steps, and meet other walkers nearby. Big, clear buttons."},
  {id:"kitchen-catastrophe", name:"Kitchen Catastrophe", pkg:"kitchencatastrophe", yt:"AeeF-5wp85M", status:"later", app:false,
   title:"Kitchen Catastrophe – 3D Cooking Game for Kids on Android",
   genre:["Cooking","Action","Kids"],
   meta:"A funny 3D cooking game for kids: cook 20 real recipes with mini-games, then fight the food that comes alive. Real recipe cards to make at home. Android and Chromebook."},
  {id:"petalwing", name:"Petalwing: My Butterfly Garden", pkg:"petalwing", yt:"hTV5OB6ZlBM", status:"soon", app:false,
   title:"Petalwing – Butterfly Pet Game for Kids on Android",
   genre:["Simulation","Pets","Educational","Kids"],
   meta:"Raise a real butterfly from egg to caterpillar, chrysalis and wings. 8 real species, 8 gardens, 6 mini-games and real butterfly facts. A gentle 3D pet game for kids on Android."},
  {id:"prism-wings", name:"Prism Wings", pkg:"prismwings", yt:"hGLbEV_9uNg", status:"soon", app:false,
   title:"Prism Wings – Butterfly Rail Shooter Game for Android",
   genre:["Action","Shooter","Arcade","Fantasy"],
   meta:"A magical 3D rail-flight shooter: fly a butterfly through 10 realms and 20 levels, lock on with homing darts, cast colourful spells and beat 10 bosses. Controller support."},
  {id:"datewake", name:"DateWake", pkg:"datewake", yt:"VHJtuRPDDC8", status:"later", app:true, category:"UtilitiesApplication",
   title:"DateWake – Alarm Clock for Specific Dates, with Calendar",
   genre:["Productivity","Alarm clock","Calendar"],
   meta:"An Android alarm clock that rings at different times on different dates: shifts, flights, every-other-week trash day. Calendar, birthdays, holidays. No ads, no tracking."},
];

const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

// Play listing text -> HTML: blank-line paragraphs, ALL CAPS lines become headings, "• " lines become lists.
function descHtml(txt) {
  const out = []; let list = null;
  const flush = () => { if (list) { out.push(`<ul>${list.join("")}</ul>`); list = null; } };
  for (const raw of txt.split("\n")) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("•")) { (list ??= []).push(`<li>${esc(line.slice(1).trim())}</li>`); continue; }
    flush();
    if (/^[A-Z0-9 ,'&!./-]+$/.test(line) && /[A-Z]{3}/.test(line)) {
      const t = line.toLowerCase().replace(/^./, c => c.toUpperCase()).replace(/\bus\b/g,"US");
      out.push(`<h2>${esc(t)}</h2>`);
    } else out.push(`<p>${esc(line)}</p>`);
  }
  flush();
  return out.join("\n");
}

const playUrl = g => `https://play.google.com/store/apps/details?id=com.spaqigames.${g.pkg}`;
const statusText = {live:"Out now on Google Play", soon:"Early access on Google Play very soon", later:"Coming to Google Play later"};
const PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 2.6v18.8c0 .4.4.7.8.5L21 12.5c.4-.2.4-.8 0-1L4.8 2.1c-.4-.2-.8.1-.8.5Z"/></svg>';
const BETA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 2h6v2h-1v5.2l5.6 9.7A2 2 0 0 1 17.9 22H6.1a2 2 0 0 1-1.7-3.1L10 9.2V4H9Zm3 9.6L8.5 17h7Z"/></svg>';
const betaHref = g => "mailto:SpaqiGames@gmail.com?subject=" + encodeURIComponent(`Beta tester: ${g.name}`) + "&amp;body=" + encodeURIComponent(`Hi SpaqiGames,\n\nI'd like to beta test ${g.name}.\n\nThe Google account email I use on the Play Store (needed to add me as a tester):\n\nMy device (phone/tablet model, optional):\n\nThanks!`);
const YT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .6 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .4-4.8 31 31 0 0 0-.4-4.8ZM9.7 15.1V8.9l5.8 3.1Z"/></svg>';

const CSS = `:root{--bg:#f4f8f2;--card:#fff;--ink:#1d2a1f;--soft:#56655a;--line:#dbe5d8;--accent:#2f8f3a;--accent-ink:#fff;--soon:#b86b00;--soon-bg:#fff2dd;--yt:#d62828}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121714;--card:#1b221d;--ink:#e8efe8;--soft:#a3b2a6;--line:#2c3830;--accent:#4cb55a;--accent-ink:#08130a;--soon:#ffb24d;--soon-bg:#3a2a10}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:var(--accent)}
.top{max-width:920px;margin:0 auto;padding:14px 16px 0;font-size:.95rem}
.top a{text-decoration:none;font-weight:600}
main{max-width:920px;margin:0 auto;padding:8px 16px 40px}
.head{display:flex;gap:16px;align-items:center;margin:10px 0 14px}
.head img{width:88px;height:88px;border-radius:20px;flex:none;box-shadow:0 2px 10px rgba(0,0,0,.15)}
h1{margin:0;font-size:clamp(1.5rem,5vw,2.2rem);line-height:1.2}
.tagline{margin:.2rem 0 0;color:var(--soft)}
.tag{display:inline-block;margin-top:6px;font-size:.8rem;font-weight:700;padding:2px 10px;border-radius:999px;background:var(--soon-bg);color:var(--soon)}
.tag.live{background:color-mix(in srgb,var(--accent) 16%,transparent);color:var(--accent)}
.acts{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0 18px}
.btn{display:inline-flex;align-items:center;gap:.45rem;padding:.65rem 1.1rem;border-radius:999px;font-weight:600;text-decoration:none;font-size:1rem}
.btn svg{width:18px;height:18px;fill:currentColor}
.btn-play{background:var(--accent);color:var(--accent-ink)}
.btn-yt{background:var(--yt);color:#fff}
.btn-beta{background:transparent;color:var(--accent);box-shadow:inset 0 0 0 2px var(--accent)}
.beta-note{margin:.6rem 0 0;font-size:.92rem;color:var(--soft)}
.vid{position:relative;aspect-ratio:16/9;background:#000;cursor:pointer;border:0;padding:0;width:100%;display:block;border-radius:14px;overflow:hidden}
.vid img{width:100%;height:100%;object-fit:cover;display:block;opacity:.92}
.vid .pl{position:absolute;inset:0;margin:auto;width:72px;height:50px;border-radius:12px;background:var(--yt);display:grid;place-items:center}
.vid .pl::after{content:"";border-left:18px solid #fff;border-top:11px solid transparent;border-bottom:11px solid transparent;margin-left:4px}
iframe.vid{border:0}
.shots{display:grid;grid-template-columns:repeat(auto-fill,minmax(var(--w,380px),1fr));gap:10px;margin:18px 0}
.shots.tall{--w:180px}
@media (max-width:420px){.shots{--w:100%}.shots.tall{--w:150px}}
.shots img{width:100%;height:auto;display:block;border-radius:10px;border:1px solid var(--line)}
article h2{font-size:1.15rem;margin:1.6rem 0 .4rem}
article p{margin:.6rem 0}
article ul{margin:.4rem 0;padding-left:1.3rem}
article li{margin:.2rem 0}
.more{margin-top:2.4rem;border-top:1px solid var(--line);padding-top:1rem}
.more ul{columns:2 230px;padding-left:1.1rem}
footer{font-size:.9rem;color:var(--soft);margin-top:1.5rem}`;

const VIDEO_JS = `document.addEventListener("click",e=>{const b=e.target.closest(".vid[data-yt]");if(!b)return;const f=document.createElement("iframe");f.className="vid";f.src="https://www.youtube-nocookie.com/embed/"+b.dataset.yt+"?autoplay=1&rel=0";f.allow="autoplay; encrypted-media; picture-in-picture; fullscreen";f.allowFullscreen=true;f.title=b.getAttribute("aria-label");b.replaceWith(f)});`;

function page(g) {
  const url = `${SITE}/${g.id}/`;
  const txt = fs.readFileSync(`tools/desc/${g.id}.txt`, "utf8").trim();
  const shots = fs.readdirSync(`img/${g.id}`).filter(f => f.endsWith(".jpg")).sort();
  const dims = shots.map(f => { const b = fs.readFileSync(`img/${g.id}/${f}`); return jpegSize(b); });
  const tall = dims[0] && dims[0].h > dims[0].w;
  const ogImage = g.yt ? `https://i.ytimg.com/vi/${g.yt}/maxresdefault.jpg` : `${SITE}/img/${g.id}/${shots[0]}`;
  const tagline = txt.split("\n")[0];
  const ld = {
    "@context":"https://schema.org",
    "@type": g.app ? "MobileApplication" : ["VideoGame","MobileApplication"],
    name: g.name, url, description: g.meta,
    image: `${SITE}/img/${g.id}.png`,
    screenshot: shots.map(f => `${SITE}/img/${g.id}/${f}`),
    operatingSystem:"Android",
    applicationCategory: g.app ? g.category : "GameApplication",
    ...(g.app ? {} : {genre: g.genre, gamePlatform:"Android"}),
    author:{"@type":"Organization", name:"SpaqiGames", url:`${SITE}/`},
    publisher:{"@type":"Organization", name:"SpaqiGames", url:`${SITE}/`},
    ...(g.status==="live" ? {installUrl: playUrl(g), offers:{"@type":"Offer", price:"0", priceCurrency:"USD"}} : {}),
    ...(g.yt ? {trailer:{"@type":"VideoObject", name:`${g.name} trailer`, description:g.meta,
       thumbnailUrl:`https://i.ytimg.com/vi/${g.yt}/maxresdefault.jpg`, embedUrl:`https://www.youtube.com/embed/${g.yt}`,
       contentUrl:`https://www.youtube.com/watch?v=${g.yt}`, uploadDate:"2026-11-01"}} : {}),
  };
  const crumbs = {"@context":"https://schema.org","@type":"BreadcrumbList",itemListElement:[
    {"@type":"ListItem",position:1,name:"SpaqiGames",item:`${SITE}/`},
    {"@type":"ListItem",position:2,name:g.name,item:url}]};
  const btn = g.status==="live"
    ? `<a class="btn btn-play" href="${playUrl(g)}" rel="noopener">${PLAY_ICON}Get it on Google Play</a>`
    : `<a class="btn btn-beta" href="${betaHref(g)}">${BETA_ICON}Become a beta tester</a>`;
  const betaNote = g.status==="live" ? "" : `<p class="beta-note">Want to play ${esc(g.name)} before it's out? Tap <b>Become a beta tester</b> and send us the Google account you use on the Play Store. We'll add you to the test and email you the link.</p>`;
  const video = g.yt
    ? `<button class="vid" aria-label="Play the ${esc(g.name)} trailer" data-yt="${g.yt}"><img alt="${esc(g.name)} trailer" src="https://i.ytimg.com/vi/${g.yt}/maxresdefault.jpg" onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${g.yt}/hqdefault.jpg'"><span class="pl"></span></button>`
    : "";
  const others = GAMES.filter(o => o !== g).map(o => `<li><a href="../${o.id}/">${esc(o.name)}</a> – ${esc(o.genre[0].toLowerCase())}</li>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(g.title)}</title>
<meta name="description" content="${esc(g.meta)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="SpaqiGames">
<meta property="og:title" content="${esc(g.title)}">
<meta property="og:description" content="${esc(g.meta)}">
<meta property="og:image" content="${ogImage}">
<meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../img/favicon.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<script type="application/ld+json">${JSON.stringify(crumbs)}</script>
<style>${CSS}</style>
</head>
<body>
<nav class="top"><a href="../">← All SpaqiGames</a></nav>
<main>
<div class="head"><img src="../img/${g.id}.png" alt="${esc(g.name)} icon" width="88" height="88"><div>
<h1>${esc(g.name)}</h1>
<p class="tagline">${esc(g.genre.join(" · "))} · Android</p>
<span class="tag ${g.status==="live"?"live":""}">${statusText[g.status]}</span>
</div></div>
<div class="acts">${btn}<a class="btn btn-yt" href="${YT_CHANNEL}?sub_confirmation=1" rel="noopener">${YT_ICON}${g.status==="live"?"More on YouTube":"Get notified on YouTube"}</a></div>
${betaNote}
${video}
<div class="shots${tall?" tall":""}">
${shots.map((f,i) => `<img src="../img/${g.id}/${f}" alt="${esc(g.name)} screenshot ${i+1}" width="${dims[i].w}" height="${dims[i].h}" loading="lazy">`).join("\n")}
</div>
<article>
${descHtml(txt)}
</article>
<section class="more">
<h2>More games from SpaqiGames</h2>
<ul>${others}</ul>
</section>
<footer><a href="privacy.html">Privacy policy</a> · Contact: <a href="mailto:SpaqiGames@gmail.com">SpaqiGames@gmail.com</a> · <a href="${YT_CHANNEL}" rel="noopener">YouTube</a></footer>
</main>
<script>${VIDEO_JS}</script>
</body>
</html>
`;
}

function jpegSize(b) {
  let i = 2;
  while (i < b.length) {
    const m = b[i+1], len = b.readUInt16BE(i+2);
    if (m >= 0xC0 && m <= 0xC3) return {h: b.readUInt16BE(i+5), w: b.readUInt16BE(i+7)};
    i += 2 + len;
  }
  throw new Error("no JPEG size");
}

const today = new Date().toISOString().slice(0,10);
for (const g of GAMES) fs.writeFileSync(path.join(g.id, "index.html"), page(g));
const urls = [`${SITE}/`, ...GAMES.map(g => `${SITE}/${g.id}/`)];
fs.writeFileSync("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`);
console.log(`built ${GAMES.length} game pages + sitemap.xml`);
