import React, { useState } from 'react';
import { LoginHeroBanner, LoginForm } from '../components/loginPage';
import { Alert } from '../components/ui';
import './loginPage.css';

export interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginSubmit = async (data: { email: string; password: string; rememberMe: boolean }) => {
    setIsLoading(true);
    setAuthSuccess(null);
    setAuthError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          identifiant: data.email,
          motDePasse: data.password,
        }),
      });

      if (!res.ok) {
        let msg = 'Identifiant ou mot de passe incorrect.';
        try {
          const errData = await res.json();
          if (errData.message) msg = errData.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const authData = await res.json();
      if (authData.token) {
        localStorage.setItem('auth_token', authData.token);
        localStorage.setItem('auth_user', JSON.stringify(authData));
      }

      setAuthSuccess(`Connexion réussie : Bienvenue ${authData.prenom || data.email} !`);
      if (onLoginSuccess) {
        setTimeout(onLoginSuccess, 400);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Impossible de joindre le serveur backend (port 8084).');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Fonctionnalité "Mot de passe oublié" : un lien de réinitialisation sera envoyé à votre adresse.');
  };

  const handleContactAdmin = () => {
    alert("Pour créer un compte professionnel, veuillez contacter l'administrateur de votre établissement de santé.");
  };

  const handleContactSupport = () => {
    alert('Support technique disponible par email : support@centre-sante.bf');
  };

  return (
    <main className="shell">
      {/* Panneau gauche : Présentation Soutien Rose BFK */}
      <LoginHeroBanner
        quote="« Soyez attentives à votre corps ; cela peut vous sauver la vie ! »"
        quoteAuthor="Rosalie Ziba"
      />

      {/* Panneau droit : Espace de connexion */}
      <section className="main">
        <div className="w-[min(100%,430px)] mx-auto">
          {authError && (
            <Alert
              variant="error"
              className="mb-5"
              onClose={() => setAuthError(null)}
            >
              {authError}
            </Alert>
          )}

          {authSuccess && (
            <Alert
              variant="success"
              className="mb-5"
              onClose={() => setAuthSuccess(null)}
            >
              {authSuccess}
            </Alert>
          )}

          <LoginForm
            onSubmit={handleLoginSubmit}
            onForgotPassword={handleForgotPassword}
            onContactAdmin={handleContactAdmin}
            onContactSupport={handleContactSupport}
            isLoading={isLoading}
          />
        </div>
      </section>
    </main>
  );
};

export default LoginPage;
