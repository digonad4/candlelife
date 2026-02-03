
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";

const Login = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const toggleView = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm animate-fade-in">
        <Card className="border shadow-lg bg-card mx-auto">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardTitle className="text-xl font-bold text-foreground">
              {isSignUp ? "Criar conta" : "Entrar"}
            </CardTitle>
            <p className="text-muted-foreground text-xs">
              {isSignUp 
                ? "Crie sua conta para começar" 
                : "Entre para continuar"
              }
            </p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {isSignUp ? (
              <SignUpForm toggleView={toggleView} />
            ) : (
              <LoginForm toggleView={toggleView} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
