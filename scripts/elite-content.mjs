export const eliteTopics = [
  { key: "triagem", problem: "aceita qualquer caso que chega", cause: "não definiu critérios objetivos de triagem", lesson: "crie perguntas eliminatórias antes da reunião e preserve a agenda para casos aderentes", consequence: "agenda cheia de consultas improdutivas", offer: "um processo de captação que filtra antes de consumir seu tempo" },
  { key: "honorarios", problem: "reduz honorários para não perder o cliente", cause: "apresenta preço antes de construir valor e segurança", lesson: "diagnostique o risco, mostre o caminho e só então apresente a proposta", consequence: "trabalha mais, lucra menos e ainda atrai o cliente errado", offer: "um método comercial que sustenta honorários melhores sem promessas indevidas" },
  { key: "indicacao", problem: "depende exclusivamente de indicação", cause: "confundiu reputação com estratégia de crescimento", lesson: "mantenha a indicação, mas construa conteúdo, relacionamento e acompanhamento mensurável", consequence: "o faturamento fica nas mãos de terceiros", offer: "uma operação previsível sem abandonar a autoridade construída" },
  { key: "followup", problem: "manda proposta e espera o cliente voltar", cause: "não definiu próximo passo, prazo nem responsável", lesson: "termine cada conversa com uma decisão agendada e faça follow-up com contexto", consequence: "boas oportunidades esfriam no WhatsApp", offer: "um acompanhamento profissional que conduz sem pressionar" },
  { key: "posicionamento", problem: "fala com todo mundo e sobre tudo", cause: "tem medo de escolher um mercado e parecer pequeno", lesson: "defina problema, público e tese de atuação que o cliente consiga repetir", consequence: "parece igual a centenas de escritórios", offer: "um posicionamento claro para ser lembrado pelo caso certo" },
  { key: "atendimento", problem: "demora horas para responder novos contatos", cause: "não existe dono, prazo ou padrão para o primeiro atendimento", lesson: "centralize as entradas, defina SLA e registre cada tentativa de contato", consequence: "o cliente contrata quem respondeu primeiro com clareza", offer: "uma rotina de atendimento que reduz oportunidades esquecidas" },
  { key: "agenda", problem: "vive ocupado e chama isso de crescimento", cause: "mistura tarefa técnica, gestão e atendimento na mesma agenda", lesson: "separe blocos, delegue o repetível e proteja horário de decisão", consequence: "o escritório cresce em esforço, não em estrutura", offer: "uma gestão que devolve direção ao dono do escritório" },
  { key: "sociedade", problem: "divide sociedade sem definir função e cobrança", cause: "confiou na amizade para resolver o que deveria estar em acordo", lesson: "documente papéis, metas, alçadas, remuneração e regra de saída", consequence: "todo impasse vira desgaste pessoal", offer: "governança simples para transformar sócios em gestores" },
  { key: "processos", problem: "resolve cada caso como se fosse o primeiro", cause: "o conhecimento está na cabeça das pessoas, não no processo", lesson: "mapeie etapas, responsáveis, prazos e critérios de qualidade", consequence: "retrabalho vira rotina e erro vira surpresa", offer: "processos que preservam qualidade sem engessar o jurídico" },
  { key: "delegacao", problem: "revisa tudo porque ninguém faz do seu jeito", cause: "delegou tarefa sem padrão, contexto ou limite de decisão", lesson: "entregue resultado esperado, checklist, prazo e autonomia compatível", consequence: "a equipe espera e o dono vira gargalo", offer: "uma estrutura em que o escritório não dependa de uma única pessoa" },
  { key: "financeiro", problem: "olha apenas o saldo da conta", cause: "não acompanha margem, inadimplência e fluxo de caixa por área", lesson: "feche números todo mês e conecte decisão operacional ao impacto financeiro", consequence: "faturamento alto esconde uma operação frágil", offer: "indicadores simples para decidir com fatos, não sensação" },
  { key: "conteudo", problem: "publica conteúdo técnico que ninguém entende", cause: "escreve para impressionar colegas, não para orientar o cliente", lesson: "traduza a dúvida real, explique o risco e mostre o próximo passo possível", consequence: "demonstra conhecimento sem gerar identificação", offer: "uma comunicação ética, clara e comercialmente útil" },
  { key: "equipe", problem: "contrata quando o caos já venceu", cause: "não mede capacidade, demanda nem perfil necessário", lesson: "defina função, resultado, rotina e indicador antes de abrir a vaga", consequence: "adiciona custo sem retirar o gargalo", offer: "um desenho de equipe alinhado ao estágio do escritório" },
  { key: "metas", problem: "define metas que ninguém acompanha", cause: "transformou desejo anual em número sem ritual de gestão", lesson: "quebre a meta em indicadores semanais, responsáveis e plano de correção", consequence: "o mês termina e a explicação chega antes do resultado", offer: "uma cadência de execução para fazer a estratégia sair do papel" },
  { key: "crm", problem: "administra contatos pela memória e por conversas soltas", cause: "não registra origem, etapa, motivo de perda e próxima ação", lesson: "use um funil simples e mantenha cada oportunidade com próximo passo definido", consequence: "dinheiro fica escondido em mensagens esquecidas", offer: "visibilidade comercial para saber onde agir todos os dias" },
  { key: "experiencia", problem: "só fala com o cliente quando precisa de documento", cause: "não desenhou uma jornada de comunicação", lesson: "antecipe dúvidas, informe marcos e defina canais desde a contratação", consequence: "silêncio operacional é percebido como abandono", offer: "uma experiência que fortalece confiança durante toda a relação" },
  { key: "nicho", problem: "confunde especialização com limitação", cause: "avalia apenas os casos que deixaria de aceitar", lesson: "compare também eficiência, autoridade, indicação e ticket gerados pela repetição estratégica", consequence: "continua generalista por medo e invisível por consequência", offer: "clareza de mercado sem comprometer a independência técnica" },
  { key: "proposta", problem: "envia um PDF genérico depois da reunião", cause: "a proposta não traduz diagnóstico, escopo e próximo passo", lesson: "personalize o contexto, delimite entregas e conduza a decisão com prazo", consequence: "o cliente compara apenas preço", offer: "propostas que comunicam valor com transparência e ética" }
];

export const slotCopy = {
  educational: (t, variant) => {
    const hooks = [
      `Se o seu escritório ${t.problem}, faça isto antes de buscar mais clientes.`,
      `Um ajuste simples para o advogado que ${t.problem}.`,
      `O processo que falta quando o escritório ${t.problem}.`
    ];
    return { hook: hooks[variant % hooks.length], lesson: `A causa geralmente é simples: ${t.cause}. Na prática, ${t.lesson}.`, action: "Salve este post e aplique o ajuste ainda nesta semana." };
  },
  aggressive: (t, variant) => {
    const hooks = [
      `Seu escritório não tem falta de oportunidade. Ele ${t.problem}.`,
      `Advogado, pare de chamar de fase ruim o fato de que você ${t.problem}.`,
      `Enquanto você ${t.problem}, outro escritório está profissionalizando a operação.`
    ];
    return { hook: hooks[variant % hooks.length], lesson: `Isso acontece porque ${t.cause}. O resultado é previsível: ${t.consequence}.`, action: "Discorda? Comente com argumento — não com desculpa." };
  },
  sales: (t, variant) => {
    const hooks = [
      `Você não precisa trabalhar ainda mais. Precisa corrigir isto: seu escritório ${t.problem}.`,
      `O próximo nível do seu escritório começa quando ele para de cometer este erro: ${t.problem}.`,
      `Existe uma diferença enorme entre advogar bem e construir um escritório que cresce.`
    ];
    return { hook: hooks[variant % hooks.length], lesson: `Na Metodologia Elite, estruturamos ${t.offer}. Crescimento sustentável exige processo, gestão e execução.`, action: "Envie ELITE no direct para entender como funciona." };
  }
};
