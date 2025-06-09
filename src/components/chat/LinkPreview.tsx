
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ExternalLink, X } from 'lucide-react';

interface LinkPreviewData {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

interface LinkPreviewProps {
  url: string;
  onRemove?: () => void;
  showRemove?: boolean;
}

export const LinkPreview = ({ url, onRemove, showRemove }: LinkPreviewProps) => {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        // Simulação de busca de metadados - em produção usar serviço real
        const response = await fetch(`https://api.linkpreview.net/?key=YOUR_API_KEY&q=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          setPreviewData({
            url,
            title: data.title,
            description: data.description,
            image: data.image,
            siteName: data.site
          });
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-3 animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div className="flex items-center gap-2 p-2 bg-muted rounded">
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline truncate flex-1"
        >
          {url}
        </a>
        {showRemove && onRemove && (
          <Button size="sm" variant="ghost" onClick={onRemove}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden max-w-md">
      {previewData.image && (
        <img 
          src={previewData.image} 
          alt={previewData.title}
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {previewData.title && (
              <h4 className="font-medium text-sm line-clamp-2 mb-1">
                {previewData.title}
              </h4>
            )}
            {previewData.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {previewData.description}
              </p>
            )}
            <div className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground truncate">
                {previewData.siteName || new URL(url).hostname}
              </span>
            </div>
          </div>
          
          {showRemove && onRemove && (
            <Button size="sm" variant="ghost" onClick={onRemove}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full mt-2"
          onClick={() => window.open(url, '_blank')}
        >
          Abrir link
        </Button>
      </div>
    </div>
  );
};
