
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Mic, Reply, X } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { MessageReply } from './MessageReply';
import { LinkPreview } from './LinkPreview';
import { AttachmentUpload } from '../social/chat/AttachmentUpload';
import { MessageSelector } from './MessageSelector';
import { Message } from '@/types/messages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

interface EnhancedChatInputProps {
  onSendMessage: (content: string, attachment?: File, replyTo?: string) => Promise<void>;
  onTypingStatusChange: (isTyping: boolean) => void;
  isSubmitting: boolean;
  replyingTo: Message | null;
  onCancelReply: () => void;
  messages: Message[];
  currentUserId?: string;
  onStartReply: (message: Message) => void;
}

export const EnhancedChatInput = ({
  onSendMessage,
  onTypingStatusChange,
  isSubmitting,
  replyingTo,
  onCancelReply,
  messages,
  currentUserId,
  onStartReply
}: EnhancedChatInputProps) => {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [detectedLinks, setDetectedLinks] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showMessageSelector, setShowMessageSelector] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Detectar links no texto
  useEffect(() => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex) || [];
    setDetectedLinks(matches);
  }, [message]);

  // Gerenciar status de digitação
  const handleTypingChange = useCallback((typing: boolean) => {
    if (typing !== isTyping) {
      setIsTyping(typing);
      onTypingStatusChange(typing);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (typing) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTypingStatusChange(false);
      }, 3000);
    }
  }, [isTyping, onTypingStatusChange]);

  const handleInputChange = (value: string) => {
    setMessage(value);
    handleTypingChange(value.trim().length > 0);
  };

  // Upload de arquivo para Supabase Storage
  const uploadFile = async (file: File): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    try {
      // Verificar se o bucket existe, se não criar
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.find(bucket => bucket.name === 'chat-attachments');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('chat-attachments', {
          public: true,
          allowedMimeTypes: ['image/*', 'audio/*', 'video/*', 'application/pdf', 'text/*'],
          fileSizeLimit: 50 * 1024 * 1024 // 50MB
        });
      }

      const { data, error } = await supabase.storage
        .from('chat-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      // Fallback: criar URL local temporária
      return URL.createObjectURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!message.trim() && !attachment) || isSubmitting) {
      return;
    }

    try {
      let uploadedFile = attachment;
      
      // Se há anexo, fazer upload
      if (attachment) {
        const attachmentUrl = await uploadFile(attachment);
        // Criar um novo File object com a URL como nome para referência
        uploadedFile = new File([attachment], attachmentUrl, { type: attachment.type });
      }

      await onSendMessage(
        message || (attachment ? `📎 ${attachment.name}` : ''), 
        uploadedFile || undefined, 
        replyingTo?.id
      );
      
      setMessage("");
      setAttachment(null);
      setAttachmentPreview(null);
      handleTypingChange(false);
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (file: File) => {
    setAttachment(file);
    
    // Criar preview para imagens
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAttachmentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAttachmentPreview(null);
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob, duration: number) => {
    const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    
    try {
      await onSendMessage("🎵 Mensagem de áudio", audioFile, replyingTo?.id);
      setShowAudioRecorder(false);
    } catch (error) {
      console.error("Error sending audio:", error);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  const removeLinkPreview = (linkToRemove: string) => {
    setMessage(prev => prev.replace(linkToRemove, ''));
  };

  const handleSelectMessageToReply = (selectedMessage: Message) => {
    onStartReply(selectedMessage);
    setShowMessageSelector(false);
  };

  return (
    <>
      {/* Seletor de mensagens para resposta */}
      {showMessageSelector && (
        <MessageSelector
          messages={messages}
          currentUserId={currentUserId}
          onSelectMessage={handleSelectMessageToReply}
          onCancel={() => setShowMessageSelector(false)}
        />
      )}

      <div className="border-t bg-background">
        {/* Reply preview */}
        {replyingTo && (
          <MessageReply 
            replyingTo={replyingTo} 
            onCancelReply={onCancelReply} 
          />
        )}

        {/* Link previews */}
        {detectedLinks.length > 0 && (
          <div className="p-3 space-y-2 border-b">
            {detectedLinks.map((link, index) => (
              <LinkPreview 
                key={index}
                url={link}
                showRemove
                onRemove={() => removeLinkPreview(link)}
              />
            ))}
          </div>
        )}

        {/* Audio recorder */}
        {showAudioRecorder && (
          <div className="p-3 border-b">
            <AudioRecorder
              onAudioRecorded={handleAudioRecorded}
              onCancel={() => setShowAudioRecorder(false)}
              isRecording={isRecordingAudio}
              setIsRecording={setIsRecordingAudio}
            />
          </div>
        )}

        {/* File attachment preview */}
        {attachment && (
          <div className="p-3 border-b">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {attachmentPreview ? (
                <img 
                  src={attachmentPreview} 
                  alt="Preview" 
                  className="w-16 h-16 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-16 bg-background rounded flex items-center justify-center">
                  <Paperclip className="h-6 w-6" />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(attachment.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAttachment}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input area */}
        <div className="p-4 space-y-3">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem..."
                className="min-h-[40px] max-h-[120px] resize-none"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              {/* Reply button */}
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowMessageSelector(true)}
                className="h-10"
                title="Responder mensagem"
              >
                <Reply className="h-4 w-4" />
              </Button>

              {/* Attachment button */}
              <AttachmentUpload onFileSelect={handleFileSelect} />
              
              {/* Audio button */}
              <Button
                type="button"
                size="sm"
                variant={showAudioRecorder ? "default" : "ghost"}
                onClick={() => setShowAudioRecorder(!showAudioRecorder)}
                className="h-10"
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              {/* Send button */}
              <Button
                type="submit"
                size="sm"
                disabled={(!message.trim() && !attachment) || isSubmitting}
                className="h-10"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
