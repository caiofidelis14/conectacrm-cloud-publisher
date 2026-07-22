import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { topics, ctas } from "./content.mjs";

const now = new Date();
const dayKey = now.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const dayNumber = Math.floor(Date.parse(`${dayKey}T12:00:00Z`) / 86400000);
const topic = topics[dayNumber % topics.length];
const cta = ctas[dayNumber % ctas.length];
const format = dayNumber % 3 === 0 ? "static" : "carousel";
const dir = path.join("public", dayKey);
await fs.mkdir(dir, { recursive: true });

const esc = (s) => s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const wrap = (text, max = 25) => {
  const words = text.split(/\s+/); const lines = []; let line = "";
  for (const w of words) { const next = line ? `${line} ${w}` : w; if (next.length > max && line) { lines.push(line); line = w; } else line = next; }
  if (line) lines.push(line); return lines;
};
const textBlock = (lines, x, y, size, lineHeight, color="#fff", weight=800) => lines.map((l,i)=>`<text x="${x}" y="${y+i*lineHeight}" font-family="Arial,sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${esc(l)}</text>`).join("");
const base = (inner) => `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080"><defs><radialGradient id="g"><stop stop-color="#5720a5"/><stop offset="1" stop-color="#08020f"/></radialGradient><filter id="glow"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="1080" height="1080" fill="#07020d"/><circle cx="910" cy="150" r="420" fill="url(#g)" opacity=".75"/><circle cx="180" cy="1020" r="360" fill="#38106f" opacity=".45"/><g opacity=".15" stroke="#9b55ff">${Array.from({length:20},(_,i)=>`<path d="M0 ${500+i*32}H1080"/>`).join("")}</g>${inner}</svg>`;
const logo = `<text x="70" y="95" font-family="Arial,sans-serif" font-size="38" font-weight="900" fill="#8d3cff">C</text><text x="112" y="84" font-family="Arial,sans-serif" font-size="25" font-weight="800" fill="#fff">Conecta</text><text x="112" y="107" font-family="Arial,sans-serif" font-size="22" font-weight="800" fill="#fff">crm</text><rect x="91" y="52" width="12" height="7" fill="#8cf42f"/>`;
const files=[];
async function render(name, svg){const out=path.join(dir,name);await sharp(Buffer.from(svg)).jpeg({quality:92}).toFile(out);files.push(out);}

if(format==="static"){
  const title=wrap(topic.hook.toUpperCase(),22);
  await render("01.jpg",base(`${logo}<text x="70" y="270" font-family="Arial,sans-serif" font-size="20" font-weight="900" letter-spacing="3" fill="#a85cff">GESTÃO COMERCIAL</text>${textBlock(title,70,370,70,72)}${textBlock(wrap(topic.body,42),70,700,30,42,"#d9cee7",500)}<rect x="70" y="900" width="520" height="70" rx="14" fill="#8cf42f"/><text x="98" y="946" font-family="Arial,sans-serif" font-size="24" font-weight="900" fill="#09040f">TESTE GRÁTIS POR 7 DIAS →</text>`));
}else{
  await render("01.jpg",base(`${logo}<text x="70" y="260" font-family="Arial,sans-serif" font-size="20" font-weight="900" letter-spacing="3" fill="#a85cff">PARE DE VENDER NO IMPROVISO</text>${textBlock(wrap(topic.hook.toUpperCase(),21),70,370,68,70)}<text x="70" y="930" font-family="Arial,sans-serif" font-size="24" font-weight="800" fill="#8cf42f">ARRASTE PARA ENTENDER →</text>`));
  for(let i=0;i<topic.points.length;i++) await render(`${String(i+2).padStart(2,"0")}.jpg`,base(`${logo}<text x="70" y="290" font-family="Arial,sans-serif" font-size="120" font-weight="900" fill="#8d3cff">0${i+1}</text>${textBlock(wrap(topic.points[i].toUpperCase(),21),70,450,68,70)}${textBlock(wrap(topic.body,43),70,720,30,42,"#d9cee7",500)}<text x="930" y="1000" font-family="Arial,sans-serif" font-size="20" fill="#8d819a">${i+2}/6</text>`));
  await render("06.jpg",base(`${logo}<text x="70" y="300" font-family="Arial,sans-serif" font-size="20" font-weight="900" letter-spacing="3" fill="#a85cff">COMECE AGORA</text>${textBlock(wrap(cta.toUpperCase(),22),70,410,68,70)}<rect x="70" y="850" width="520" height="70" rx="14" fill="#8cf42f"/><text x="98" y="896" font-family="Arial,sans-serif" font-size="24" font-weight="900" fill="#09040f">LINK NA BIO →</text>`));
}
const caption=`${topic.hook}\n\n${topic.body}\n\n${topic.points.map(p=>`• ${p}`).join("\n")}\n\n${cta} Link na bio. 🚀\n\n#ConectaCRM #CRM #Vendas #GestãoComercial #AutomaçãoDeVendas #PME`;
const manifest={date:dayKey,format,files:files.map(f=>f.replaceAll(path.sep,"/")),caption};
await fs.writeFile("manifest.json",JSON.stringify(manifest,null,2));
let history=[];try{history=JSON.parse(await fs.readFile("history.json","utf8"));}catch{}
history.push({date:dayKey,format,hook:topic.hook});
await fs.writeFile("history.json",JSON.stringify(history.slice(-120),null,2));
console.log(JSON.stringify(manifest,null,2));
