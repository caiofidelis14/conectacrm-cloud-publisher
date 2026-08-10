import fs from "node:fs/promises";

const token=process.env.META_ACCESS_TOKEN;
const ig=process.env.IG_USER_ID;
const base=process.env.PUBLIC_BASE_URL;
if(!token||!ig||!base) throw new Error("Configure META_ACCESS_TOKEN, IG_USER_ID e PUBLIC_BASE_URL");
const manifestPath=process.env.MANIFEST_PATH||"manifest.json";
const manifest=JSON.parse(await fs.readFile(manifestPath,"utf8"));
const api="https://graph.facebook.com/v23.0";
async function post(endpoint,params){const body=new URLSearchParams({...params,access_token:token});const res=await fetch(`${api}/${endpoint}`,{method:"POST",body});const data=await res.json();if(!res.ok||data.error)throw new Error(JSON.stringify(data));return data;}
const urls=manifest.files.map(f=>`${base}/${f}`);
let creation;
if(urls.length===1){creation=(await post(`${ig}/media`,{image_url:urls[0],caption:manifest.caption})).id;}
else{const children=[];for(const url of urls)children.push((await post(`${ig}/media`,{image_url:url,is_carousel_item:"true"})).id);creation=(await post(`${ig}/media`,{media_type:"CAROUSEL",children:children.join(","),caption:manifest.caption})).id;}
await new Promise(r=>setTimeout(r,5000));
const published=await post(`${ig}/media_publish`,{creation_id:creation});
console.log(`Publicado: ${published.id}`);
