
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioRecorderProps {
  onAudioRecorded: (audioBlob: Blob, duration: number) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

export const AudioRecorder = ({ 
  onAudioRecorded, 
  onCancel, 
  isRecording, 
  setIsRecording 
}: AudioRecorderProps) => {
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [setIsRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording, setIsRecording]);

  const sendAudio = useCallback(() => {
    if (recordedBlob) {
      onAudioRecorded(recordedBlob, duration);
      setRecordedBlob(null);
      setAudioUrl(null);
      setDuration(0);
    }
  }, [recordedBlob, duration, onAudioRecorded]);

  const cancelRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    setRecordedBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setDuration(0);
    onCancel();
  }, [isRecording, stopRecording, audioUrl, onCancel]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (recordedBlob && audioUrl) {
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <audio controls src={audioUrl} className="flex-1 h-8" />
        <span className="text-sm text-muted-foreground">{formatDuration(duration)}</span>
        <Button size="sm" onClick={sendAudio} className="h-8">
          <Send className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={cancelRecording} className="h-8">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
      {isRecording ? (
        <>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm">Gravando...</span>
            <span className="text-sm font-mono">{formatDuration(duration)}</span>
          </div>
          <Button size="sm" onClick={stopRecording} variant="secondary">
            <MicOff className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span className="text-sm text-muted-foreground flex-1">Pressione para gravar áudio</span>
          <Button size="sm" onClick={startRecording}>
            <Mic className="h-4 w-4" />
          </Button>
        </>
      )}
      <Button size="sm" variant="ghost" onClick={cancelRecording}>
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
