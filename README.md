# ConectaCRM Cloud Publisher

Publicador diário gratuito para o Instagram do ConectaCRM usando GitHub Actions e a API oficial da Meta.

## Como funciona

- Executa diariamente às 10h em `America/Sao_Paulo`.
- Gera post estático ou carrossel com variações programáticas.
- Publica as imagens no repositório para que a API da Meta consiga acessá-las.
- Cria o container de mídia e publica no Instagram.

## Segredos obrigatórios

Configure em **Settings → Secrets and variables → Actions**:

- `META_ACCESS_TOKEN`: token da Meta com permissão de publicação.
- `IG_USER_ID`: ID numérico da conta profissional `conecta.crm`.

Nunca salve o token em arquivos ou commits.

## Permissões Meta

Para Facebook Login: `pages_show_list`, `instagram_basic`, `instagram_content_publish` e `pages_read_engagement`.

## Teste

Use **Actions → Publicar no Instagram → Run workflow** depois de configurar os segredos.
