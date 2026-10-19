import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Editorial structure, not a copy of a third-party post. Each new story must be researched
// and supplied as a separate JSON file; this renderer never invents a statistic or deadline.
const storySlug = process.env.FIDELIS_STORY;
if (!storySlug || !/^[a-z0-9-]+$/.test(storySlug)) {
  throw new Error('Defina FIDELIS_STORY com o nome de um arquivo em scripts/fidelis-stories (sem .json).');
}
const story = JSON.parse(await fs.readFile(path.resolve('scripts/fidelis-stories', `${storySlug}.json`), 'utf8'));
if (story.slug !== storySlug || story.kind !== 'news' || !story.source?.url || !story.caption) {
  throw new Error('Pauta incompleta: confirme slug, tipo, fonte e legenda antes de gerar.');
}
const preview = process.env.FIDELIS_PREVIEW_DIR;
const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const outputDir = preview ? path.resolve(preview) : path.resolve('public/fidelis', day, 'carousel-news');
const asset = (name) => path.resolve('scripts/fidelis-assets', name);
const W = 1080, H = 1350, GOLD = '#D9AA65', LIGHT = '#F5D395', INK = '#08090B', WHITE = '#F7F7F5';
const esc = (s) => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const txt = (s, x, y, size, color = WHITE, weight = 400, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
const condensed = (s, x, y, size, color = WHITE) => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial Narrow,DIN Condensed,Impact,sans-serif" font-size="${size}" font-weight="900" letter-spacing="-1.4">${esc(s)}</text>`;
const wrap = (s, max) => { const out = []; let line = ''; for (const word of String(s).split(/\s+/)) { const next = line ? `${line} ${word}` : word; if (next.length > max && line) { out.push(line); line = word; } else line = next; } if (line) out.push(line); return out; };
const multiline = (s, x, y, max, size, gap, color = WHITE, weight = 400) => wrap(s, max).map((line, i) => txt(line, x, y + i * gap, size, color, weight)).join('');
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
const header = `<rect x="48" y="146" width="473" height="116" rx="18" fill="#050608" fill-opacity=".78"/><rect x="855" y="177" width="171" height="43" rx="21" fill="${GOLD}"/>${txt('FIDELIS NEWS', 874, 207, 22, INK, 800)}`;
const footer = (n, source = true, dark = false) => `${source ? txt(`FONTE: ${story.source.name.toUpperCase()} · ${story.source.published}`, 69, 1248, 19, dark ? '#272522' : '#B8B6B2', 700) : ''}${txt(`${String(n).padStart(2, '0')} / 06`, 924, 1250, 24, dark ? '#272522' : GOLD, 700)}`;

const logo = sharp(await fs.readFile(asset('logo-original.png')));
const logoMark = await logo.clone().extract({ left: 28, top: 40, width: 95, height: 125 }).resize({ width: 57 }).png().toBuffer();
const logoWord = await logo.clone().extract({ left: 142, top: 70, width: 320, height: 27 }).resize({ width: 299 }).png().toBuffer();
const brand = [{ input: logoMark, left: 68, top: 164 }, { input: logoWord, left: 139, top: 188 }];
const base = (name) => name ? sharp(asset(name)).resize(W, H, { fit: 'cover' }) : sharp({ create: { width: W, height: H, channels: 3, background: INK } });

const pages = [
  {
    bg: 'news-desk.png',
    body: `<defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".58"/><stop offset=".39" stop-color="#000" stop-opacity=".10"/><stop offset=".58" stop-color="#000" stop-opacity=".73"/><stop offset="1" stop-color="#000" stop-opacity=".98"/></linearGradient></defs><rect width="1080" height="1350" fill="url(#fade)"/>${header}${txt(story.cover.eyebrow, 70, 645, 30, LIGHT, 800, 'letter-spacing="2"')}${condensed(story.cover.headline[0], 68, 756, 77)}${condensed(story.cover.headline[1], 68, 844, 77, LIGHT)}<rect x="70" y="888" width="180" height="6" fill="${GOLD}"/>${multiline(story.cover.question, 70, 962, 42, 35, 47, WHITE, 500)}${footer(1)}`
  },
  {
    body: `${header}${txt('O TAMANHO DO ALERTA', 69, 378, 30, GOLD, 800, 'letter-spacing="2"')}${condensed(story.numbers.lead, 62, 542, 157, LIGHT)}${multiline(story.numbers.label, 70, 608, 36, 33, 43)}<rect x="70" y="706" width="940" height="2" fill="#696052"/><rect x="70" y="758" width="446" height="259" rx="24" fill="#171719"/><rect x="540" y="758" width="470" height="259" rx="24" fill="#171719"/>${condensed(story.numbers.other[0].value, 96, 875, 58, WHITE)}${multiline(story.numbers.other[0].label, 99, 936, 19, 25, 33, '#CAC7C2')}${condensed(story.numbers.other[1].value, 568, 875, 58, LIGHT)}${multiline(story.numbers.other[1].label, 570, 936, 19, 25, 33, '#CAC7C2')}${multiline(story.numbers.note, 70, 1101, 60, 24, 34, '#B9B8B5')}${footer(2)}`
  },
  {
    bg: 'news-boardroom.png',
    body: `<rect width="1080" height="1350" fill="#050506" fill-opacity=".83"/>${header}${condensed(story.explanation.headline[0], 70, 421, 77)}${condensed(story.explanation.headline[1], 70, 509, 77, LIGHT)}<rect x="70" y="552" width="135" height="6" fill="${GOLD}"/><rect x="69" y="610" width="939" height="193" rx="22" fill="#111214" fill-opacity=".91" stroke="${GOLD}" stroke-opacity=".50"/>${multiline(story.explanation.body[0], 97, 674, 51, 29, 39, WHITE, 600)}<rect x="69" y="831" width="939" height="180" rx="22" fill="#111214" fill-opacity=".91"/>${multiline(story.explanation.body[1], 97, 891, 53, 28, 39, '#D4D0CB')}${footer(3)}`
  },
  {
    bg: 'news-city.png',
    body: `<rect width="1080" height="1350" fill="#D9AA65" fill-opacity=".90"/>${header}${condensed(story.dates.headline, 66, 389, 53, INK)}${story.dates.items.map((item, i) => { const y = 471 + i * 287; return `<rect x="68" y="${y}" width="943" height="249" rx="22" fill="#0B0B0C" fill-opacity=".94"/>${condensed(item.date, 98, y + 99, 82, LIGHT)}${txt(item.title.toUpperCase(), 405, y + 79, 31, WHITE, 800)}${multiline(item.body, 405, y + 125, 33, 27, 38, '#E5E1DC')}`; }).join('')}<rect x="68" y="1096" width="940" height="6" fill="${INK}"/>${multiline(story.dates.note, 70, 1151, 63, 24, 33, INK, 700)}${footer(4, false, true)}`
  },
  {
    body: `<rect width="1080" height="1350" fill="${GOLD}"/>${header}${condensed(story.action.headline[0], 70, 396, 80, INK)}${condensed(story.action.headline[1], 70, 484, 80, INK)}<rect x="70" y="534" width="940" height="4" fill="${INK}"/>${story.action.steps.map((step, i) => { const y = 631 + i * 172; return `<circle cx="111" cy="${y - 15}" r="37" fill="${INK}"/>${txt(String(i + 1), 98, y - 2, 35, LIGHT, 800)}${multiline(step, 174, y - 14, 40, 31, 41, INK, 700)}`; }).join('')}<rect x="70" y="1114" width="940" height="83" rx="13" fill="${INK}"/>${multiline(story.action.note, 92, 1163, 65, 25, 33, WHITE, 600)}${footer(5, false, true)}`
  },
  {
    body: `${header}<rect x="70" y="372" width="140" height="6" fill="${GOLD}"/>${condensed(story.closing.headline[0], 69, 515, 69)}${condensed(story.closing.headline[1], 69, 597, 78, LIGHT)}${multiline(story.closing.body, 72, 710, 50, 31, 44, '#E0DED9', 500)}<rect x="70" y="963" width="726" height="105" rx="52" fill="${GOLD}"/>${txt(story.closing.cta, 126, 1032, 37, INK, 800)}${txt('fidelisempresarial.com.br', 73, 1172, 26, '#D5D1CA', 500)}${footer(6, false)}`
  }
];

await fs.mkdir(outputDir, { recursive: true });
const files = [];
for (const [index, page] of pages.entries()) {
  const file = path.join(outputDir, `${String(index + 1).padStart(2, '0')}.jpg`);
  await base(page.bg).composite([{ input: svg(page.body) }, ...brand]).jpeg({ quality: 92, mozjpeg: true }).toFile(file);
  files.push(path.relative(process.cwd(), file).replaceAll(path.sep, '/'));
}
if (!preview) {
  const manifest = { files, caption: story.caption, topic: story.cover.headline.join(' '), source: story.source.url, story: story.slug, format: 'carousel' };
  await fs.writeFile('fidelis-manifest-carousel-news.json', JSON.stringify(manifest, null, 2) + '\n');
}
console.log(JSON.stringify({ story: story.slug, files, preview: Boolean(preview) }, null, 2));
