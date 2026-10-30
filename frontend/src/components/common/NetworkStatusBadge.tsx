import React, { useState } from 'react';
import {
  RefreshCw,
  CloudOff,
  Cloud,
  Server,
  Zap,
} from 'lucide-react';

interface NetworkStatusBadgeProps {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  backendAvailable?: boolean;
  backendLatencyMs?: number;
  pendingSyncCount: number;
  isSyncing: boolean;
  onToggleSimulatedOffline: () => void;
  onSyncNow: () => void;
}

export const NetworkStatusBadge: React.FC<NetworkStatusBadgeProps> = ({
  isOnline,
  isSimulatedOffline,
  backendAvailable = false,
  backendLatencyMs,
  pendingSyncCount,
  isSyncing,
  onToggleSimulatedOffline,
  onSyncNow,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-flex items-center">
      {/* Badge Principal Tricolore */}
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none border shadow-xs ${
          !isOnline
            ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            : backendAvailable
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            : 'bg-teal-50 text-[#007599] border-teal-200 hover:bg-teal-100'
        }`}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {isSyncing ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#007599]" />
        ) : !isOnline ? (
          <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0"></span>
        ) : backendAvailable ? (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        ) : (
          <span className="relative flex h-2 w-2">
            <span className="h-2 w-2 rounded-full bg-[#007599] shrink-0"></span>
          </span>
        )}

        <span className="text-[11px] font-bold">
          {isSyncing
            ? 'Synchronisation...'
            : !isOnline
            ? 'Mission Rurale (Hors-Ligne)'
            : backendAvailable
            ? `Spring Boot 8080 : Connecté ${backendLatencyMs ? `(${backendLatencyMs}ms)` : ''}`
            : 'Mode Démo Locale (Fallback Actif)'}
        </span>

        {pendingSyncCount > 0 && (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-extrabold bg-[#FF7900] text-white">
            {pendingSyncCount}
          </span>
        )}
      </div>

      {/* Popover / Panneau interactif de Connectivité */}
      {showTooltip && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowTooltip(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-white rounded-2xl shadow-xl border border-[#D6E8E8] p-4 text-xs animate-fadeIn">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#EEF5F5]">
              <span className="font-bold text-[#17343B] flex items-center gap-1.5">
                <Server className="w-4 h-4 text-[#007599]" />
                État d'Intégration & Résilience
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                {backendAvailable ? 'API CONNECTÉE' : 'API INDISPONIBLE'}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Connectivité Réseau :</span>
                <span className={`font-bold ${isOnline ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {isOnline ? 'Réseau Orange 4G' : 'Hors-Ligne (Rural)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] p-2 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-600">Backend Spring Boot :</span>
                <span className={`font-bold flex items-center gap-1 ${backendAvailable ? 'text-emerald-700' : 'text-[#007599]'}`}>
                  <Zap className="w-3 h-3" />
                  {backendAvailable ? 'API disponible' : 'API indisponible'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#536B70] leading-relaxed mb-3">
              {backendAvailable && pendingSyncCount === 0
                ? 'Les requêtes transitent vers le backend Spring Boot et la base de données configurée.'
                : 'Les actions en attente sont chiffrées (AES-GCM) dans IndexedDB puis rejouées quand l’API est disponible. La clé est conservée dans le profil du navigateur; cela ne protège pas contre un appareil ou une application compromis. Validez le consentement et les règles de conservation avant un pilote réel.'}
            </p>

            <div className="space-y-2 pt-1 border-t border-[#EEF5F5]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500">File d'attente locale (Sync Queue) :</span>
                <strong className="text-slate-800 font-mono">
                  {pendingSyncCount} action(s)
                </strong>
              </div>

              {pendingSyncCount > 0 && isOnline && (
                <button
                  type="button"
                  onClick={() => {
                    onSyncNow();
                    setShowTooltip(false);
                  }}
                  disabled={isSyncing}
                  className="w-full py-1.5 px-3 rounded-lg bg-[#007599] hover:bg-[#005C75] text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Synchroniser maintenant {backendAvailable ? 'vers Spring Boot' : ''}</span>
                </button>
              )}

              {/* Bouton de simulation pour le Jury */}
              <button
                type="button"
                onClick={() => {
                  onToggleSimulatedOffline();
                }}
                className={`w-full py-2 px-3 rounded-xl text-[11px] font-bold flex items-center justify-center gap-2 transition-all mt-1 ${
                  isSimulatedOffline
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm'
                }`}
              >
                {isSimulatedOffline ? (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Rétablir Connexion Réseau (Démo)</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-3.5 h-3.5" />
                    <span>Simuler Mode Rural Déconnecté (Démo)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
