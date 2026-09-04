import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { useUiStore } from '../store/index.js';

const line = (data, color, width = 1.5) => ({ data, color, width });

/** Gráfico de candles com overlays de SMA e Bollinger (Lightweight Charts). */
export default function PriceChart({ candles = [], indicators, moeda = 'BRL', height = 380 }) {
  const ref = useRef(null);
  const overlays = useUiStore((s) => s.overlays);

  useEffect(() => {
    if (!ref.current || candles.length === 0) return;
    const chart = createChart(ref.current, {
      height,
      layout: { background: { color: 'transparent' }, textColor: '#8b949e', fontFamily: 'Manrope, sans-serif' },
      grid: { vertLines: { color: '#21262d' }, horzLines: { color: '#21262d' } },
      rightPriceScale: { borderColor: '#30363d' },
      timeScale: { borderColor: '#30363d', timeVisible: false },
      crosshair: { mode: 0, vertLine: { color: '#484f58' }, horzLine: { color: '#484f58' } },
      localization: {
        locale: 'pt-BR',
        priceFormatter: (p) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: moeda, maximumFractionDigits: 2 }).format(p),
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#3fb950',
      downColor: '#f85149',
      borderUpColor: '#3fb950',
      borderDownColor: '#f85149',
      wickUpColor: '#3fb950',
      wickDownColor: '#f85149',
    });
    candleSeries.setData(candles);

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'vol',
      color: '#30363d',
    });
    volumeSeries.priceScale().applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeries.setData(
      candles.map((c) => ({ time: c.time, value: c.volume, color: c.close >= c.open ? '#173c25' : '#3a1a1f' })),
    );

    const asSeries = (values) =>
      candles.map((c, i) => ({ time: c.time, value: values?.[i] })).filter((p) => p.value != null);

    const add = ({ data, color, width }) => {
      const s = chart.addLineSeries({ color, lineWidth: width, priceLineVisible: false, lastValueVisible: false });
      s.setData(data);
    };

    if (indicators) {
      if (overlays.sma20) add(line(asSeries(indicators.sma20), '#58a6ff'));
      if (overlays.sma50) add(line(asSeries(indicators.sma50), '#d29922'));
      if (overlays.sma200) add(line(asSeries(indicators.sma200), '#d2a8ff'));
      if (overlays.bollinger) {
        add(line(asSeries(indicators.bollinger?.upper), '#484f58', 1));
        add(line(asSeries(indicators.bollinger?.lower), '#484f58', 1));
      }
    }

    chart.timeScale().fitContent();
    const ro = new ResizeObserver(() => chart.applyOptions({ width: ref.current.clientWidth }));
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [candles, indicators, overlays, moeda, height]);

  return <div ref={ref} className="w-full" />;
}
