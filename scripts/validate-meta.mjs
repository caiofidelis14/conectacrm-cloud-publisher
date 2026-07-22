const { META_ACCESS_TOKEN, IG_USER_ID } = process.env;

if (!META_ACCESS_TOKEN || !IG_USER_ID) {
  throw new Error("META_ACCESS_TOKEN e IG_USER_ID sao obrigatorios.");
}

const url = new URL(`https://graph.facebook.com/v23.0/${IG_USER_ID}`);
url.searchParams.set("fields", "id,username,name");
url.searchParams.set("access_token", META_ACCESS_TOKEN);

const response = await fetch(url);
const data = await response.json();
if (!response.ok || data.error) {
  throw new Error(`Falha ao validar a Meta: ${data.error?.message || response.status}`);
}
if (String(data.id) !== String(IG_USER_ID)) {
  throw new Error("A conta retornada nao corresponde ao IG_USER_ID configurado.");
}

console.log(`Meta validada para @${data.username || "conta-profissional"}.`);
