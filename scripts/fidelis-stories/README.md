# Carrossel editorial Fidelis News

Formato reutilizável de seis páginas, 1080 × 1350 px, com identidade Fidelis (preto, branco e dourado): capa fotográfica, dado principal, explicação, marcos de data, próximos passos e fechamento. A cadência foi inspirada em um post público de referência, mas textos, composição, fotos e marca são próprios.

Os títulos e números usam **Anton**, fonte de manchete condensada visualmente próxima à referência. O arquivo está incluído em `scripts/fidelis-assets/fonts/` sob licença SIL OFL; a família exata do post externo não foi confirmada. Texto corrido permanece em sans-serif para leitura no celular.

1. Pesquise uma pauta recente e confira número, data, prazo e consequência em fonte primária. Não use apenas a legenda de outro perfil.
2. Crie um novo JSON nesta pasta a partir do exemplo `simples-2027-rfb-2026-10-16.json`, com `slug` novo e fonte identificável. Não reaproveite a pauta antiga para a próxima publicação.
3. Revise a copy inteira; o renderizador não verifica automaticamente a veracidade nem a vigência da notícia.
4. Gere uma prévia sem alterar os manifestos públicos:

   `FIDELIS_STORY=<slug> FIDELIS_PREVIEW_DIR=previews/fidelis-news-editorial/<slug> npm run generate-fidelis-carousel`

5. Após revisão e autorização para publicar, execute o fluxo manual `fidelis-instagram.yml` com formato `carousel-news`, informe o mesmo `slug` em `story` e escolha `publish=true` apenas se o acesso da Meta estiver validado.

O fluxo da Fidelis não tem agenda automática ativa. Gerar JPEGs ou salvar o template não equivale a postar no Instagram. A fonte e a data aparecem nos cards; a legenda traz o link completo e ressalva de análise individual.
