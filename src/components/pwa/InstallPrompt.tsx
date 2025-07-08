import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const InstallPrompt = () => {
  const { canInstall, installApp } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  const handleInstall = async () => {
    const success = await installApp();
    if (success || !success) {
      setDismissed(true);
    }
  };

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm shadow-lg border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Instalar App</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-8 w-8 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Instale o Candle Life para uma experiência melhor com notificações e acesso offline.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button onClick={handleInstall} className="flex-1" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Instalar
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setDismissed(true)}
            size="sm"
          >
            Agora não
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};