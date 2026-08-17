import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { personalTopics } from "./personal-content.mjs";

const W = 1080, H = 1350;
const now = process.env.POST_DATE ? new Date(`${process.env.POST_DATE}T12:00:00-03:00`) : new Date();
const dayKey = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dayNumber = Math.floor(Date.parse(`${dayKey}T12:00:00Z`) / 86400000);
let history = []; try { history = JSON.parse(await fs.readFile("personal-history.json", "utf8")); } catch {}
const usedHooks = new Set(history.map((item) => item.hook));
const categorySchedule = ["leadership", "business", "law", "strategy", "sales", "mindset", "leadership"];
const targetCategory = categorySchedule[dayNumber % categorySchedule.length];
const categoryTopics = personalTopics.filter((item) => item.category === targetCategory && !usedHooks.has(item.hook));
const anyUnusedTopics = personalTopics.filter((item) => !usedHooks.has(item.hook));
const topicPool = categoryTopics.length ? categoryTopics : anyUnusedTopics;
if (!topicPool.length) throw new Error("Banco de copies provocativas esgotado; adicione novos temas antes de repetir.");
const topic = topicPool[dayNumber % topicPool.length];
const dir = path.join("public", "personal", dayKey);
await fs.mkdir(dir, { recursive: true });
const avatar = (await fs.readFile(new URL("./avatar.png", import.meta.url))).toString("base64");

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const wrap = (text, max) => {
  const out = []; let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > max && line) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out;
};
const textBlock = (lines, x, y, size, lineHeight, weight = 800, color = "#fff") =>
  lines.map((line, i) => `<text x="${x}" y="${y + i * lineHeight}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`).join("");

const hookLines = wrap(topic.hook, 29);
const lessonLines = wrap(topic.lesson, 34);
const hookSize = hookLines.length > 4 ? 55 : 62;
const lessonY = 500 + hookLines.length * 68;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="1080" height="1350" fill="#000"/>
  <clipPath id="avatar"><circle cx="165" cy="187" r="57"/></clipPath>
  <image href="data:image/png;base64,${avatar}" x="108" y="130" width="114" height="114" preserveAspectRatio="xMidYMid slice" clip-path="url(#avatar)"/>
  <text x="244" y="194" font-family="Arial,Helvetica,sans-serif" font-size="39" font-weight="400" fill="#fff">Caio Fidelis</text>
  <text x="244" y="236" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="400" fill="#777">@caiofidelis.elite</text>
  ${textBlock(hookLines, 88, 480, hookSize, 68, 900)}
  ${textBlock(lessonLines, 88, lessonY + 52, 46, 54, 700)}
  <text x="540" y="1272" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="800" fill="#fff">Caio Fidelis | Programa de Aceleração Jurídico</text>
</svg>`;

const file = path.join(dir, "01.jpg");
await sharp(Buffer.from(svg), { density: 144 }).jpeg({ quality: 95 }).toFile(file);
const files = [file.replaceAll(path.sep, "/")];
const caption = `${topic.hook}\n\n${topic.lesson}\n\n${topic.action}\n\nComente sua opinião — inclusive se você discordar.\n\n${topic.hashtags}`;
await fs.writeFile("personal-manifest.json", JSON.stringify({ date: dayKey, format: "static", files, caption }, null, 2));
history = history.filter((x) => x.date !== dayKey);
history.push({ date: dayKey, hook: topic.hook, category: topic.category, template: "caio-preto-oficial" });
await fs.writeFile("personal-history.json", JSON.stringify(history.slice(-180), null, 2));
console.log(JSON.stringify({ date: dayKey, hook: topic.hook, files }, null, 2));
