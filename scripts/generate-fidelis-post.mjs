import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const mode = process.env.FIDELIS_MODE || process.argv[2] || 'product';
const zone = 'America/Sao_Paulo';
const now = new Date();
const day = new Intl.DateTimeFormat('en-CA', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
const root = path.resolve('public/fidelis', day, mode);
const asset = (name) => path.resolve('scripts/fidelis-assets', name);
const W = 1080, H = 1350;
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
const text = (value, x, y, size, color = '#fff', weight = 700, extra = '') => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" ${extra}>${esc(value)}</text>`;
const wrap = (input, limit) => {
  const words = String(input).trim().split(/\s+/), lines = []; let line = '';
  for (const word of words) { const next = line ? `${line} ${word}` : word; if (next.length > limit && line) { lines.push(line); line = word; } else line = next; }
  if (line) lines.push(line); return lines;
};
const lines = (items, x, y, size, gap, color = '#fff', weight = 700) => items.map((line, i) => text(line, x, y + i * gap, size, color, weight)).join('');
const logo = sharp(await fs.readFile(asset('logo-original.png')));
const logoMark = await logo.clone().extract({ left: 28, top: 40, width: 95, height: 125 }).png().toBuffer();
const logoWord = await logo.clone().extract({ left: 142, top: 64, width: 320, height: 43 }).png().toBuffer();
const brand = async () => [
  { input: await sharp(logoMark).resize({ width: 57 }).toBuffer(), left: 68, top: 64 },
  { input: await sharp(logoWord).resize({ width: 299 }).toBuffer(), left: 139, top: 88 },
];
const decode = (s) => s.replaceAll('<![CDATA[', '').replaceAll(']]>', '').replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
async function news() {
  const response = await fetch('https://agenciabrasil.ebc.com.br/rss/economia/feed.xml', { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Fonte indisponível: HTTP ${response.status}`);
  const xml = await response.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, block]) => {
    const field = (name) => decode((block.match(new RegExp(`<${name}>([\\s\\S]*?)<\\/${name}>`)) || [,''])[1].trim());
    return { title: field('title'), url: field('link'), date: new Date(field('pubDate')) };
  });
  const relevant = /empresa|negócio|econom|tribut|arrecada|pib|selic|crédito|indústria|serviço|inflação|reforma|exporta|comércio|investimento/i;
  const item = items.find((i) => i.title && i.url.startsWith('https://agenciabrasil.ebc.com.br/') && !Number.isNaN(i.date.valueOf()) && now - i.date < 14 * 86400000 && relevant.test(i.title));
  if (!item) throw new Error('Nenhuma notícia recente e relevante encontrada; publicação cancelada.');
  const headline = wrap(item.title.replace(/\s*\|.*$/, ''), 25).slice(0, 5);
  if (headline.join(' ').length < item.title.length - 35) throw new Error('Manchete extensa demais; revisão necessária.');
  const sourceDate = new Intl.DateTimeFormat('pt-BR', { timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric' }).format(item.date);
  const overlay = svg(`
    <defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".38"/><stop offset=".43" stop-color="#000" stop-opacity=".08"/><stop offset=".68" stop-color="#000" stop-opacity=".76"/><stop offset="1" stop-color="#000" stop-opacity=".96"/></linearGradient></defs>
    <rect width="1080" height="1350" fill="url(#shade)"/>
    ${text('Fidelis', 722, 99, 37, '#fff', 700)}${text('News', 853, 99, 37, '#d9aa65', 700)}
    <rect x="1003" y="84" width="77" height="4" fill="#d9aa65"/>
    <rect x="68" y="858" width="185" height="54" fill="#db171d"/>
    ${text('EM PAUTA', 90, 896, 28)}
    ${lines(headline, 68, 993, headline.length > 3 ? 59 : 68, headline.length > 3 ? 72 : 82)}
    ${text(`Fonte: Agência Brasil · ${sourceDate}`, 70, 1265, 23, '#e5ded4', 400)}
    <rect x="70" y="1291" width="100" height="3" fill="#d9aa65"/>
  `);
  const caption = `${item.title}\n\nNotícia publicada pela Agência Brasil em ${sourceDate}. Acompanhe a matéria completa na fonte: ${item.url}\n\nAqui na Fidelis, informação vira contexto para decisões empresariais. Esta publicação é informativa e não substitui análise individual.\n\n#FidelisNews #FidelisEmpresarial #Negócios #GestãoEmpresarial`;
  return { background: 'news-desk.png', overlay, caption, source: item.url, topic: item.title };
}
const products = [
  { topic: 'Sistemas empresariais', accent: '#42b7ff', bg: 'product-systems.png', title: ['Sistemas', 'empresariais'], subtitle: 'Tecnologia feita para a operação real da sua empresa.', benefits: ['Processos mais eficientes', 'Informações em tempo real', 'Integração com sua equipe'], caption: 'Planilha demais, visibilidade de menos? Criamos sistemas sob medida para organizar processos, conectar equipes e apoiar decisões com dados. Converse com a Fidelis sobre a sua operação. #FidelisEmpresarial #SistemasEmpresariais #Tecnologia' },
  { topic: 'Hub empresarial', accent: '#42b7ff', bg: 'product-hub.png', title: ['Um hub para', 'o seu negócio'], subtitle: 'Soluções diferentes. Uma visão integrada.', benefits: ['Estratégia conectada', 'Parceiros para cada desafio', 'Execução com direção'], caption: 'Sua empresa não vive em caixinhas. O hub empresarial da Fidelis reúne frentes de tecnologia, gestão, marketing e estratégia para enxergar o negócio por inteiro. Fale com um associado. #FidelisEmpresarial #HubEmpresarial #Negócios' },
  { topic: 'Planejamento tributário', accent: '#d9aa65', bg: 'product-tax.png', title: ['Planejamento', 'tributário'], subtitle: 'Decisões fiscais começam antes do fechamento.', benefits: ['Diagnóstico da operação', 'Cenários para decidir', 'Acompanhamento contínuo'], caption: 'Planejamento tributário não é atalho: é método, dados e análise do contexto da empresa. A Fidelis ajuda você a avaliar caminhos com responsabilidade. Fale com um especialista. #FidelisEmpresarial #PlanejamentoTributário' },
  { topic: 'Marketing empresarial', accent: '#42b7ff', bg: 'product-hub.png', title: ['Marketing que', 'move negócios'], subtitle: 'Posicionamento, demanda e consistência.', benefits: ['Marca com direção', 'Conteúdo com propósito', 'Indicadores de resultado'], caption: 'Marketing empresarial não é apenas postar. É tornar sua proposta clara para o mercado certo, medir a resposta e ajustar a rota. Conheça as soluções da Fidelis. #FidelisEmpresarial #MarketingEmpresarial' },
  { topic: 'Gestão de passivo tributário', accent: '#d9aa65', bg: 'product-tax.png', title: ['Passivo tributário', 'sob controle'], subtitle: 'Clareza para agir antes que o problema cresça.', benefits: ['Mapeamento da situação', 'Priorização de riscos', 'Plano de ação responsável'], caption: 'Passivo tributário pede diagnóstico, prioridade e estratégia — não promessa fácil. A Fidelis ajuda sua empresa a entender o cenário e construir um plano de ação. Fale com um especialista. #FidelisEmpresarial #GestãoTributária' },
];
async function product() {
  const week = Math.floor((Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - Date.UTC(2026, 0, 1)) / (7 * 86400000));
  const p = products[(((week - 2) % products.length) + products.length) % products.length];
  const overlay = svg(`
    <defs><linearGradient id="shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#02070e" stop-opacity=".96"/><stop offset=".52" stop-color="#02070e" stop-opacity=".72"/><stop offset="1" stop-color="#02070e" stop-opacity=".05"/></linearGradient></defs>
    <rect width="1080" height="1350" fill="url(#shade)"/>
    ${text('SOLUÇÕES FIDELIS', 765, 97, 20, '#d9e1e9', 500, 'letter-spacing="4"')}
    ${text(p.title[0], 68, 349, 70)}${text(p.title[1], 68, 428, 70, p.accent)}
    ${lines(wrap(p.subtitle, 32), 70, 494, 29, 38, '#f3f6f8', 400)}
    <rect x="70" y="550" width="55" height="4" fill="${p.accent}"/>
    ${p.benefits.map((b, i) => `<rect x="70" y="${635+i*106}" width="65" height="65" rx="13" fill="#0c1825" stroke="${p.accent}" stroke-opacity=".48"/><circle cx="102" cy="${667+i*106}" r="8" fill="${p.accent}"/>${text(b, 159, 674+i*106, 25, '#fff', 500)}`).join('')}
    <rect x="70" y="1045" width="445" height="76" rx="38" fill="${p.accent}"/>
    ${text('FALE COM UM ASSOCIADO  →', 105, 1095, 23, '#07111b', 700)}
    ${text('ESTRATÉGIA  ·  TECNOLOGIA  ·  CRESCIMENTO', 70, 1260, 18, '#e1e6ea', 500, 'letter-spacing="3"')}
  `);
  return { background: p.bg, overlay, caption: p.caption, topic: p.topic };
}
if (!['news', 'product'].includes(mode)) throw new Error('Use FIDELIS_MODE=news ou product');
const result = mode === 'news' ? await news() : await product();
await fs.mkdir(root, { recursive: true });
const output = path.join(root, '01.jpg');
await sharp(asset(result.background)).resize(W, H, { fit: 'cover' }).composite([{ input: result.overlay }, ...await brand()]).jpeg({ quality: 91 }).toFile(output);
const manifest = { files: [path.relative(process.cwd(), output).replaceAll('\\', '/')], caption: result.caption, topic: result.topic, source: result.source || null };
const manifestPath = `fidelis-manifest-${mode}.json`;
await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Gerado: ${output} | ${manifestPath} | ${result.topic}`);
