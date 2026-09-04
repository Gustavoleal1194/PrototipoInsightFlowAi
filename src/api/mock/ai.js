/** Textos de IA mockados (RF-13 a RF-16). Nenhuma chamada externa é feita nesta versão. */
export const DISCLAIMER = 'Análise gerada por IA. Não constitui recomendação de investimento.';

export const ASSET_ANALYSIS = {
  PETR4:
    'O RSI(14) fechou em 28,4, terceiro pregão consecutivo abaixo da faixa de 30, acompanhado de volume relativo de 1,42 em relação à média de 20 períodos. O preço opera 4,1% abaixo da média móvel de 50 períodos e encostou na banda inferior de Bollinger em dois dos últimos cinco pregões. Em 14 ocorrências desta mesma combinação nos últimos 24 meses, o retorno médio observado foi de 1,8% em 5 pregões e 4,2% em 20 pregões.',
  VALE3:
    'A média móvel de 20 períodos cruzou acima da de 50 períodos no pregão anterior, configuração que ocorreu 9 vezes nos últimos 24 meses. O MACD permanece positivo com histograma em expansão há quatro pregões e o volume acompanha a média histórica. O preço está 1,9% acima da banda média de Bollinger, sem sinal de exaustão nos indicadores de força.',
  ITUB4:
    'O histograma MACD (12, 26, 9) inverteu de negativo para positivo, com a linha MACD em 0,21 contra sinal em 0,14. O RSI(14) está em 54,7, região neutra, e o volume relativo é de 0,96. A série de preços permanece dentro das bandas de Bollinger, sem rompimentos nos últimos 20 pregões.',
  BBAS3:
    'Os indicadores estão em região neutra: RSI(14) em 49,2 e MACD próximo de zero. O preço oscila entre as médias de 20 e 50 períodos há onze pregões, caracterizando ausência de tendência definida na janela analisada.',
  WEGE3:
    'O RSI(14) recuperou de 29,1 para 41,6 nos últimos oito pregões, saindo da faixa de sobrevenda registrada no início do mês. A média de 20 períodos ainda está abaixo da de 50, e o volume relativo caiu para 0,88, indicando redução de participação em relação à média histórica.',
  MGLU3:
    'O volume relativo alcançou 2,38 em relação à média de 20 períodos, maior leitura em 60 pregões. A variação de preço no mesmo período foi de 1,2%, o que caracteriza aumento de liquidez sem deslocamento proporcional de preço. O RSI(14) está em 46,9 e as bandas de Bollinger apresentam largura 32% acima da mediana anual.',
  BOVA11:
    'O índice replicado acumula alta de 3,4% em 20 pregões, com RSI(14) em 58,1. A média de 200 períodos segue ascendente e o preço opera acima das três médias monitoradas.',
  HGLG11:
    'A volatilidade medida pela largura das bandas de Bollinger está no menor nível dos últimos 12 meses. O RSI(14) em 52,3 e o volume relativo em 0,71 indicam negociação abaixo da média histórica do ativo.',
  BTC:
    'O fechamento ocorreu acima da banda superior de Bollinger (20, 2), a 68.120, com volume relativo de 1,31. O RSI(14) subiu para 66,8, próximo da faixa de sobrecompra. Em 18 ocorrências deste rompimento nos últimos 24 meses, o retorno médio observado foi de 0,6% em 5 pregões e -0,4% em 20 pregões.',
  ETH:
    'O RSI(14) permanece em 72,6, segundo pregão consecutivo acima de 70. O preço está 6,8% acima da média de 20 períodos e o histograma MACD começa a perder amplitude, com quatro leituras decrescentes consecutivas.',
  SOL:
    'O cruzamento de médias registrado há dois dias foi desfeito no pregão seguinte, com a média de 20 períodos voltando abaixo da de 50. O RSI(14) está em 51,4 e a volatilidade anualizada é a maior entre os ativos monitorados na carteira.',
};

export const DAILY_SUMMARY =
  'A carteira encerrou o dia com variação de +0,84%, acima do Ibovespa (+0,31%) e do CDI (+0,04%). PETR4 respondeu por 62% da variação positiva. Três sinais foram ativados nas últimas 24 horas: sobrevenda de RSI em PETR4, cruzamento de médias em VALE3 e rompimento de banda superior em BTC. Nenhum ativo da watchlist registrou queda superior a 3% no período.';

/** RF-15 — respostas do chat via function calling simulado: o roteador de intenção
 * e as funções que consultam o estado real da carteira vivem em `api/client.js`
 * (askAI). Aqui ficam só o texto de fallback e as sugestões de pergunta. */
export const CHAT_FALLBACK =
  'Não encontrei essa informação nos dados da sua carteira. Nesta versão o chat consulta: resultado da carteira, exposição por classe e setor, comparação com CDI e Ibovespa, sinais ativos, o ativo com melhor ou pior retorno, e o histórico de operações.';

export const CHAT_SUGGESTIONS = [
  'Qual foi meu ativo mais rentável?',
  'Como está minha exposição por setor?',
  'A carteira está acima do CDI?',
  'Quais sinais estão ativos agora?',
  'Qual é o resultado da carteira?',
  'Quais foram minhas últimas operações?',
];
