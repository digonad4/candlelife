import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";

interface SignUpFormProps {
  toggleView: () => void;
}

const SignUpForm = ({ toggleView }: SignUpFormProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNeedsEmailConfirmation(false);

    // Rate limiting
    const rateLimitKey = "signupRateLimit";
    const maxAttempts = 5;
    const timeWindow = 60 * 1000;
    const now = Date.now();
    let rateLimitData = JSON.parse(localStorage.getItem(rateLimitKey) || "{}") || {
      attempts: 0,
      lastAttempt: 0,
    };

    if (now - rateLimitData.lastAttempt < timeWindow) {
      if (rateLimitData.attempts >= maxAttempts) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Muitas tentativas de cadastro. Por favor, espere e tente novamente mais tarde.",
        });
        setIsLoading(false);
        return;
      }
      rateLimitData.attempts++;
    } else {
      rateLimitData.attempts = 1;
    }
    rateLimitData.lastAttempt = now;
    localStorage.setItem(rateLimitKey, JSON.stringify(rateLimitData));

    try {
      // Validações
      if (password !== confirmPassword) {
        throw new Error("As senhas não coincidem");
      }
      if (!acceptedTerms) {
        throw new Error("Você precisa aceitar a política de dados");
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Por favor, insira um email válido");
      }

      // Signup com redirect URL
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        if (signUpError.status === 429) {
          toast({
            variant: "destructive",
            title: "Limite de tentativas",
            description: "Muitas tentativas de cadastro. Por favor, espere alguns minutos.",
          });
          return;
        }
        // Tratar erro de usuário já existe
        if (signUpError.message.includes("already registered") || 
            signUpError.message.includes("User already registered")) {
          throw new Error("Este email já está cadastrado. Tente fazer login.");
        }
        throw signUpError;
      }
      if (!signUpData.user) throw new Error("Erro ao criar usuário");

      const userId = signUpData.user.id;

      // Upload do avatar (baseado em AvatarSettings)
      let avatarUrl: string | null = null;
      if (avatar) {
        const fileExt = avatar.name.split(".").pop();
        const fileName = `${userId}-${Math.random()}.${fileExt}`;
        const filePath = fileName;

        console.log("Uploading avatar during signup:", filePath);

        // Verifica e cria o bucket se necessário
        const { data: buckets } = await supabase.storage.listBuckets();
        if (!buckets?.find((bucket) => bucket.name === "avatars")) {
          console.log("Creating avatars bucket");
          await supabase.storage.createBucket("avatars", { public: true });
        }

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatar);

        if (uploadError) {
          console.error("Erro ao fazer upload do avatar:", uploadError);
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
        console.log("Avatar uploaded, public URL:", avatarUrl);
        if (!avatarUrl) throw new Error("Falha ao obter a URL pública do avatar");
      }

      // Criação do perfil (baseado em ProfileSettings e AvatarSettings)
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        console.error("Erro ao criar perfil:", profileError);
        throw profileError;
      }

      console.log("Profile created successfully with username:", username, "and avatar:", avatarUrl);

      setNeedsEmailConfirmation(true);
      toast({
        title: "Conta criada com sucesso!",
        description: "Por favor, verifique seu email para confirmar sua conta.",
      });
    } catch (error: unknown) {
      console.error("Erro no processo de signup:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: (error as Error).message || "Ocorreu um erro ao criar a conta",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {needsEmailConfirmation && (
        <Alert className="mb-4">
          <AlertDescription>
            Enviamos um email de confirmação para {email}. Por favor, verifique sua caixa de
            entrada e confirme seu email antes de fazer login.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Nome de usuário</Label>
          <Input
            id="username"
            type="text"
            placeholder="Seu nome de usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="rounded-xl"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="rounded-xl"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="rounded-xl"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="avatar">Foto (opcional)</Label>
          <Input
            id="avatar"
            type="file"
            accept="image/*"
            onChange={(e) => setAvatar(e.target.files?.[0] || null)}
            className="rounded-xl"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={acceptedTerms}
            onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            required
          />
          <Label htmlFor="terms" className="text-sm">
            Aceito a política de dados e termos de uso
          </Label>
        </div>

        <div className="space-y-2">
          <Button type="submit" className="w-full rounded-xl" disabled={isLoading}>
            {isLoading ? "Carregando..." : "Criar conta"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full rounded-xl"
            onClick={toggleView}
          >
            Já tem uma conta? Entre aqui
          </Button>
        </div>
      </form>
    </>
  );
};

export default SignUpForm;