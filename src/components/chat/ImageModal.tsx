
import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Share, Trash2, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName?: string;
  canDelete?: boolean;
  onDelete?: () => void;
}

export const ImageModal = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  canDelete = false,
  onDelete
}: ImageModalProps) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'imagem';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Imagem compartilhada',
          url: imageUrl
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-screen max-h-screen w-screen h-screen p-0 bg-black/95">
        {/* Header com controles */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              className="text-white hover:bg-white/20"
            >
              <ZoomOut className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              className="text-white hover:bg-white/20"
            >
              <ZoomIn className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Imagem principal */}
        <div className="flex items-center justify-center w-full h-full overflow-hidden">
          <img
            src={imageUrl}
            alt={imageName || "Imagem"}
            className={cn(
              "max-w-full max-h-full object-contain transition-transform duration-200",
              "cursor-move"
            )}
            style={{
              transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`
            }}
          />
        </div>

        {/* Footer com ações */}
        <div className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-center gap-4 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white hover:bg-white/20"
          >
            <Download className="h-5 w-5 mr-2" />
            Baixar
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="text-white hover:bg-white/20"
          >
            <Share className="h-5 w-5 mr-2" />
            Compartilhar
          </Button>

          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-400 hover:bg-red-400/20"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Excluir
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
