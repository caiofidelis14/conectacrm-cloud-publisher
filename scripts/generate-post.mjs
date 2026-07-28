import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { topics, ctas } from "./content.mjs";

const W = 1080;
const H = 1350;
const now = process.env.POST_DATE
  ? new Date(`${process.env.POST_DATE}T12:00:00-03:00`)
  : new Date();
const dayKey = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dayNumber = Math.floor(Date.parse(`${dayKey}T12:00:00Z`) / 86400000);
const topicCycle = Math.floor(dayNumber / topics.length);
const topic = topics[dayNumber % topics.length];
const cta = ctas[dayNumber % ctas.length];
const hook = topic.hook;
const format = dayNumber % 10 === 0 ? "static" : "carousel";
const carouselLayouts = ["viral_black", "tweet_card", "educational_neon", "editorial_split"];
const layout = format === "static"
  ? "static_neon"
  : carouselLayouts[dayNumber % carouselLayouts.length];
const dir = path.join("public", dayKey);
await fs.mkdir(dir, { recursive: true });

// Retratos profissionais gratuitos hospedados pelo Unsplash. A foto, o fundo,
// o enquadramento e o tratamento visual mudam diariamente.
const coverPhotos = [
  "https://images.unsplash.com/photo-1758873272249-71e3d173f3b2",
  "https://images.unsplash.com/photo-1758691737646-79dbce8e25fb",
  "https://images.unsplash.com/photo-1758876021212-a87517fc8954",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2",
  "https://images.unsplash.com/photo-1562788869-4ed32648eb72",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df",
  "https://images.unsplash.com/photo-1557804506-669a67965ba0",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9",
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956",
  "https://images.unsplash.com/photo-1595152772835-219674b2a8a6",
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
  "https://images.unsplash.com/photo-1507591064344-4c6ce005b128",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1",
  "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e",
  "https://images.unsplash.com/photo-1548142813-c348350df52b",
  "https://images.unsplash.com/photo-1557862921-37829c790f19",
  "https://images.unsplash.com/photo-1564564321837-a57b7070ac4f",
  "https://images.unsplash.com/photo-1551836022-4c4c79ecde51"
];

const palettes = [
  { purple: "#7c35ff", deep: "#050505", lime: "#a6ff00" },
  { purple: "#9a2fff", deep: "#030303", lime: "#b7ff35" },
  { purple: "#6538ff", deep: "#070707", lime: "#88ff39" },
  { purple: "#b52dff", deep: "#020202", lime: "#c0ff2f" }
];
const palette = palettes[dayNumber % palettes.length];
let priorHistory = [];
try {
  priorHistory = JSON.parse(await fs.readFile("history.json", "utf8"));
} catch {}
const usedPhotos = new Set(priorHistory.map((item) => item.photo).filter(Boolean));
const unusedPhoto = coverPhotos.find((photo, index) =>
  !usedPhotos.has(photo) && index >= dayNumber % coverPhotos.length
) ?? coverPhotos.find((photo) => !usedPhotos.has(photo));
// Depois de consumir os retratos curados, usa uma semente diária permanente.
// A URL nunca se repete e mantém a rotina ativa sem reciclar uma capa antiga.
const selectedPhoto = unusedPhoto ?? `https://picsum.photos/seed/conectacrm-${dayKey}/${W}/${H}`;
const photoUrl = `${selectedPhoto}?auto=format&fit=crop&w=${W}&h=${H}&q=88&crop=faces`;

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const wrap = (text, max = 25) => {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
};
const textBlock = (lines, x, y, size, lineHeight, color = "#fff", weight = 800) =>
  lines.map((line, i) => `<text x="${x}" y="${y + i * lineHeight}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`).join("");

const logo = `
  <text x="72" y="89" font-family="Arial,sans-serif" font-size="46" font-weight="900" fill="${palette.purple}">C</text>
  <text x="116" y="80" font-family="Arial,sans-serif" font-size="25" font-weight="800" fill="#fff">Conecta</text>
  <text x="116" y="105" font-family="Arial,sans-serif" font-size="22" font-weight="800" fill="#fff">crm</text>
  <rect x="96" y="51" width="13" height="8" fill="${palette.lime}"/>`;

const footer = (left, page) => `
  <text x="72" y="1215" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#d9cfea">${esc(left)}</text>
  <text x="1008" y="1215" text-anchor="end" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#d9cfea">${String(page).padStart(2, "0")} / 06</text>`;

const canvas = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="bg" cx="${25 + dayNumber % 65}%" cy="${10 + dayNumber % 70}%">
      <stop stop-color="${palette.purple}" stop-opacity=".16"/>
      <stop offset="1" stop-color="${palette.deep}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${palette.deep}"/>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity=".08" stroke="${palette.purple}">${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${700 + i * 34}H1080"/>`).join("")}</g>
  ${inner}
</svg>`;

const files = [];
async function renderSvg(name, svg) {
  const out = path.join(dir, name);
  await sharp(Buffer.from(svg)).jpeg({ quality: 93, chromaSubsampling: "4:4:4" }).toFile(out);
  files.push(out);
}
async function renderCover(name, overlay) {
  const out = path.join(dir, name);
  let photo;
  try {
    const response = await fetch(photoUrl);
    if (!response.ok) throw new Error(`foto ${response.status}`);
    photo = Buffer.from(await response.arrayBuffer());
  } catch {
    photo = Buffer.from(canvas(""));
  }
  await sharp(photo)
    .resize(W, H, { fit: "cover", position: dayNumber % 2 ? "attention" : "entropy" })
    .modulate({ saturation: 0.72, brightness: 0.72 })
    .composite([{ input: Buffer.from(overlay), blend: "over" }])
    .jpeg({ quality: 93, chromaSubsampling: "4:4:4" })
    .toFile(out);
  files.push(out);
}

const photoCover = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="shade" x1="0" x2="1">
      <stop offset=".05" stop-color="${palette.deep}" stop-opacity=".98"/>
      <stop offset=".62" stop-color="${palette.deep}" stop-opacity=".72"/>
      <stop offset="1" stop-color="${palette.purple}" stop-opacity=".20"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  ${logo}
  <text x="72" y="340" font-family="Arial,sans-serif" font-size="22" font-weight="900" letter-spacing="3" fill="${palette.lime}">O ALERTA QUE SEU COMERCIAL IGNORA</text>
  ${textBlock(wrap(hook.toUpperCase(), 21), 72, 440, 72, 78)}
  <text x="72" y="1085" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#fff">Arraste para entender →</text>
  ${footer("@conecta.crm", 1)}
</svg>`;

const neonCover = canvas(`
  ${logo}
  <text x="72" y="315" font-family="Arial,sans-serif" font-size="22" font-weight="900" letter-spacing="3" fill="${palette.lime}">GESTÃO COMERCIAL SEM ENROLAÇÃO</text>
  ${textBlock(wrap(hook.toUpperCase(), 20), 72, 430, 74, 82)}
  <rect x="72" y="1025" width="470" height="74" rx="37" fill="${palette.purple}"/>
  <text x="112" y="1074" font-family="Arial,sans-serif" font-size="25" font-weight="900" fill="#fff">VEJA O QUE FAZER →</text>
  ${footer("@conecta.crm", 1)}`);

const splitCover = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${palette.deep}"/>
  <rect x="560" width="520" height="${H}" fill="${palette.purple}" opacity=".18"/>
  ${logo}
  <text x="72" y="315" font-family="Arial,sans-serif" font-size="22" font-weight="900" letter-spacing="3" fill="${palette.lime}">PARA QUEM QUER VENDER MAIS</text>
  ${textBlock(wrap(hook.toUpperCase(), 16), 72, 430, 66, 74)}
  <line x1="72" y1="1015" x2="1008" y2="1015" stroke="${palette.purple}" stroke-width="5"/>
  ${footer("Arraste para ver →", 1)}
</svg>`;

const tweetCover = canvas(`
  ${logo}
  <rect x="72" y="245" width="936" height="785" rx="34" fill="#f7f7f8" filter="url(#shadow)"/>
  <circle cx="145" cy="335" r="42" fill="${palette.purple}"/>
  <text x="129" y="352" font-family="Arial,sans-serif" font-size="48" font-weight="900" fill="#fff">C</text>
  <text x="210" y="326" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="#111">ConectaCRM</text>
  <text x="210" y="363" font-family="Arial,sans-serif" font-size="22" fill="#6c6672">@conecta.crm</text>
  ${textBlock(wrap(hook, 24), 118, 505, 61, 69, "#111")}
  <text x="118" y="925" font-family="Arial,sans-serif" font-size="24" font-weight="700" fill="${palette.purple}">Leia antes de cobrar mais leads →</text>
  ${footer("@conecta.crm", 1)}`);

const coverOverlay = layout === "educational_neon"
  ? neonCover
  : layout === "editorial_split"
    ? splitCover
    : layout === "tweet_card"
      ? tweetCover
      : photoCover;

if (format === "static") {
  await renderCover("01.jpg", photoCover.replace("Arraste para entender →", "Teste grátis por 7 dias →"));
} else {
  if (layout === "educational_neon" || layout === "editorial_split" || layout === "tweet_card") {
    await renderSvg("01.jpg", coverOverlay);
  } else {
    await renderCover("01.jpg", coverOverlay);
  }

  for (let i = 0; i < topic.points.length; i++) {
    const pageNumber = i + 2;
    const nextLabel = i === topic.points.length - 1 ? "Continue para o CTA →" : "Continue lendo →";
    let card;
    if (layout === "tweet_card") {
      card = `
        ${logo}
        <rect x="84" y="248" width="912" height="735" rx="34" fill="#130c20" stroke="${palette.purple}" stroke-opacity=".55" filter="url(#shadow)"/>
        <circle cx="150" cy="340" r="42" fill="${palette.purple}"/>
        <text x="134" y="357" font-family="Arial,sans-serif" font-size="48" font-weight="900" fill="#fff">C</text>
        <text x="215" y="331" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="#fff">ConectaCRM</text>
        <text x="215" y="368" font-family="Arial,sans-serif" font-size="22" fill="#bdb1ca">@conecta.crm · vendas</text>
        ${textBlock(wrap(topic.points[i].toUpperCase(), 22), 128, 520, 62, 70)}
        ${textBlock(wrap(topic.body, 40), 128, 790, 30, 43, "#ded5e8", 500)}
        ${footer(nextLabel, pageNumber)}`;
    } else if (layout === "educational_neon") {
      card = `
        ${logo}
        <text x="72" y="290" font-family="Arial,sans-serif" font-size="24" font-weight="900" fill="${palette.lime}">PASSO ${String(i + 1).padStart(2, "0")}</text>
        ${textBlock(wrap(topic.points[i].toUpperCase(), 19), 72, 410, 70, 78)}
        <rect x="72" y="730" width="936" height="260" rx="24" fill="${palette.purple}" opacity=".16"/>
        ${textBlock(wrap(topic.body, 43), 112, 820, 31, 45, "#fff", 500)}
        ${footer(nextLabel, pageNumber)}`;
    } else if (layout === "editorial_split") {
      card = `
        ${logo}
        <rect x="0" y="235" width="24" height="620" fill="${i % 2 ? palette.purple : palette.lime}"/>
        <text x="72" y="315" font-family="Arial,sans-serif" font-size="22" font-weight="900" letter-spacing="3" fill="${palette.lime}">O QUE MUDA O JOGO</text>
        ${textBlock(wrap(topic.points[i].toUpperCase(), 17), 72, 455, 78, 86)}
        ${textBlock(wrap(topic.body, 38), 72, 860, 33, 47, "#dedede", 500)}
        ${footer(nextLabel, pageNumber)}`;
    } else {
      card = `
        ${logo}
        <text x="72" y="330" font-family="Arial,sans-serif" font-size="24" font-weight="900" letter-spacing="3" fill="${palette.lime}">PONTO ${String(i + 1).padStart(2, "0")}</text>
        ${textBlock(wrap(topic.points[i].toUpperCase(), 18), 72, 455, 76, 84)}
        ${textBlock(wrap(topic.body, 38), 72, 850, 34, 48, "#dedede", 500)}
        ${footer(nextLabel, pageNumber)}`;
    }
    await renderSvg(`${String(i + 2).padStart(2, "0")}.jpg`, canvas(card));
  }

  const ctaPage = `
    ${logo}
    <text x="72" y="395" font-family="Arial,sans-serif" font-size="23" font-weight="900" letter-spacing="3" fill="${palette.lime}">PARE DE VENDER NO IMPROVISO</text>
    ${textBlock(wrap(cta.toUpperCase(), 17), 72, 515, 62, 70)}
    <rect x="72" y="955" width="936" height="94" rx="18" fill="${palette.lime}"/>
    <text x="118" y="1018" font-family="Arial,sans-serif" font-size="31" font-weight="900" fill="${palette.deep}">TESTE GRÁTIS POR 7 DIAS →</text>
    ${footer("@conecta.crm", 6)}`;
  await renderSvg("06.jpg", canvas(ctaPage));
}

const captionOpeners = [
  "Um alerta para quem quer vender mais:",
  "Isso pode estar travando suas vendas:",
  "Uma verdade desconfortável sobre vendas:",
  "Gestor comercial, preste atenção nisso:"
];
const caption = `${captionOpeners[topicCycle % captionOpeners.length]}\n\n${hook}\n\n${topic.body}\n\n${topic.points.map((point) => `• ${point}`).join("\n")}\n\n${cta} Link na bio. 🚀\n\n#ConectaCRM #CRM #Vendas #GestãoComercial #AutomaçãoDeVendas #PME`;
const manifest = { date: dayKey, format, layout, photoUrl, files: files.map((file) => file.replaceAll(path.sep, "/")), caption };
await fs.writeFile("manifest.json", JSON.stringify(manifest, null, 2));

let history = priorHistory;
history = history.filter((item) => item.date !== dayKey);
history.push({ date: dayKey, format, layout, hook, photo: selectedPhoto });
await fs.writeFile("history.json", JSON.stringify(history.slice(-120), null, 2));
console.log(JSON.stringify(manifest, null, 2));
