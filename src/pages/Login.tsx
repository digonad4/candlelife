import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

type AuthView = "login" | "signup" | "forgot";

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<AuthView>("login");

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const getTitle = () => {
    switch (view) {
      case "signup": return "Criar conta";
      case "forgot": return "Recuperar senha";
      default: return "Entrar";
    }
  };

  const getSubtitle = () => {
    switch (view) {
      case "signup": return "Crie sua conta para começar";
      case "forgot": return "Redefina sua senha";
      default: return "Entre para continuar";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Flame className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CandleLife</span>
          </div>
        </div>

        <Card className="border shadow-lg bg-card">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              {getTitle()}
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {getSubtitle()}
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {view === "signup" && (
              <SignUpForm toggleView={() => setView("login")} />
            )}
            {view === "login" && (
              <>
                <LoginForm toggleView={() => setView("signup")} />
                <div className="mt-4 text-center">
                  <Button
                    variant="link"
                    className="text-sm text-muted-foreground hover:text-primary p-0 h-auto"
                    onClick={() => setView("forgot")}
                  >
                    Esqueceu sua senha?
                  </Button>
                </div>
              </>
            )}
            {view === "forgot" && (
              <ForgotPasswordForm onBack={() => setView("login")} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
