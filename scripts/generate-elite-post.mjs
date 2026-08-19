import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { eliteTopics, slotCopy } from "./elite-content.mjs";

const W = 1080, H = 1350;
const validSlots = new Set(["educational", "aggressive", "sales"]);
const slot = process.env.POST_SLOT || "educational";
if (!validSlots.has(slot)) throw new Error(`POST_SLOT inválido: ${slot}`);
const now = process.env.POST_DATE ? new Date(`${process.env.POST_DATE}T12:00:00-03:00`) : new Date();
const dayKey = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dayNumber = Math.floor(Date.parse(`${dayKey}T12:00:00Z`) / 86400000);
let history = []; try { history = JSON.parse(await fs.readFile("elite-history.json", "utf8")); } catch {}
const used = new Set(history.map((item) => `${item.slot}:${item.hook}`));
let selected;
for (let offset = 0; offset < eliteTopics.length * 3; offset++) {
  const index = (dayNumber + offset) % eliteTopics.length;
  const variant = Math.floor((dayNumber + offset) / eliteTopics.length) % 3;
  const copy = slotCopy[slot](eliteTopics[index], variant);
  if (!used.has(`${slot}:${copy.hook}`)) { selected = { ...copy, topic: eliteTopics[index].key, variant }; break; }
}
if (!selected) throw new Error(`Banco ${slot} esgotado antes de repetir. Adicione novas pautas.`);

const dir = path.join("public", "elite", dayKey, slot);
await fs.mkdir(dir, { recursive: true });
const avatar = (await fs.readFile(new URL("./advogado-elite-avatar.jpg", import.meta.url))).toString("base64");
const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const wrap = (text, max) => { const out=[]; let line=""; for (const word of text.split(/\s+/)) { const next=line?`${line} ${word}`:word; if(next.length>max&&line){out.push(line);line=word;}else line=next;} if(line)out.push(line); return out; };
const block = (lines,x,y,size,lh,weight=800,color="#fff") => lines.map((line,i)=>`<text x="${x}" y="${y+i*lh}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`).join("");
const hookLines = wrap(selected.hook, 29);
const lessonLines = wrap(selected.lesson, 35);
const hookSize = hookLines.length > 4 ? 52 : 60;
const lessonSize = lessonLines.length > 5 ? 39 : 44;
const hookY = 390;
const lessonY = hookY + hookLines.length * 67 + 30;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<rect width="1080" height="1350" fill="#000"/><clipPath id="a"><circle cx="165" cy="187" r="57"/></clipPath>
<image href="data:image/jpeg;base64,${avatar}" x="108" y="130" width="114" height="114" preserveAspectRatio="xMidYMid slice" clip-path="url(#a)"/>
<text x="244" y="194" font-family="Arial,Helvetica,sans-serif" font-size="36" fill="#fff">Metodologia Elite</text>
<text x="244" y="236" font-family="Arial,Helvetica,sans-serif" font-size="27" fill="#777">@advogadodeelitee</text>
${block(hookLines,88,hookY,hookSize,67,900)}${block(lessonLines,88,lessonY,lessonSize,51,650,"#e5e5e5")}
<text x="540" y="1270" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="800" fill="#fff">Advogado de Elite | Estrutura para crescer</text></svg>`;
const file = path.join(dir, "01.jpg");
await sharp(Buffer.from(svg), { density: 144 }).jpeg({ quality: 95 }).toFile(file);
const files = [file.replaceAll(path.sep, "/")];
const caption = `${selected.hook}\n\n${selected.lesson}\n\n${selected.action}\n\nConteúdo informativo. Cada situação exige análise individual.\n\n#Advocacia #GestãoJurídica #EscritórioDeAdvocacia #AdvogadoDeElite`;
const manifest = `elite-manifest-${slot}.json`;
await fs.writeFile(manifest, JSON.stringify({ date: dayKey, slot, format: "static", files, caption }, null, 2));
history.push({ date: dayKey, slot, hook: selected.hook, topic: selected.topic, variant: selected.variant, template: "elite-twitter-oficial" });
await fs.writeFile("elite-history.json", JSON.stringify(history.slice(-500), null, 2));
console.log(JSON.stringify({ date: dayKey, slot, hook: selected.hook, files, manifest }, null, 2));
