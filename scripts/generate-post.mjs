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
const previewMode = process.env.PREVIEW_MODE === "1";
const cta = ctas[dayNumber % ctas.length];
const format = dayNumber % 10 === 0 ? "static" : "carousel";
const styles = [
  { layout: "viral_black", art: "01-pipeline-phone.png", kicker: "DO LEAD AO FECHAMENTO", accent: "#a6ff00" },
  { layout: "tweet_card", art: "02-chat-hub.png", kicker: "CONVERSAS QUE VIRAM RESULTADO", accent: "#a6ff00" },
  { layout: "educational_neon", art: "03-data-growth.png", kicker: "DADOS QUE MOVEM VENDAS", accent: "#e5bd70" },
  { layout: "editorial_split", art: "04-ai-network.png", kicker: "TECNOLOGIA A FAVOR DO TIME", accent: "#b58aff" },
  { layout: "static_neon", art: "05-founder-editorial.png", kicker: "GESTÃO COMERCIAL NA PRÁTICA", accent: "#a6ff00" }
];
const style = styles[dayNumber % styles.length];
const layout = style.layout;
const dir = previewMode ? path.join("previews", "conecta-5-styles", dayKey) : path.join("public", dayKey);
await fs.mkdir(dir, { recursive: true });

const palettes = [
  { purple: "#7c35ff", deep: "#050505", lime: "#a6ff00" },
  { purple: "#9a2fff", deep: "#030303", lime: "#b7ff35" },
  { purple: "#6538ff", deep: "#070707", lime: "#88ff39" },
  { purple: "#b52dff", deep: "#020202", lime: "#c0ff2f" }
];
const palette = { ...palettes[dayNumber % palettes.length], lime: style.accent };
let priorHistory = [];
try {
  priorHistory = JSON.parse(await fs.readFile("history.json", "utf8"));
} catch {}
const lastUsed = new Map(priorHistory.map((item) => [item.hook, item.date]));
const topic = previewMode
  ? topics[dayNumber % topics.length]
  : topics.map((item, index) => ({ item, index, date: lastUsed.get(item.hook) || "" }))
    .sort((a, b) => a.date.localeCompare(b.date) || a.index - b.index)[0].item;
const hook = topic.hook;
const selectedPhoto = `scripts/conecta-art/${style.art}`;

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
  <rect x="96" y="51" width="13" height="8" fill="#a6ff00"/>`;

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
  <rect width="${W}" height="${H}" fill="${palette.deep}" opacity=".82"/>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity=".08" stroke="${palette.purple}">${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${700 + i * 34}H1080"/>`).join("")}</g>
  ${inner}
</svg>`;

const files = [];
async function renderSvg(name, svg) {
  const out = path.join(dir, name);
  await sharp(selectedPhoto).resize(W, H, { fit: "cover" }).modulate({ brightness: .42, saturation: .7 })
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 93, chromaSubsampling: "4:4:4" }).toFile(out);
  files.push(out);
}
async function renderCover(name, overlay) {
  const out = path.join(dir, name);
  await sharp(selectedPhoto)
    .resize(W, H, { fit: "cover" })
    .composite([{ input: Buffer.from(overlay), blend: "over" }])
    .jpeg({ quality: 93, chromaSubsampling: "4:4:4" })
    .toFile(out);
  files.push(out);
}

const titleLines = wrap(hook.toUpperCase(), 16);
const titleSize = titleLines.length > 5 ? 48 : titleLines.length > 4 ? 52 : titleLines.length > 3 ? 57 : 64;
const titleGap = titleSize + 8;
const coverDecoration = [
  `<rect x="72" y="930" width="118" height="5" fill="${style.accent}"/>`,
  `<rect x="72" y="287" width="500" height="55" rx="14" fill="#261243" opacity=".86"/>`,
  `<path d="M72 932H475" stroke="${style.accent}" stroke-width="4"/>`,
  `<rect x="59" y="347" width="6" height="${Math.min(450, titleLines.length * titleGap + 35)}" fill="${style.accent}"/>`,
  `<circle cx="112" cy="922" r="33" fill="none" stroke="${style.accent}" stroke-width="3"/><path d="M94 922h36" stroke="${style.accent}" stroke-width="3"/>`
][dayNumber % styles.length];
const coverOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2=".15"><stop offset="0" stop-color="#030106" stop-opacity=".82"/><stop offset=".54" stop-color="#030106" stop-opacity=".62"/><stop offset="1" stop-color="#030106" stop-opacity=".03"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  <g transform="translate(0,115)">${logo}</g>
  ${coverDecoration}
  <text x="72" y="320" font-family="Arial,sans-serif" font-size="22" font-weight="900" letter-spacing="2" fill="${style.accent}">${style.kicker}</text>
  ${textBlock(titleLines, 72, 420, titleSize, titleGap)}
  <rect x="72" y="1020" width="${format === "static" ? 480 : 350}" height="63" rx="31" fill="${style.accent}"/>
  <text x="100" y="1061" font-family="Arial,sans-serif" font-size="22" font-weight="900" fill="#08020f">${format === "static" ? "TESTE GRÁTIS POR 7 DIAS →" : "ARRASTE PARA VER →"}</text>
  <text x="72" y="1160" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#eee5fa">@conecta.crm</text>
  <rect x="899" y="1118" width="115" height="56" rx="16" fill="#080510" opacity=".72"/>
  <text x="1008" y="1160" text-anchor="end" font-family="Arial,sans-serif" font-size="23" font-weight="700" fill="#eee5fa">${format === "static" ? "01 / 01" : "01 / 06"}</text>
</svg>`;

await renderCover("01.jpg", coverOverlay);
if (format !== "static") {

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

  const ctaHeadlines = [
    "LEADS EM ORDEM. TIME EM MOVIMENTO.",
    "PARE DE PERDER OPORTUNIDADES.",
    "DE CONVERSAS A RESULTADOS.",
    "SEU COMERCIAL MERECE CLAREZA.",
    "DÊ O PRÓXIMO PASSO."
  ];
  const ctaPage = `
    ${logo}
    <text x="72" y="395" font-family="Arial,sans-serif" font-size="23" font-weight="900" letter-spacing="3" fill="${palette.lime}">O PRÓXIMO PASSO</text>
    ${textBlock(wrap(ctaHeadlines[dayNumber % ctaHeadlines.length], 18), 72, 515, 62, 70)}
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
const caption = `${captionOpeners[dayNumber % captionOpeners.length]}\n\n${hook}\n\n${topic.body}\n\n${topic.points.map((point) => `• ${point}`).join("\n")}\n\n${cta} Link na bio. 🚀\n\n#ConectaCRM #CRM #Vendas #GestãoComercial #AutomaçãoDeVendas #PME`;
const manifest = { date: dayKey, format, layout, art: selectedPhoto, files: files.map((file) => file.replaceAll(path.sep, "/")), caption };
if (!previewMode) {
  await fs.writeFile("manifest.json", JSON.stringify(manifest, null, 2));
  let history = priorHistory;
  history = history.filter((item) => item.date !== dayKey);
  history.push({ date: dayKey, format, layout, hook, photo: selectedPhoto });
  await fs.writeFile("history.json", JSON.stringify(history.slice(-120), null, 2));
}
console.log(JSON.stringify(manifest, null, 2));
