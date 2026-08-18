import fs from "node:fs/promises";

const token = process.env.META_ACCESS_TOKEN;
const businessId = process.env.META_BUSINESS_ID;
const target = (process.env.TARGET_USERNAME || "").replace(/^@/, "").toLowerCase();
if (!token || !businessId || !target) throw new Error("Configure META_ACCESS_TOKEN, META_BUSINESS_ID e TARGET_USERNAME");
const url = new URL(`https://graph.facebook.com/v23.0/${businessId}/owned_instagram_accounts`);
url.searchParams.set("fields", "id,username");
url.searchParams.set("limit", "100");
url.searchParams.set("access_token", token);
const response = await fetch(url);
const payload = await response.json();
if (!response.ok || payload.error) throw new Error(JSON.stringify(payload));
const account = payload.data?.find((item) => item.username?.toLowerCase() === target);
if (!account) throw new Error(`@${target} não apareceu entre as contas do portfólio ${businessId}. Encontradas: ${(payload.data || []).map(x => `@${x.username}`).join(", ") || "nenhuma"}`);
console.log(`Instagram confirmado: @${account.username} (${account.id})`);
if (process.env.GITHUB_ENV) await fs.appendFile(process.env.GITHUB_ENV, `IG_USER_ID=${account.id}\n`);
else console.log(`IG_USER_ID=${account.id}`);
