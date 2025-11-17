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

interface Props {
  data: CandleData[];
  onClickValue?: (value: number) => void;
}

export function ProfessionalCandlestickChart({ data, onClickValue }: Props) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Calcular valor atual e mudança percentual
  const currentValue = data.length > 0 ? data[data.length - 1].close : 1000;
  const initialValue = data.length > 0 ? data[0].open : 1000;
  const change = initialValue !== 0 ? ((currentValue - initialValue) / initialValue) * 100 : 0;

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
      height: isFullscreen ? window.innerHeight - 150 : 500,
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
      localization: {
        priceFormatter: (price: number) => `${price.toFixed(2)} LIFE`,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',          // Verde vibrante para income
      downColor: '#ef4444',        // Vermelho vibrante para expense
      borderVisible: true,         // Mostrar borda para melhor definição
      borderUpColor: '#16a34a',    // Borda verde escura
      borderDownColor: '#dc2626',  // Borda vermelha escura
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
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

    // Add click handler for creating goals
    if (onClickValue) {
      chart.subscribeClick((param) => {
        if (param.time !== undefined) {
          const price = param.seriesData.get(candlestickSeries);
          if (price && typeof price === 'object' && 'close' in price) {
            onClickValue(price.close as number);
          }
        }
      });
    }


    chart.timeScale().fitContent();

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.resize(
          chartContainerRef.current.clientWidth,
          isFullscreen ? window.innerHeight - 150 : 500
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, isFullscreen]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen && chartContainerRef.current) {
      chartContainerRef.current.requestFullscreen?.();
    } else if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  return (
    <Card className={`relative ${isFullscreen ? 'fixed inset-0 z-50 p-6' : ''}`}>
      {/* Header com título LIFE e estatísticas */}
      <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-sm rounded-2xl p-4 border border-border/50 shadow-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">
              $ LIFE
            </h3>
            <span className="text-xs text-muted-foreground">Sua Vida Financeira</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-bold text-foreground">
              {currentValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`text-sm sm:text-lg font-semibold flex items-center gap-1 ${
              change >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur-sm hover:bg-background/90"
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
