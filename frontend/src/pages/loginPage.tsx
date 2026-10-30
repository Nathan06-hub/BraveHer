import React, { useState } from 'react';
import { LoginHeroBanner, LoginForm } from '../components/loginPage';
import { Alert } from '../components/ui';
import { authApi, type BackendUser } from '../services/api';
import './loginPage.css';

export interface LoginPageProps {
  onLoginSuccess?: (user?: BackendUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginSubmit = async (data: { identifiant: string; password: string; rememberMe: boolean }) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const loginRes = await authApi.login(data.identifiant, data.password);
      if (onLoginSuccess) {
        onLoginSuccess(loginRes.utilisateur);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Impossible de joindre le serveur backend.');
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
      {/* Panneau gauche : Présentation Brave_her BFK */}
      <LoginHeroBanner
        quote="« Soyez attentives à votre corps ; cela peut vous sauver la vie ! »"
        quoteAuthor="Rosalie Ziba"
      />

      {/* Panneau droit : Espace de connexion */}
      <section className="main">
        <div className="w-[min(100%,430px)] mx-auto py-6">
          {authError && (
            <Alert
              variant="error"
              className="mb-5"
              onClose={() => setAuthError(null)}
            >
              {authError}
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
