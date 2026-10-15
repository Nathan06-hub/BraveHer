import React, { useState } from 'react';
import { LoginHeroBanner, LoginForm } from '../components/loginPage';
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
      <LoginHeroBanner quote="« citation »" />

      {/* Panneau droit : Espace de connexion */}
      <section className="main">
        {authError && (
          <div className="mb-5 p-3 rounded-[9px] bg-red-50 border border-red-200 text-red-800 text-sm font-medium flex items-center gap-2 max-w-[430px] w-full">
            <svg className="w-4 h-4 text-red-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="mb-5 p-3 rounded-[9px] bg-green-50 border border-green-200 text-green-800 text-sm font-medium flex items-center gap-2 max-w-[430px] w-full">
            <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>{authSuccess}</span>
          </div>
        )}

        <LoginForm
          onSubmit={handleLoginSubmit}
          onForgotPassword={handleForgotPassword}
          onContactAdmin={handleContactAdmin}
          onContactSupport={handleContactSupport}
          isLoading={isLoading}
        />
      </section>
    </main>
  );
};

export default LoginPage;
