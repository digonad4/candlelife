import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, CandlestickData, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2 } from 'lucide-react';

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

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: 'hsl(var(--background))' },
        textColor: 'hsl(var(--foreground))',
      },
      grid: {
        vertLines: { color: 'hsl(var(--border))' },
        horzLines: { color: 'hsl(var(--border))' },
      },
      width: chartContainerRef.current.clientWidth,
      height: isFullscreen ? window.innerHeight - 100 : 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: 'hsl(var(--primary))',
      },
      crosshair: {
        mode: 1,
        vertLine: {
          color: 'hsl(var(--primary))',
          width: 1,
          style: 2,
          labelBackgroundColor: 'hsl(var(--primary))',
        },
        horzLine: {
          color: 'hsl(var(--primary))',
          width: 1,
          style: 2,
          labelBackgroundColor: 'hsl(var(--primary))',
        },
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'hsl(var(--success))',
      downColor: 'hsl(var(--destructive))',
      borderVisible: false,
      wickUpColor: 'hsl(var(--success))',
      wickDownColor: 'hsl(var(--destructive))',
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
        color: goal.type === 'resistance' ? 'hsl(var(--success))' : 'hsl(var(--destructive))',
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
