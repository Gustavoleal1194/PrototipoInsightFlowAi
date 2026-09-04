/**
 * Camada de acesso a dados — mock em memória.
 * Cada função simula latência de rede e substitui 1:1 um endpoint REST do backend
 * FastAPI descrito na documentação técnica (seção 6). Ponto único de integração:
 * troque os corpos por `fetch(`${import.meta.env.VITE_API_URL}/...`)`.
 */
import { ASSETS, byTicker, generateCandles, toBRL } from './mock/assets.js';
import { RULES, SIGNALS, BACKTESTS, ruleOf } from './mock/signals.js';
import { OPERATIONS, EQUITY_CURVE, WATCHLIST } from './mock/portfolio.js';
import { ASSET_ANALYSIS, DAILY_SUMMARY, CHAT_ANSWERS, CHAT_FALLBACK, DISCLAIMER } from './mock/ai.js';
import { USER_RULES, USER_TRIGGERS, metricaOf, operadorOf } from './mock/userAlerts.js';
import { NEWS } from './mock/news.js';
import { USERS } from './mock/users.js';
import { computeIndicators, lastDefined } from '../lib/indicators.js';

const delay = (ms = 260) => new Promise((r) => setTimeout(r, ms));

/* ---------- estado mutável da sessão (substituído pelo banco no backend) ---------- */
let watchlist = [...WATCHLIST];
let operations = [...OPERATIONS];
let users = [...USERS];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let readAlerts = new Set();
let userRules = [...USER_RULES];
let userTriggers = [...USER_TRIGGERS];
const hAgo = (n) => new Date(Date.now() - n * 3600_000).toISOString();
let sessions = [
  { id: 'se1', dispositivo: 'Chrome · Windows', local: 'São Paulo, BR', atual: true, ultimo_acesso: new Date().toISOString() },
  { id: 'se2', dispositivo: 'App · iPhone', local: 'São Paulo, BR', atual: false, ultimo_acesso: hAgo(6) },
  { id: 'se3', dispositivo: 'Edge · Windows', local: 'Campinas, BR', atual: false, ultimo_acesso: hAgo(72) },
];

/** Avalia uma regra do usuário contra os indicadores vigentes do ativo. */
const evaluateRule = (rule) => {
  const asset = byTicker(rule.ticker);
  const candles = generateCandles(rule.ticker);
  const ind = computeIndicators(candles);
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const sma20 = lastDefined(ind.sma20);
  const atual = {
    PRECO: last.close,
    VAR_DIA: ((last.close - prev.close) / prev.close) * 100,
    RSI: lastDefined(ind.rsi14),
    DIST_SMA20: sma20 ? ((last.close - sma20) / sma20) * 100 : null,
    VOL_REL: lastDefined(ind.volRel),
  }[rule.metrica];
  const atingido = rule.operador === 'GTE' ? atual >= rule.valor : atual <= rule.valor;
  const m = metricaOf(rule.metrica);
  const fmt = (v) =>
    v == null
      ? '—'
      : m.unidade === 'moeda'
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: asset.moeda }).format(v)
        : `${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)}${m.unidade}`;
  return {
    valor_atual: atual,
    valor_atual_label: fmt(atual),
    alvo_label: fmt(rule.valor),
    atingido,
    // proximidade do alvo (0–100), na direção do operador
    progresso:
      atual == null || !rule.valor || !atual
        ? 0
        : Math.max(0, Math.min(100, (rule.operador === 'GTE' ? atual / rule.valor : rule.valor / atual) * 100)),
    condicao: `${m.label} ${operadorOf(rule.operador).simbolo} ${fmt(rule.valor)}`,
    moeda: asset.moeda,
  };
};

const quoteOf = (ticker) => {
  const candles = generateCandles(ticker);
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const variacao = last.close - prev.close;
  return {
    ticker,
    preco: last.close,
    variacao: +variacao.toFixed(2),
    variacao_pct: +((variacao / prev.close) * 100).toFixed(2),
    volume: last.volume,
    data_hora: new Date().toISOString(),
  };
};

const seriesOf = (ticker) => {
  const candles = generateCandles(ticker);
  const ind = computeIndicators(candles);
  return { candles, ind };
};

export const api = {
  /* ----- autenticação (RF-01, RF-02) ----- */
  async login({ email }) {
    await delay(520);
    if (!email?.includes('@')) throw new Error('Informe um e-mail válido.');
    return {
      token: 'mock.jwt.token',
      usuario: { id: 'u1', nome: email.split('@')[0].replace(/^./, (c) => c.toUpperCase()), email },
    };
  },
  async register({ nome, email, senha }) {
    await delay(620);
    if (!nome?.trim()) throw new Error('Informe seu nome.');
    const emailNorm = (email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(emailNorm)) throw new Error('Informe um e-mail válido.');
    if (!senha || senha.length < 8) throw new Error('A senha precisa ter ao menos 8 caracteres.');
    if (users.some((u) => u.email.toLowerCase() === emailNorm)) {
      const err = new Error('Este e-mail já está cadastrado.');
      err.code = 'EMAIL_EXISTS';
      throw err;
    }
    const novo = { id: `u${Date.now()}`, nome: nome.trim(), email: emailNorm, criado_em: new Date().toISOString().slice(0, 10) };
    users = [...users, novo];
    return { token: 'mock.jwt.token', usuario: { id: novo.id, nome: novo.nome, email: novo.email } };
  },
  async recoverPassword({ email }) {
    await delay(520);
    if (!EMAIL_RE.test((email || '').trim())) throw new Error('Informe um e-mail válido.');
    // Resposta sempre genérica — não revela se o e-mail está cadastrado.
    return { ok: true };
  },
  async updateProfile({ nome, email }) {
    await delay(420);
    if (!nome?.trim()) throw new Error('Informe seu nome.');
    if (!email?.includes('@')) throw new Error('Informe um e-mail válido.');
    return { nome: nome.trim(), email: email.trim() };
  },
  async changePassword({ atual, nova }) {
    await delay(480);
    if (!atual) throw new Error('Informe sua senha atual.');
    if (!nova || nova.length < 8) throw new Error('A nova senha precisa ter ao menos 8 caracteres.');
    return { ok: true };
  },
  async getSessions() {
    await delay(220);
    return [...sessions].sort((a, b) => Number(b.atual) - Number(a.atual));
  },
  async revokeSession(id) {
    await delay(260);
    sessions = sessions.filter((s) => s.id !== id);
    return { ok: true };
  },
  async revokeOtherSessions() {
    await delay(340);
    sessions = sessions.filter((s) => s.atual);
    return { ok: true };
  },

  /* ----- ativos (RF-04, RF-05, RF-06) ----- */
  async searchAssets(termo) {
    await delay(180);
    const t = (termo || '').trim().toLowerCase();
    if (!t) return ASSETS;
    return ASSETS.filter((a) => a.ticker.toLowerCase().includes(t) || a.nome.toLowerCase().includes(t));
  },
  async getAsset(ticker) {
    await delay(200);
    const asset = byTicker(ticker);
    if (!asset) throw new Error('Ativo não encontrado.');
    return { ...asset, cotacao: quoteOf(asset.ticker) };
  },
  async getQuotes(tickers) {
    await delay(240);
    return tickers.map(quoteOf);
  },
  async getHistory(ticker, periodo = '1a') {
    await delay(320);
    const { candles, ind } = seriesOf(ticker);
    const sizes = { '1d': 2, '1s': 6, '1m': 24, '3m': 68, '1a': 254, '5a': candles.length };
    const n = Math.min(sizes[periodo] ?? 254, candles.length);
    const from = candles.length - n;
    const slice = (arr) => arr.slice(from);
    return {
      candles: candles.slice(from),
      indicators: {
        sma20: slice(ind.sma20),
        sma50: slice(ind.sma50),
        sma200: slice(ind.sma200),
        rsi14: slice(ind.rsi14),
        macd: { line: slice(ind.macd.line), signal: slice(ind.macd.signal), hist: slice(ind.macd.hist) },
        bollinger: { mid: slice(ind.bollinger.mid), upper: slice(ind.bollinger.upper), lower: slice(ind.bollinger.lower) },
        volRel: slice(ind.volRel),
      },
    };
  },
  async getIndicatorSnapshot(ticker) {
    await delay(220);
    const { ind } = seriesOf(ticker);
    return {
      'SMA (20)': lastDefined(ind.sma20),
      'SMA (50)': lastDefined(ind.sma50),
      'SMA (200)': lastDefined(ind.sma200),
      'RSI (14)': lastDefined(ind.rsi14),
      'MACD (12,26,9)': lastDefined(ind.macd.line),
      'Sinal MACD': lastDefined(ind.macd.signal),
      'Bollinger sup.': lastDefined(ind.bollinger.upper),
      'Bollinger inf.': lastDefined(ind.bollinger.lower),
      'Volume relativo': lastDefined(ind.volRel),
    };
  },

  /* ----- sinais (RF-07, RF-08) ----- */
  async getSignals({ ticker, apenasAtivos = true } = {}) {
    await delay(240);
    return SIGNALS.filter((s) => (!ticker || s.ticker === ticker) && (!apenasAtivos || !s.data_desativacao)).map((s) => ({
      ...s,
      regra: ruleOf(s.regra_id),
      backtest: BACKTESTS[s.regra_id],
    }));
  },
  async getRules() {
    await delay(140);
    return RULES;
  },
  async getScore(ticker) {
    await delay(160);
    const ativos = SIGNALS.filter((s) => s.ticker === ticker && !s.data_desativacao);
    const soma = ativos.reduce((a, s) => a + (ruleOf(s.regra_id)?.peso ?? 0), 0);
    return { score: +Math.min(soma * 100, 100).toFixed(0), sinais: ativos.length };
  },
  async getTopMovers(limit = 5) {
    await delay(260);
    const quotes = ASSETS.map((a) => ({ ...quoteOf(a.ticker), nome: a.nome, tipo: a.tipo }));
    return {
      altas: [...quotes].sort((a, b) => b.variacao_pct - a.variacao_pct).slice(0, limit),
      baixas: [...quotes].sort((a, b) => a.variacao_pct - b.variacao_pct).slice(0, limit),
    };
  },
  /** Rankings de mercado (RF-05 a RF-08) — altas, baixas, volume relativo e sinais, no estilo dos rankings do investidor10. */
  async getRankings(limit = 6) {
    await delay(320);
    const quotes = ASSETS.map((a) => ({ ...quoteOf(a.ticker), nome: a.nome, tipo: a.tipo }));
    const comIndicadores = ASSETS.map((a) => {
      const ind = computeIndicators(generateCandles(a.ticker));
      return { ticker: a.ticker, nome: a.nome, tipo: a.tipo, volRel: lastDefined(ind.volRel) ?? 0 };
    });
    const comSinais = ASSETS.map((a) => ({
      ticker: a.ticker,
      nome: a.nome,
      tipo: a.tipo,
      sinais: SIGNALS.filter((s) => s.ticker === a.ticker && !s.data_desativacao).length,
    }));
    return {
      altas: [...quotes].sort((a, b) => b.variacao_pct - a.variacao_pct).slice(0, limit),
      baixas: [...quotes].sort((a, b) => a.variacao_pct - b.variacao_pct).slice(0, limit),
      volume: [...comIndicadores].sort((a, b) => b.volRel - a.volRel).slice(0, limit),
      sinais: comSinais
        .filter((s) => s.sinais > 0)
        .sort((a, b) => b.sinais - a.sinais)
        .slice(0, limit),
    };
  },
  /** Notícias de mercado (opcionalmente filtradas por ativo). */
  async getNews(ticker, limit = 8) {
    await delay(220);
    return NEWS.filter((n) => !ticker || n.ticker === ticker)
      .sort((a, b) => b.data.localeCompare(a.data))
      .slice(0, limit);
  },

  /* ----- watchlist (RF-03, RN-08) ----- */
  async getWatchlist() {
    await delay(260);
    return watchlist.map((w) => {
      const asset = byTicker(w.ticker);
      const sinais = SIGNALS.filter((s) => s.ticker === w.ticker && !s.data_desativacao).length;
      return { ...w, ...asset, cotacao: quoteOf(w.ticker), sinais };
    });
  },
  async addToWatchlist(ticker) {
    await delay(300);
    if (!watchlist.some((w) => w.ticker === ticker))
      watchlist = [...watchlist, { ticker, notificar: true, adicionado_em: new Date().toISOString().slice(0, 10) }];
    return { ok: true };
  },
  async removeFromWatchlist(ticker) {
    await delay(260);
    watchlist = watchlist.filter((w) => w.ticker !== ticker);
    return { ok: true };
  },
  async toggleNotify(ticker) {
    await delay(180);
    watchlist = watchlist.map((w) => (w.ticker === ticker ? { ...w, notificar: !w.notificar } : w));
    return { ok: true };
  },

  /* ----- portfólio (RF-10, RF-11, RF-12) ----- */
  async getOperations() {
    await delay(240);
    return [...operations].sort((a, b) => b.data.localeCompare(a.data));
  },
  async createOperation(op) {
    await delay(620);
    const nova = { ...op, id: `o${Date.now()}`, criado_em: new Date().toISOString() };
    operations = [...operations, nova];
    return nova;
  },
  async deleteOperation(id) {
    await delay(260);
    operations = operations.filter((o) => o.id !== id);
    return { ok: true };
  },
  async getPositions() {
    await delay(320);
    const map = new Map();
    for (const op of operations) {
      const cur = map.get(op.ticker) ?? { ticker: op.ticker, quantidade: 0, custo: 0 };
      const q = op.tipo === 'COMPRA' ? op.quantidade : -op.quantidade;
      cur.quantidade += q;
      cur.custo += q * op.preco_unitario;
      map.set(op.ticker, cur);
    }
    return [...map.values()]
      .filter((p) => p.quantidade > 0.0000001)
      .map((p) => {
        const asset = byTicker(p.ticker);
        const cot = quoteOf(p.ticker);
        const precoMedio = p.custo / p.quantidade;
        const valorAtual = p.quantidade * cot.preco;
        return {
          ...p,
          nome: asset.nome,
          tipo: asset.tipo,
          setor: asset.setor,
          setorLabel: asset.setor === '—' ? asset.tipo : asset.setor,
          moeda: asset.moeda,
          preco_medio: +precoMedio.toFixed(2),
          preco_atual: cot.preco,
          variacao_pct: cot.variacao_pct,
          valor_atual: +valorAtual.toFixed(2),
          resultado: +(valorAtual - p.custo).toFixed(2),
          resultado_pct: +(((valorAtual - p.custo) / p.custo) * 100).toFixed(2),
          // agregados sempre em BRL (câmbio mockado)
          valor_atual_brl: +toBRL(valorAtual, asset.moeda).toFixed(2),
          custo_brl: +toBRL(p.custo, asset.moeda).toFixed(2),
        };
      })
      .sort((a, b) => b.valor_atual - a.valor_atual);
  },
  async getPortfolioSummary() {
    await delay(340);
    const pos = await this.getPositions();
    const valor = pos.reduce((a, p) => a + p.valor_atual_brl, 0);
    const custo = pos.reduce((a, p) => a + p.custo_brl, 0);
    const ultimo = EQUITY_CURVE[EQUITY_CURVE.length - 1];
    return {
      valor_total: +valor.toFixed(2),
      custo_total: +custo.toFixed(2),
      resultado: +(valor - custo).toFixed(2),
      resultado_pct: +(((valor - custo) / custo) * 100).toFixed(2),
      variacao_dia_pct: 0.84,
      benchmarks: { cdi: +(ultimo.cdi - 100).toFixed(2), ibovespa: +(ultimo.ibovespa - 100).toFixed(2) },
      curva: EQUITY_CURVE,
    };
  },
  async getDistribution() {
    await delay(280);
    const pos = await this.getPositions();
    const total = pos.reduce((a, p) => a + p.valor_atual_brl, 0) || 1;
    const group = (key) => {
      const m = new Map();
      pos.forEach((p) => m.set(p[key], (m.get(p[key]) ?? 0) + p.valor_atual_brl));
      return [...m.entries()]
        .map(([nome, valor]) => ({ nome, valor: +valor.toFixed(2), pct: +((valor / total) * 100).toFixed(1) }))
        .sort((a, b) => b.valor - a.valor);
    };
    return { classe: group('tipo'), setor: group('setorLabel'), moeda: group('moeda') };
  },

  /* ----- alertas (RF-09) ----- */
  async getAlerts() {
    await delay(240);
    return SIGNALS.map((s) => ({
      id: s.id,
      ticker: s.ticker,
      regra: ruleOf(s.regra_id),
      contexto: s.contexto,
      backtest: BACKTESTS[s.regra_id],
      data: s.data_ativacao,
      ativo: !s.data_desativacao,
      lido: readAlerts.has(s.id),
    })).sort((a, b) => b.data.localeCompare(a.data));
  },
  async markAlertRead(id) {
    await delay(120);
    readAlerts = new Set([...readAlerts, id]);
    return { ok: true };
  },
  async markAllAlertsRead() {
    await delay(220);
    readAlerts = new Set([...readAlerts, ...SIGNALS.map((s) => s.id)]);
    return { ok: true };
  },

  /* ----- alertas definidos pelo usuário ----- */
  async getUserRules() {
    await delay(280);
    return userRules
      .map((r) => ({ ...r, ativo: byTicker(r.ticker), avaliacao: evaluateRule(r) }))
      .sort((a, b) => Number(b.ativa) - Number(a.ativa) || b.criada_em.localeCompare(a.criada_em));
  },
  async createUserRule(rule) {
    await delay(520);
    const nova = { ...rule, id: `ua${Date.now()}`, ativa: true, criada_em: new Date().toISOString() };
    userRules = [nova, ...userRules];
    const avaliacao = evaluateRule(nova);
    // se a condição já está satisfeita no momento da criação, o disparo é imediato
    if (avaliacao.atingido) {
      userTriggers = [
        {
          id: `t${Date.now()}`,
          regra_id: nova.id,
          ticker: nova.ticker,
          texto: `${avaliacao.condicao} — valor atual ${avaliacao.valor_atual_label}.`,
          canais: nova.canais,
          data: new Date().toISOString(),
        },
        ...userTriggers,
      ];
    }
    return { ...nova, avaliacao };
  },
  async toggleUserRule(id) {
    await delay(200);
    userRules = userRules.map((r) => (r.id === id ? { ...r, ativa: !r.ativa } : r));
    return { ok: true };
  },
  async deleteUserRule(id) {
    await delay(220);
    userRules = userRules.filter((r) => r.id !== id);
    return { ok: true };
  },
  async getUserTriggers() {
    await delay(240);
    return userTriggers.slice(0, 20);
  },

  /* ----- IA (RF-13, RF-14, RF-15) ----- */
  async getAssetAnalysis(ticker) {
    await delay(900);
    return {
      texto: ASSET_ANALYSIS[ticker] ?? 'Sem análise disponível para este ativo nesta versão mockada.',
      provedor: 'mock',
      modelo: 'fixtures-v1',
      prompt_versao: 'v1.0',
      gerado_em: new Date().toISOString(),
      disclaimer: DISCLAIMER,
    };
  },
  async getDailySummary() {
    await delay(400);
    return { texto: DAILY_SUMMARY, disclaimer: DISCLAIMER, gerado_em: new Date().toISOString() };
  },
  async askAI(pergunta) {
    await delay(1100);
    const p = pergunta.toLowerCase();
    const hit = CHAT_ANSWERS.find((a) => a.match.some((m) => p.includes(m)));
    return {
      texto: hit?.text ?? CHAT_FALLBACK,
      ferramentas: hit?.tools ?? [],
      disclaimer: DISCLAIMER,
    };
  },
};
