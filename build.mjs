import fs from "fs"; import path from "path";
import { TOPICS, RYHMAT, TARKISTETTU } from "./topics.mjs";
const SITE = (process.env.SITE_URL || "https://muistutin.fi").replace(/\/$/, "");
const NIMI = "Muistutin";
const BASE = (process.env.BASE || "").replace(/\/$/, "");
const D = "dist"; fs.rmSync(D, { recursive: true, force: true }); fs.mkdirSync(D, { recursive: true });
const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const w = (p, c) => { const f = path.join(D, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, c); };
const IKONI = { auto: "🚗", koti: "🏠", asiakirjat: "🪪", sopimukset: "📄", raha: "💶", osto: "🛍️", terveys: "🩺" };
const nav = `<header><div class="w"><a class="logo" href="/">Muistu<b>tin</b></a><nav class="nv"><a href="/oma/">Oma lista <span id="cnt" hidden></span></a><a href="/tietoa/">Tietoa</a></nav></div></header>`;
const foot = `<footer><div class="w"><p>${NIMI} on riippumaton palvelu, joka auttaa muistamaan määräajat. Sivuston tiedot ovat yleistietoa, eivät lakineuvontaa. Tarkista oman tilanteesi päivämäärät ja ehdot aina viralliselta taholta. Tiedot tarkistettu ${TARKISTETTU}.</p><p><a href="/tietosuoja/">Tietosuoja</a> · <a href="/tietoa/">Tietoa palvelusta</a></p></div></footer>`;
function page({ url, title, desc, body, ld = [], script = "" }) {
  const full = SITE + url;
  return (`<!doctype html><html lang="fi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${full}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:type" content="website"><meta property="og:url" content="${full}"><meta property="og:locale" content="fi_FI">
<meta name="theme-color" content="#14213d"><link rel="stylesheet" href="/style.css">
${ld.map(o => `<script type="application/ld+json">${JSON.stringify(o)}</script>`).join("\n")}
</head><body>${nav}<main class="w">${body}</main>${foot}${script}<script src="/lista.js" defer></script></body></html>`).replace(/(href|src)="\//g, `$1="${BASE}/`);
}
// Etusivu
const groups = Object.entries(RYHMAT).map(([k, nm]) => `<h2><span class="ik">${IKONI[k]}</span> ${nm}</h2><div class="grid">${TOPICS.filter(t => t.ryhma === k).map(t => `<a href="/asia/${t.slug}/" data-n="${esc(t.nimi + " " + t.kysymys)}">${esc(t.nimi)}</a>`).join("")}</div>`).join("");
w("index.html", page({
  url: "/", title: "Muistutin: muistutus autokatsastuksesta, vakuutuksista ja sopimuksista", desc: "Älä unohda määräaikoja. Lisää autokatsastus, vakuutusten uusiutuminen, sopimusten päättyminen ja passin vanheneminen kalenteriisi ilmaiseksi.",
  ld: [{ "@context": "https://schema.org", "@type": "WebSite", name: NIMI, url: SITE + "/", inLanguage: "fi" }],
  body: `<section class="hero"><h1>Kaikki määräaikasi yhdessä paikassa.</h1><p class="lead">Katsastus, vakuutukset, sopimukset, passi ja verot. Lisää päivämäärä kerran, niin saat muistutuksen ajoissa. Ilmainen, ei tiliä.</p><div class="pills"><span>✓ Ei rekisteröitymistä</span><span>✓ Tiedot vain sinun laitteellasi</span><span>✓ Toimii kalenterissasi</span></div></section>
<input id="hae" type="search" placeholder="Hae asiaa, esim. katsastus, passi, sähkö" aria-label="Hae asiaa">${groups}
<div class="box"><b>Näin se toimii</b><ol><li>Valitse asia, esimerkiksi autovakuutus.</li><li>Syötä päivämäärä, jolloin se uusiutuu tai vanhenee.</li><li>Lisää se omalle listalle tai lataa kalenteriisi. Muistutus tulee useita kertoja ennen päivää.</li></ol><p class="mut">Oma lista näyttää kaikki muistutuksesi yhdessä paikassa ja laskee, montako päivää on jäljellä.</p></div>`,
  script: `<script src="/haku.js" defer></script>`,
}));
// Aihesivut
for (const t of TOPICS) {
  const url = `/asia/${t.slug}/`;
  const rel = TOPICS.filter(x => x.ryhma === t.ryhma && x.slug !== t.slug).slice(0, 4);
  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [[t.kysymys, t.vastaus], ...t.faq].map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: NIMI, item: SITE + "/" }, { "@type": "ListItem", position: 2, name: t.nimi, item: SITE + url }] },
    { "@context": "https://schema.org", "@type": "Article", headline: t.kysymys, dateModified: TARKISTETTU, inLanguage: "fi", publisher: { "@type": "Organization", name: NIMI } },
  ];
  const data = esc(JSON.stringify({ slug: t.slug, nimi: t.nimi, off: t.off }));
  w(`asia/${t.slug}/index.html`, page({
    url, title: `${t.nimi}: ${t.kysymys}`, desc: t.vastaus.slice(0, 155).replace(/\s+\S*$/, "") + "…", ld,
    body: `<p class="mut"><a href="/">Muistutin</a> › ${esc(RYHMAT[t.ryhma])}</p>
<h1>${esc(t.kysymys)}</h1>
<div class="ans"><p class="lead" style="margin:0">${esc(t.vastaus)}</p></div>
<div class="box"><b>Lisää muistutus kalenteriisi</b>
<form id="mf" data-t="${data}" onsubmit="return false">
<label for="mtitle">Muistutuksen nimi</label><input id="mtitle" type="text" value="${esc(t.nimi)}">
<label for="mdate">Päivämäärä, jolloin asia vanhenee tai uusiutuu</label><input id="mdate" type="date" required>
${t.toista ? `<label class="chk"><input id="mrep" type="checkbox" checked> Toistuu joka vuosi</label>` : `<label class="chk" hidden><input id="mrep" type="checkbox"></label>`}
<div class="row"><button id="mics" type="button">Lataa kalenteriin</button><button id="mlist" type="button" class="s">Lisää omalle listalle</button><button id="mgc" type="button" class="s">Google Kalenteri</button></div>
<p class="out" id="out" aria-live="polite"></p><p class="mut">Muistutukset: ${t.off.map(o => o + " pv").join(", ")} ennen päivää. Tietoja ei lähetetä mihinkään, tiedosto syntyy puhelimessasi.</p></form></div>
<h2>Mistä löydät päivämäärän?</h2><p>${esc(t.mista)}</p>
<h2>Vinkit</h2><ul>${t.vinkit.map(v => `<li>${esc(v)}</li>`).join("")}</ul>
<h2>Usein kysyttyä</h2>${t.faq.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join("")}
<h2>Viralliset lähteet</h2><ul>${t.lahteet.map(([n, u]) => `<li><a href="${u}" rel="noopener">${esc(n)}</a></li>`).join("")}</ul>
<p class="mut">Tiedot tarkistettu ${TARKISTETTU}. Säännöt ja määräajat voivat muuttua, joten tarkista oma päivämääräsi aina viralliselta taholta.</p>
<h2>Muita muistutuksia</h2><div class="grid">${rel.map(x => `<a href="/asia/${x.slug}/">${esc(x.nimi)}</a>`).join("")}</div>`,
    script: `<script src="/app.js" defer></script>`,
  }));
}
w("oma/index.html", page({ url: "/oma/", title: "Oma lista: kaikki muistutuksesi yhdessä paikassa", desc: "Omat määräaikasi yhdessä listassa. Tallennetaan vain laitteellesi.",
  body: `<h1>Oma lista</h1><p class="lead">Kaikki lisäämäsi muistutukset yhdessä paikassa. Lista tallentuu vain tähän laitteeseen.</p><div id="ol"></div><p class="out" id="oout"></p><div class="row"><button id="oall" type="button" hidden>Lataa kaikki kalenteriin</button></div><div class="box"><b>Tekstiviestimuistutus tulossa</b><p class="mut">Kalenterimuistutus on ilmainen. Tekstiviestimuistutus tulee myöhemmin erikseen, ja siihen kirjaudutaan vain puhelinnumerolla.</p></div><h2>Lisää uusi</h2><div class="grid">${TOPICS.map(t => `<a href="/asia/${t.slug}/">${esc(t.nimi)}</a>`).join("")}</div>`,
  }));
w("tietoa/index.html", page({ url: "/tietoa/", title: "Tietoa Muistutin-palvelusta", desc: "Muistutin auttaa muistamaan autokatsastuksen, vakuutukset ja sopimusten määräajat.", body: `<h1>Tietoa palvelusta</h1><p>${NIMI} auttaa muistamaan asiat, joilla on päivämäärä: autokatsastus, vakuutukset, sopimukset, passi ja muut. Valitset asian, syötät päivän ja saat muistutuksen kalenteriisi.</p><h2>Rahoitus</h2><p>Palvelu on ilmainen. Joillakin sivuilla voi olla kumppanilinkkejä, esimerkiksi vertailupalveluihin. Merkitsemme ne selvästi, ja niistä voi saada palkkion, ilman että hinta nousee sinulle.</p><h2>Ehdot</h2><p>Palvelu on alkuun ilmainen. Pidätämme oikeuden muuttaa palvelun sisältöä, ominaisuuksia ja ehtoja, mukaan lukien hinnoittelua, ja lisätä maksullisia ominaisuuksia, kuten tekstiviestimuistutukset. Muutoksista ilmoitetaan sivustolla etukäteen.</p><h2>Rajaus</h2><p>Sivuston sisältö on yleistietoa. Se ei korvaa viranomaisen tai asiantuntijan neuvoa.</p>` }));
w("tietosuoja/index.html", page({ url: "/tietosuoja/", title: "Tietosuoja", desc: "Muistutin ei kerää henkilötietoja kalenterimuistutuksista.", body: `<h1>Tietosuoja</h1><p>Kalenterimuistutus syntyy omalla laitteellasi. Syöttämiäsi päivämääriä ei lähetetä palvelimellemme eikä tallenneta mihinkään. Sivusto ei käytä evästeitä eikä seuranta- tai mainostyökaluja.</p><p>Jos palveluun lisätään myöhemmin sähköpostimuistutus, siitä pyydetään erillinen suostumus ja tietosuojaseloste päivitetään ennen käyttöönottoa.</p>` }));
w("404.html", page({ url: "/404.html", title: "Sivua ei löydy", desc: "Sivua ei löydy.", body: `<h1>Sivua ei löydy</h1><p><a href="/">Palaa etusivulle</a> ja valitse asia listasta.</p>` }));
fs.copyFileSync("src/style.css", D + "/style.css"); fs.copyFileSync("src/app.js", D + "/app.js"); fs.copyFileSync("src/haku.js", D + "/haku.js"); fs.copyFileSync("src/lista.js", D + "/lista.js");
const urls = ["/", "/tietoa/", "/tietosuoja/", ...TOPICS.map(t => `/asia/${t.slug}/`)];
w("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${SITE}${u}</loc><lastmod>${TARKISTETTU}</lastmod></url>`).join("")}</urlset>`);
w("robots.txt", `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\nUser-agent: ClaudeBot\nAllow: /\nUser-agent: PerplexityBot\nAllow: /\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
w("llms.txt", `# ${NIMI}\n> Suomenkielinen palvelu, joka auttaa muistamaan määräajat: autokatsastus, vakuutukset, sopimukset, asiakirjat ja verot. Käyttäjä syöttää päivämäärän ja lataa muistutuksen kalenteriinsa ilmaiseksi. Ei rekisteröitymistä.\n\n## Aiheet\n${TOPICS.map(t => `- [${t.nimi}](${SITE}/asia/${t.slug}/): ${t.kysymys}`).join("\n")}\n`);
if (process.env.SITE_URL) w("CNAME", new URL(SITE).host + "\n");
console.log("pages:", urls.length);
