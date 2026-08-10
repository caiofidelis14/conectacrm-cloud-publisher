const token = process.env.META_ACCESS_TOKEN;
const pageId = process.env.FACEBOOK_PAGE_ID;
if (!token || !pageId) throw new Error("Configure META_ACCESS_TOKEN e FACEBOOK_PAGE_ID");

const url = new URL(`https://graph.facebook.com/v23.0/${pageId}`);
url.searchParams.set("fields", "name,connected_instagram_account{id,username}");
url.searchParams.set("access_token", token);
const response = await fetch(url);
const data = await response.json();
if (!response.ok || data.error) throw new Error(JSON.stringify(data));
if (!data.connected_instagram_account?.id) throw new Error("A Página não retornou uma conta profissional do Instagram conectada.");
console.log(`Página: ${data.name}`);
console.log(`Instagram: @${data.connected_instagram_account.username}`);
console.log(`IG_USER_ID: ${data.connected_instagram_account.id}`);
