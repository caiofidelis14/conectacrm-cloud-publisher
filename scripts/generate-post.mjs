import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { topics, ctas } from "./content.mjs";

const W = 1080;
const H = 1350;
const now = new Date();
const dayKey = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dayNumber = Math.floor(Date.parse(`${dayKey}T12:00:00Z`) / 86400000);
const topicCycle = Math.floor(dayNumber / topics.length);
const topic = topics[dayNumber % topics.length];
const cta = ctas[dayNumber % ctas.length];
const format = dayNumber % 10 === 0 ? "static" : "carousel";
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
  "https://images.unsplash.com/photo-1517841905240-472988babdf9"
];

const palettes = [
  { purple: "#7c35ff", deep: "#10051f", lime: "#9cff39" },
  { purple: "#9a2fff", deep: "#090318", lime: "#b2ff43" },
  { purple: "#6538ff", deep: "#080520", lime: "#7dff54" },
  { purple: "#b52dff", deep: "#13031c", lime: "#a6ff2f" }
];
const palette = palettes[dayNumber % palettes.length];
const photoUrl = `${coverPhotos[dayNumber % coverPhotos.length]}?auto=format&fit=crop&w=${W}&h=${H}&q=88&crop=faces`;

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
    <radialGradient id="bg" cx="80%" cy="5%">
      <stop stop-color="${palette.purple}" stop-opacity=".42"/>
      <stop offset="1" stop-color="${palette.deep}" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="22" stdDeviation="28" flood-color="#000" flood-opacity=".45"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="${palette.deep}"/>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g opacity=".13" stroke="${palette.purple}">${Array.from({ length: 18 }, (_, i) => `<path d="M0 ${700 + i * 34}H1080"/>`).join("")}</g>
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

const coverOverlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="shade" x1="0" x2="1">
      <stop offset=".05" stop-color="${palette.deep}" stop-opacity=".98"/>
      <stop offset=".62" stop-color="${palette.deep}" stop-opacity=".72"/>
      <stop offset="1" stop-color="${palette.purple}" stop-opacity=".20"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#shade)"/>
  ${logo}
  <text x="72" y="340" font-family="Arial,sans-serif" font-size="22" font-weight="900" letter-spacing="3" fill="${palette.lime}">A VERDADE QUE NINGUÉM TE CONTA</text>
  ${textBlock(wrap(topic.hook.toUpperCase(), 21), 72, 440, 72, 78)}
  <text x="72" y="1085" font-family="Arial,sans-serif" font-size="27" font-weight="800" fill="#fff">Arraste para entender →</text>
  ${footer("@conecta.crm", 1)}
</svg>`;

if (format === "static") {
  await renderCover("01.jpg", coverOverlay.replace("Arraste para entender →", "Teste grátis por 7 dias →"));
} else {
  await renderCover("01.jpg", coverOverlay);

  for (let i = 0; i < topic.points.length; i++) {
    const card = `
      ${logo}
      <rect x="84" y="260" width="912" height="720" rx="34" fill="#130c20" stroke="${palette.purple}" stroke-opacity=".45" filter="url(#shadow)"/>
      <circle cx="150" cy="345" r="42" fill="${palette.purple}"/>
      <text x="134" y="362" font-family="Arial,sans-serif" font-size="48" font-weight="900" fill="#fff">C</text>
      <text x="215" y="336" font-family="Arial,sans-serif" font-size="28" font-weight="900" fill="#fff">ConectaCRM</text>
      <text x="215" y="371" font-family="Arial,sans-serif" font-size="22" fill="#bdb1ca">@conecta.crm · Gestão de vendas</text>
      <text x="128" y="490" font-family="Arial,sans-serif" font-size="25" font-weight="900" fill="${palette.lime}">PONTO ${String(i + 1).padStart(2, "0")}</text>
      ${textBlock(wrap(topic.points[i].toUpperCase(), 24), 128, 585, 58, 66)}
      ${textBlock(wrap(topic.body, 42), 128, 790, 30, 43, "#ded5e8", 500)}
      ${footer(i === topic.points.length - 1 ? "Continue para o CTA →" : "Continue lendo →", i + 2)}`;
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
const caption = `${captionOpeners[topicCycle % captionOpeners.length]}\n\n${topic.hook}\n\n${topic.body}\n\n${topic.points.map((point) => `• ${point}`).join("\n")}\n\n${cta} Link na bio. 🚀\n\n#ConectaCRM #CRM #Vendas #GestãoComercial #AutomaçãoDeVendas #PME`;
const manifest = { date: dayKey, format, photoUrl, files: files.map((file) => file.replaceAll(path.sep, "/")), caption };
await fs.writeFile("manifest.json", JSON.stringify(manifest, null, 2));

let history = [];
try {
  history = JSON.parse(await fs.readFile("history.json", "utf8"));
} catch {}
history.push({ date: dayKey, format, hook: topic.hook, photo: coverPhotos[dayNumber % coverPhotos.length] });
await fs.writeFile("history.json", JSON.stringify(history.slice(-120), null, 2));
console.log(JSON.stringify(manifest, null, 2));
