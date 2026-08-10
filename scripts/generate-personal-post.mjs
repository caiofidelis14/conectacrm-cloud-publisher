import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { personalTopics } from "./personal-content.mjs";

const W = 1080, H = 1350;
const now = process.env.POST_DATE ? new Date(`${process.env.POST_DATE}T12:00:00-03:00`) : new Date();
const dayKey = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dayNumber = Math.floor(Date.parse(`${dayKey}T12:00:00Z`) / 86400000);
const topic = personalTopics[dayNumber % personalTopics.length];
const dir = path.join("public", "personal", dayKey);
await fs.mkdir(dir, { recursive: true });

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const wrap = (text, max) => { const out=[]; let line=""; for (const word of text.split(/\s+/)) { const n=line?`${line} ${word}`:word; if(n.length>max&&line){out.push(line);line=word}else line=n; } if(line)out.push(line); return out; };
const block = (lines,x,y,size,lh,color="#14110f",weight=800) => lines.map((line,i)=>`<text x="${x}" y="${y+i*lh}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(line)}</text>`).join("");
const signature = `<text x="72" y="1230" font-family="Arial,sans-serif" font-size="25" font-weight="900" fill="#14110f">Caio Fidelis</text><text x="72" y="1266" font-family="Arial,sans-serif" font-size="20" fill="#675f57">@caiofidelis.elite</text>`;
const themes = [
  {bg:"#f2eadf",accent:"#ef5b2a",ink:"#14110f"},
  {bg:"#111111",accent:"#ffd329",ink:"#ffffff"},
  {bg:"#e8f0ff",accent:"#2457ff",ink:"#101528"},
  {bg:"#f5f2ea",accent:"#0a8f62",ink:"#171714"}
];
const t=themes[dayNumber%themes.length];
const sig = signature.replaceAll("#14110f", t.ink).replaceAll("#675f57", t.ink === "#ffffff" ? "#c6c6c6" : "#675f57");
const svg = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="${t.bg}"/>${inner}</svg>`;
const page1 = svg(`<rect x="72" y="92" width="92" height="12" fill="${t.accent}"/><text x="72" y="190" font-family="Arial,sans-serif" font-size="23" font-weight="900" letter-spacing="3" fill="${t.accent}">UMA VERDADE SOBRE VENDAS</text>${block(wrap(topic.hook.toUpperCase(),18),72,330,76,84,t.ink,900)}<text x="72" y="1125" font-family="Arial,sans-serif" font-size="25" font-weight="800" fill="${t.accent}">LEIA E APLIQUE →</text>${sig}<text x="1008" y="1260" text-anchor="end" font-family="Arial,sans-serif" font-size="21" fill="${t.ink}">01 / 02</text>`);
const page2 = svg(`<text x="72" y="145" font-family="Arial,sans-serif" font-size="23" font-weight="900" letter-spacing="3" fill="${t.accent}">O QUE FAZER NA PRÁTICA</text>${block(wrap(topic.lesson,31),72,285,54,65,t.ink,800)}<rect x="72" y="820" width="936" height="238" rx="26" fill="${t.accent}"/>${block(wrap(topic.action.toUpperCase(),30),112,900,37,49,t.bg,900)}${sig}<text x="1008" y="1260" text-anchor="end" font-family="Arial,sans-serif" font-size="21" fill="${t.ink}">02 / 02</text>`);
const files=[]; for (const [i,content] of [page1,page2].entries()) { const file=path.join(dir,`${String(i+1).padStart(2,"0")}.jpg`); await sharp(Buffer.from(content)).jpeg({quality:94}).toFile(file); files.push(file.replaceAll(path.sep,"/")); }
const caption = `${topic.hook}\n\n${topic.lesson}\n\nAção de hoje: ${topic.action}\n\nConcorda ou discorda? Salve para aplicar e envie para alguém que precisa vender melhor.\n\n#Vendas #Negociação #Empreendedorismo #GestãoComercial #CaioFidelis`;
await fs.writeFile("personal-manifest.json", JSON.stringify({date:dayKey,format:"carousel",files,caption},null,2));
let history=[]; try { history=JSON.parse(await fs.readFile("personal-history.json","utf8")); } catch {}
history=history.filter(x=>x.date!==dayKey); history.push({date:dayKey,hook:topic.hook,theme:dayNumber%themes.length});
await fs.writeFile("personal-history.json", JSON.stringify(history.slice(-180),null,2));
console.log(JSON.stringify({date:dayKey,hook:topic.hook,files},null,2));
