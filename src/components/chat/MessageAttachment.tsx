
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText, Image as ImageIcon, Video } from 'lucide-react';
import { ImageModal } from './ImageModal';
import { AudioPlayer } from './AudioPlayer';
import { cn } from '@/lib/utils';

interface MessageAttachmentProps {
  attachmentUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  canDelete?: boolean;
  onDelete?: () => void;
}

export const MessageAttachment = ({
  attachmentUrl,
  fileName,
  fileSize,
  mimeType,
  duration,
  canDelete = false,
  onDelete
}: MessageAttachmentProps) => {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImage = mimeType?.startsWith('image/');
  const isVideo = mimeType?.startsWith('video/');
  const isAudio = mimeType?.startsWith('audio/');

  if (isImage) {
    return (
      <>
        <div 
          className="relative max-w-xs cursor-pointer rounded-lg overflow-hidden group"
          onClick={() => setIsImageModalOpen(true)}
        >
          <img 
            src={attachmentUrl} 
            alt={fileName}
            className="w-full h-auto max-h-64 object-cover transition-transform hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="bg-black/50 rounded-full p-2">
              <ImageIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          {fileName && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
              <p className="text-xs text-white truncate">
                {fileName} {fileSize && `(${formatFileSize(fileSize)})`}
              </p>
            </div>
          )}
        </div>
        
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          imageUrl={attachmentUrl}
          imageName={fileName}
          canDelete={canDelete}
          onDelete={onDelete}
        />
      </>
    );
  }

  if (isVideo) {
    return (
      <div className="relative max-w-xs rounded-lg overflow-hidden">
        <video 
          src={attachmentUrl}
          controls
          className="w-full h-auto max-h-64"
          preload="metadata"
        />
        {fileName && (
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {fileName} {fileSize && `(${formatFileSize(fileSize)})`}
          </p>
        )}
      </div>
    );
  }

  if (isAudio) {
    return (
      <AudioPlayer
        audioUrl={attachmentUrl}
        fileName={fileName}
        duration={duration}
      />
    );
  }

  // Generic file
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-xs">
      <FileText className="h-8 w-8 text-muted-foreground flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {fileName || 'Arquivo'}
        </p>
        {fileSize && (
          <p className="text-xs text-muted-foreground">
            {formatFileSize(fileSize)}
          </p>
        )}
      </div>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => window.open(attachmentUrl, '_blank')}
        className="flex-shrink-0"
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};
