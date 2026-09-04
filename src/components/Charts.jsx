import { ResponsiveContainer, LineChart, Line, BarChart, Bar, ReferenceLine, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const axis = { stroke: '#484f58', fontSize: 11, tickLine: false, axisLine: false };
const tooltipStyle = {
  contentStyle: { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#8b949e' },
};

/** RSI(14) — RF-06. */
export function RsiChart({ candles = [], values = [], height = 130 }) {
  const data = candles.map((c, i) => ({ time: c.time, rsi: values[i] })).filter((d) => d.rsi != null);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="time" hide />
        <YAxis domain={[0, 100]} ticks={[30, 50, 70]} {...axis} />
        <ReferenceLine y={70} stroke="#f85149" strokeDasharray="3 3" />
        <ReferenceLine y={30} stroke="#3fb950" strokeDasharray="3 3" />
        <Tooltip {...tooltipStyle} formatter={(v) => [v.toFixed(1), 'RSI(14)']} />
        <Line type="monotone" dataKey="rsi" stroke="#58a6ff" strokeWidth={1.6} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** MACD (12, 26, 9) — RF-06. */
export function MacdChart({ candles = [], macd, height = 130 }) {
  const data = candles
    .map((c, i) => ({ time: c.time, hist: macd?.hist?.[i], line: macd?.line?.[i], signal: macd?.signal?.[i] }))
    .filter((d) => d.line != null);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
        <XAxis dataKey="time" hide />
        <YAxis {...axis} />
        <ReferenceLine y={0} stroke="#30363d" />
        <Tooltip {...tooltipStyle} formatter={(v, n) => [Number(v).toFixed(3), n]} />
        <Bar dataKey="hist" name="Histograma">
          {data.map((d, i) => (
            <Cell key={i} fill={d.hist >= 0 ? '#173c25' : '#3a1a1f'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Carteira vs. benchmarks (RF-11) — base 100. */
export function BenchmarkChart({ data = [], height = 240 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <XAxis dataKey="data" {...axis} tickFormatter={(d) => d.slice(5).replace('-', '/')} minTickGap={28} />
        <YAxis {...axis} domain={['dataMin - 2', 'dataMax + 2']} />
        <Tooltip {...tooltipStyle} formatter={(v, n) => [Number(v).toFixed(2), n]} />
        <Line type="monotone" dataKey="carteira" name="Carteira" stroke="#7dfda1" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="ibovespa" name="Ibovespa" stroke="#58a6ff" strokeWidth={1.4} dot={false} />
        <Line type="monotone" dataKey="cdi" name="CDI" stroke="#8b949e" strokeWidth={1.4} strokeDasharray="4 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Sparkline compacto usado nos cards de watchlist. */
export function Sparkline({ candles = [], height = 34, positive = true }) {
  const data = candles.slice(-40).map((c, i) => ({ i, v: c.close }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <Line type="monotone" dataKey="v" stroke={positive ? '#3fb950' : '#f85149'} strokeWidth={1.5} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
