
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  FileText, 
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageAttachmentProps {
  attachmentUrl: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
}

export const MessageAttachment = ({
  attachmentUrl,
  fileName,
  fileSize,
  mimeType,
  duration
}: MessageAttachmentProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isImage = mimeType?.startsWith('image/');
  const isVideo = mimeType?.startsWith('video/');
  const isAudio = mimeType?.startsWith('audio/');

  if (isImage) {
    return (
      <>
        <div 
          className="relative max-w-xs cursor-pointer rounded-lg overflow-hidden"
          onClick={() => setIsModalOpen(true)}
        >
          <img 
            src={attachmentUrl} 
            alt={fileName}
            className="w-full h-auto max-h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
            <ImageIcon className="h-6 w-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl p-0">
            <img 
              src={attachmentUrl} 
              alt={fileName}
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          </DialogContent>
        </Dialog>
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
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-xs">
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1">
          <audio 
            src={attachmentUrl}
            controls
            className="w-full h-8"
          />
          {duration && (
            <p className="text-xs text-muted-foreground">
              {formatDuration(duration)}
            </p>
          )}
        </div>
        
        <Volume2 className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  // Generic file
  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-lg max-w-xs">
      <FileText className="h-8 w-8 text-muted-foreground" />
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
      >
        <Download className="h-4 w-4" />
      </Button>
    </div>
  );
};
