import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

// Helper function to convert HSL to Hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

interface CandleData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Goal {
  value: number;
  type: 'support' | 'resistance';
  label: string;
}

interface Props {
  data: CandleData[];
  goals?: Goal[];
  onClickValue?: (value: number) => void;
}

export function ProfessionalCandlestickChart({ data, goals = [], onClickValue }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Get computed colors from CSS variables
    const getColor = (varName: string) => {
      const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      // Convert HSL to hex
      const [h, s, l] = value.split(' ').map(v => parseFloat(v.replace('%', '')));
      return hslToHex(h, s, l);
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: getColor('--chart-background') },
        textColor: getColor('--foreground'),
      },
      grid: {
        vertLines: { color: getColor('--chart-grid') },
        horzLines: { color: getColor('--chart-grid') },
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 100 : 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: getColor('--chart-crosshair'),
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: getColor('--chart-crosshair'),
          width: 1,
          style: 2,
          labelBackgroundColor: getColor('--chart-crosshair'),
        },
        horzLine: {
          color: getColor('--chart-crosshair'),
          width: 1,
          style: 2,
          labelBackgroundColor: getColor('--chart-crosshair'),
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: getColor('--chart-candle-up'),
      downColor: getColor('--chart-candle-down'),
      borderVisible: false,
      wickUpColor: getColor('--chart-candle-up'),
      wickDownColor: getColor('--chart-candle-down'),
    });

    // Converter dados
    const candleData: CandlestickData[] = data.map(d => ({
      time: (new Date(d.date).getTime() / 1000) as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    candlestickSeries.setData(candleData);

    // Adicionar linhas de meta
    goals.forEach(goal => {
      const priceLine = candlestickSeries.createPriceLine({
        price: goal.value,
        color: goal.type === 'resistance' ? getColor('--chart-candle-up') : getColor('--chart-candle-down'),
        lineWidth: 2,
        lineStyle: goal.type === 'support' ? 2 : 0,
        axisLabelVisible: true,
        title: goal.label,
      });
    });

    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(
          chartContainerRef.current.clientWidth,
          isFullscreen ? window.innerHeight - 100 : 500
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, goals, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && chartContainerRef.current) {
      chartContainerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <Card className={`relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10"
        onClick={toggleFullscreen}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
      <div 
        ref={chartContainerRef} 
        className={`w-full ${isFullscreen ? 'h-screen' : 'h-[500px]'}`} 
      />
    </Card>
  );
}
