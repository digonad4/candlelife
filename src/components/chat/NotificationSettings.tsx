
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Play, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSound {
  id: string;
  name: string;
  url: string;
  isDefault: boolean;
}

interface NotificationSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSound?: string;
  onSoundChange: (soundId: string) => void;
}

export const NotificationSettings = ({
  isOpen,
  onClose,
  currentSound,
  onSoundChange
}: NotificationSettingsProps) => {
  const [sounds, setSounds] = useState<NotificationSound[]>([]);
  const [selectedSound, setSelectedSound] = useState(currentSound || 'default');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Sons padrão do sistema
  const defaultSounds: NotificationSound[] = [
    { id: 'default', name: 'Padrão', url: '/sounds/default.mp3', isDefault: true },
    { id: 'ding', name: 'Ding', url: '/sounds/ding.mp3', isDefault: true },
    { id: 'chime', name: 'Chime', url: '/sounds/chime.mp3', isDefault: true },
    { id: 'pop', name: 'Pop', url: '/sounds/pop.mp3', isDefault: true }
  ];

  useEffect(() => {
    if (isOpen) {
      loadCustomSounds();
    }
  }, [isOpen]);

  const loadCustomSounds = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar sons personalizados do usuário
      const { data, error } = await supabase
        .storage
        .from('notifications')
        .list(`${user.id}/sounds`, { limit: 50 });

      if (error) throw error;

      const customSounds = data?.map(file => ({
        id: file.name,
        name: file.name.replace(/\.[^/.]+$/, ''), // Remove extensão
        url: supabase.storage.from('notifications').getPublicUrl(`${user.id}/sounds/${file.name}`).data.publicUrl,
        isDefault: false
      })) || [];

      setSounds([...defaultSounds, ...customSounds]);
    } catch (error) {
      console.error('Erro ao carregar sons:', error);
      setSounds(defaultSounds);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de áudio válido.",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const fileName = `${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('notifications')
        .upload(`${user.id}/sounds/${fileName}`, file);

      if (error) throw error;

      toast({
        title: "Som adicionado",
        description: "Seu som personalizado foi adicionado com sucesso!",
      });

      // Recarregar lista de sons
      await loadCustomSounds();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o som. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteSound = async (sound: NotificationSound) => {
    if (sound.isDefault) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.storage
        .from('notifications')
        .remove([`${user.id}/sounds/${sound.id}`]);

      if (error) throw error;

      toast({
        title: "Som removido",
        description: "O som foi removido com sucesso.",
      });

      // Recarregar lista
      await loadCustomSounds();

      // Se o som removido era o selecionado, voltar para o padrão
      if (selectedSound === sound.id) {
        setSelectedSound('default');
      }
    } catch (error) {
      console.error('Erro ao remover som:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o som.",
        variant: "destructive",
      });
    }
  };

  const playSound = (url: string) => {
    const audio = new Audio(url);
    audio.volume = 0.5;
    audio.play().catch(console.error);
  };

  const handleSave = () => {
    onSoundChange(selectedSound);
    onClose();
    toast({
      title: "Configuração salva",
      description: "Sua configuração de notificação foi salva.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sons de Notificação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload de novo som */}
          <div className="border-2 border-dashed border-muted rounded-lg p-4 text-center">
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
              id="sound-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="sound-upload"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              ) : (
                <Upload className="h-6 w-6 text-muted-foreground" />
              )}
              <span className="text-sm text-muted-foreground">
                {isUploading ? 'Enviando...' : 'Adicionar som personalizado'}
              </span>
            </label>
          </div>

          {/* Lista de sons */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            <RadioGroup value={selectedSound} onValueChange={setSelectedSound}>
              {sounds.map((sound) => (
                <div key={sound.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                  <RadioGroupItem value={sound.id} id={sound.id} />
                  <Label htmlFor={sound.id} className="flex-1 cursor-pointer">
                    {sound.name}
                  </Label>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => playSound(sound.url)}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="h-4 w-4" />
                  </Button>

                  {!sound.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSound(sound)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Ações */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
