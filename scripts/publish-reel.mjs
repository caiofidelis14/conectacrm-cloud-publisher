import fs from "node:fs/promises";

const token = process.env.META_ACCESS_TOKEN;
const ig = process.env.IG_USER_ID;
const base = process.env.PUBLIC_BASE_URL;
const manifestPath = process.env.MANIFEST_PATH;
if (!token || !ig || !base || !manifestPath) throw new Error("Configuração Meta incompleta.");

const manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
const api = "https://graph.facebook.com/v23.0";
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(endpoint, params = {}, method = "GET") {
  const values = {...params, access_token: token};
  const url = new URL(`${api}/${endpoint}`);
  const options = {method};
  if (method === "POST") options.body = new URLSearchParams(values);
  else for (const [key, value] of Object.entries(values)) url.searchParams.set(key, value);
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.error) throw new Error(JSON.stringify(data));
  return data;
}

const creation = await request(`${ig}/media`, {
  media_type: "REELS",
  video_url: `${base}/${manifest.video}`,
  caption: manifest.caption,
  share_to_feed: "true",
}, "POST");

let status = "IN_PROGRESS";
for (let attempt = 0; attempt < 36; attempt++) {
  await wait(10000);
  const container = await request(creation.id, {fields: "status_code,status"});
  status = container.status_code;
  console.log(`Processamento Meta: ${status}`);
  if (status === "FINISHED") break;
  if (status === "ERROR" || status === "EXPIRED") throw new Error(container.status || status);
}
if (status !== "FINISHED") throw new Error("Meta não concluiu o processamento do Reel em 6 minutos.");

const published = await request(`${ig}/media_publish`, {creation_id: creation.id}, "POST");
const media = await request(published.id, {fields: "id,permalink,timestamp,media_type"});
console.log(`Reel publicado: ${media.permalink}`);
