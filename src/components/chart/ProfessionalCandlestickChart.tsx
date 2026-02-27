import { useEffect, useRef, memo } from "react";
import { createChart, IChartApi, CandlestickData, Time, ColorType } from "lightweight-charts";

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  accumulated_balance: number;
  transaction_count: number;
}

interface ProfessionalCandlestickChartProps {
  data: CandleData[];
}

export const ProfessionalCandlestickChart = memo(function ProfessionalCandlestickChart({ 
  data 
}: ProfessionalCandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return;

    // Get theme colors from CSS variables
    const computedStyle = getComputedStyle(document.documentElement);
    const backgroundColor = computedStyle.getPropertyValue('--chart-background').trim() || '0 0% 0%';
    const textColor = computedStyle.getPropertyValue('--foreground').trim() || '0 0% 98%';
    const gridColor = computedStyle.getPropertyValue('--chart-grid').trim() || '151 20% 10%';
    
    // Convert HSL to hex
    const hslToHex = (hsl: string): string => {
      const match = hsl.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%/);
      if (!match) return '#1a1a1a';
      
      const h = parseFloat(match[1]);
      const s = parseFloat(match[2]) / 100;
      const l = parseFloat(match[3]) / 100;
      
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h / 360 + 1/3);
        g = hue2rgb(p, q, h / 360);
        b = hue2rgb(p, q, h / 360 - 1/3);
      }
      
      return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`;
    };

    // Clear previous chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 350,
      layout: {
        background: { type: ColorType.Solid, color: hslToHex(backgroundColor) },
        textColor: hslToHex(textColor),
      },
      grid: {
        vertLines: { color: hslToHex(gridColor) },
        horzLines: { color: hslToHex(gridColor) },
      },
      crosshair: {
        mode: 0,
      },
      rightPriceScale: {
        borderColor: hslToHex(gridColor),
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: hslToHex(gridColor),
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    // Transform data to chart format
    const chartData: CandlestickData[] = data.map(item => ({
      time: (item.date.length > 10 ? item.date.slice(0, 10) : item.date) as Time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight || 350,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Nenhum dado disponível para exibir</p>
      </div>
    );
  }

  return (
    <div 
      ref={chartContainerRef} 
      className="w-full h-full min-h-[300px]"
    />
  );
});
