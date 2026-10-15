import React, { useState } from 'react';
import { InputField, Checkbox, Button, Logo } from '../ui';
import { LoginTrustBadge } from './LoginTrustBadge';
import { LoginFooterLinks } from './LoginFooterLinks';

export interface LoginFormProps {
  onSubmit?: (data: { email: string; password: string; rememberMe: boolean }) => void;
  onForgotPassword?: () => void;
  onContactAdmin?: () => void;
  onContactSupport?: () => void;
  isLoading?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  onForgotPassword,
  onContactAdmin,
  onContactSupport,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = 'Veuillez saisir votre adresse e-mail professionnelle.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Format d’adresse e-mail invalide.';
    }

    if (!password) {
      newErrors.password = 'Veuillez saisir votre mot de passe.';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit comporter au moins 6 caractères.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (onSubmit) {
      onSubmit({ email: email.trim(), password, rememberMe });
    }
  };

  return (
    <div className="login w-[min(100%,430px)] mx-auto text-left">
      {/* Marque mobile affichée uniquement en mobile (< 700px) */}
      <div className="mobile-brand mb-8" aria-label="Soutien Rose, Burkina Faso">
        <Logo variant="rose" size="lg" layout="horizontal" />
      </div>

      {/* Heading */}
      <h2 className="m-0 mb-2 font-serif text-[45px] font-[500] tracking-[-0.025em] text-[var(--ink)] leading-tight">
        Bon retour parmi nous
      </h2>
      <p className="intro m-0 mb-8 text-[var(--muted)] text-[14px] leading-[1.6]">
        Connectez-vous à votre espace professionnel de santé.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email Field */}
        <InputField
          id="email"
          label="Adresse e-mail professionnelle"
          type="email"
          inputMode="email"
          autoComplete="username"
          placeholder="nom@centre-sante.bf"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          required
        />

        {/* Password Field */}
        <InputField
          id="password"
          label="Mot de passe"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="Votre mot de passe"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          required
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="show absolute top-1/2 right-[12px] -translate-y-1/2 border-0 bg-transparent text-[var(--teal-dark)] hover:text-[#a82d58] text-[12px] font-[650] cursor-pointer select-none flex items-center gap-1.5 p-1 rounded transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? (
                <>
                  <svg className="w-4 h-4 text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                    />
                  </svg>
                  <span>Masquer</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-current transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <span>Afficher</span>
                </>
              )}
            </button>
          }
        />

        {/* Remember me & Forgot Password */}
        <div className="form-row flex items-center justify-between gap-3 -mt-1 mb-6 text-[12px]">
          <Checkbox
            label="Se souvenir de moi"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[var(--teal-dark)] hover:text-[#a82d58] font-[650] hover:underline cursor-pointer bg-transparent border-0 p-0 text-[12px] transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          className="submit h-[52px] text-[14px] font-[700] rounded-[9px]"
        >
          Se connecter
        </Button>
      </form>

      {/* Security badge */}
      <LoginTrustBadge />

      {/* Footer support & help links */}
      <LoginFooterLinks
        onContactAdmin={onContactAdmin}
        onContactSupport={onContactSupport}
      />
    </div>
  );
};
