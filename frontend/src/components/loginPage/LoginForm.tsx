import React, { useState } from 'react';
import { InputField, Checkbox, Button } from '../ui';
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
      <div className="mobile-brand" aria-label="Soutien Rose, Burkina Faso">
        <span className="brand-mark">R</span>
        <span>
          Soutien Rose
          <small>Burkina Faso</small>
        </span>
      </div>

      {/* Heading */}
      <h2 className="m-0 mb-[9px] font-serif text-[38px] font-[500] tracking-[-0.025em] text-[#17343B]">
        Bon retour parmi nous
      </h2>
      <p className="intro m-0 mb-[32px] text-[#536B70] text-[14px] leading-[1.6]">
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
              className="show absolute top-1/2 right-[13px] -translate-y-1/2 border-0 bg-transparent text-[#005C75] text-[12px] font-[650] cursor-pointer select-none hover:underline"
            >
              {showPassword ? 'Masquer' : 'Afficher'}
            </button>
          }
        />

        {/* Remember me & Forgot Password */}
        <div className="form-row flex items-center justify-between gap-3 -mt-[2px] mb-[24px] text-[12px]">
          <Checkbox
            label="Se souvenir de moi"
            name="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />

          <button
            type="button"
            onClick={onForgotPassword}
            className="text-[#005C75] font-[650] hover:underline cursor-pointer bg-transparent border-0 p-0 text-[12px]"
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
