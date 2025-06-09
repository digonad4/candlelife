
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkPreviewProps {
  url: string;
  showRemove?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const LinkPreview = ({
  url,
  showRemove = false,
  onRemove,
  className
}: LinkPreviewProps) => {
  const [preview, setPreview] = useState<{
    title?: string;
    description?: string;
    image?: string;
    siteName?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulação de preview - em produção usar API real
    const fetchPreview = async () => {
      setIsLoading(true);
      try {
        // Simulação de dados de preview
        await new Promise(resolve => setTimeout(resolve, 1000));
        setPreview({
          title: "Link Preview",
          description: "Descrição do link...",
          siteName: new URL(url).hostname
        });
      } catch (error) {
        console.error('Erro ao buscar preview:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (isLoading) {
    return (
      <div className={cn("border rounded-lg p-3 bg-muted animate-pulse", className)}>
        <div className="h-4 bg-muted-foreground/20 rounded mb-2"></div>
        <div className="h-3 bg-muted-foreground/20 rounded w-2/3"></div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden bg-background", className)}>
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">
              {preview?.title || url}
            </h4>
            {preview?.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {preview.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {preview?.siteName || new URL(url).hostname}
              </span>
            </div>
          </div>
          {showRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-6 w-6 p-0 ml-2"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
