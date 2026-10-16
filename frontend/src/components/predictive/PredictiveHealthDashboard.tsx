import React, { useState, useMemo, useEffect } from 'react';
import type { IndicateurZoneBF } from '../../types/solidarity';
import { BurkinaHeatmapView } from '../solidarity/BurkinaHeatmapView';
import { statsApi, type DashboardStats, type HeatmapPoint } from '../../services/api/statsApi';
import { centreApi } from '../../services/api/centreApi';
import type { CentreSante } from '../../types/campaign';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ShieldCheck,
  Truck,
  Users,
  Coins,
} from 'lucide-react';

export interface MobileClinicMission {
  id: string;
  nom: string;
  regionCible: string;
  districtCible: string;
  dateDebut: string;
  dateFin: string;
  statut: 'en_cours' | 'planifiee' | 'terminee';
  equipeSoignante: string;
  capaciteDepistageJour: number;
  femmesCibles: number;
  femmesDepistees: number;
  casSuspectsDetectes: number;
  partenaireSponsor: string;
}

interface PredictiveHealthDashboardProps {
  indicateursRegions: IndicateurZoneBF[];
  onDeployMobileClinic: (regionNom: string) => void;
  onFilterByRegion?: (regionNom: string) => void;
}

export const PredictiveHealthDashboard: React.FC<PredictiveHealthDashboardProps> = ({
  indicateursRegions,
  onDeployMobileClinic,
  onFilterByRegion,
}) => {
  const [selectedCsps, setSelectedCsps] = useState<string>('all');
  const [realStats, setRealStats] = useState<DashboardStats | null>(null);
  const [realHeatmapPoints, setRealHeatmapPoints] = useState<HeatmapPoint[] | null>(null);
  const [centresList, setCentresList] = useState<CentreSante[]>([]);
  const [missions, setMissions] = useState<MobileClinicMission[]>(() => {
    const saved = localStorage.getItem('braveher_mobile_clinic_missions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [activeTab, setActiveTab] = useState<'heatmap' | 'missions' | 'decisions'>('heatmap');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [modalTargetRegion, setModalTargetRegion] = useState<string>('Sahel');
  const [modalMissionName, setModalMissionName] = useState<string>('Clinique Mobile Orange');
  const [modalTargetGoal, setModalTargetGoal] = useState<number>(1000);

  // Chargement des données réelles du backend Spring Boot
  useEffect(() => {
    statsApi
      .getDashboard()
      .then((data) => {
        if (data) {
          setRealStats(data);
        }
      })
      .catch(() => {});

    statsApi
      .getHeatmap()
      .then((pts) => {
        if (pts && pts.length > 0) {
          setRealHeatmapPoints(pts);
        }
      })
      .catch(() => {});

    centreApi
      .getCentres()
      .then((centres) => {
        if (centres && centres.length > 0) {
          setCentresList(centres);
        }
      })
      .catch(() => {});
  }, []);

  const saveMissions = (newMissions: MobileClinicMission[]) => {
    setMissions(newMissions);
    localStorage.setItem('braveher_mobile_clinic_missions', JSON.stringify(newMissions));
  };

  // Consolidation des indicateurs avec les points épidémiologiques réels
  const effectiveIndicateurs = useMemo(() => {
    if (!realHeatmapPoints || realHeatmapPoints.length === 0) {
      return indicateursRegions;
    }

    return indicateursRegions.map((region) => {
      const matchPoints = realHeatmapPoints.filter(
        (p) =>
          p.region?.toLowerCase().includes(region.regionNom.toLowerCase()) ||
          region.regionNom.toLowerCase().includes(p.region?.toLowerCase())
      );

      if (matchPoints.length === 0) {
        return {
          ...region,
          depistagesRealises: 0,
          casSuspicionElevee: 0,
          tauxCouverture: 0,
          niveauRisque: 'faible' as const,
        };
      }

      const evalCount = matchPoints.reduce((acc, p) => acc + (p.totalEvaluations || 0), 0);
      const highRisk = matchPoints.reduce((acc, p) => acc + (p.casEleves || 0), 0);

      return {
        ...region,
        depistagesRealises: evalCount,
        casSuspicionElevee: highRisk,
        femmesSensibilisees: Math.max(evalCount * 2, evalCount),
        niveauRisque: highRisk >= 2 ? ('critique' as const) : highRisk === 1 ? ('eleve' as const) : ('faible' as const),
      };
    });
  }, [indicateursRegions, realHeatmapPoints]);

  // Régions en alerte prioritaire détectées par l'algorithme prédictif
  const regionsPrioritaires = useMemo(() => {
    return [...effectiveIndicateurs]
      .sort((a, b) => b.casSuspicionElevee - a.casSuspicionElevee)
      .slice(0, 3);
  }, [effectiveIndicateurs]);

  const handleOpenDeployModal = (regionNom: string) => {
    setModalTargetRegion(regionNom);
    setModalMissionName(`Clinique Mobile Orange — Déploiement ${regionNom}`);
    setIsDeployModalOpen(true);
  };

  const handleConfirmDeploy = (e: React.FormEvent) => {
    e.preventDefault();
    const newMission: MobileClinicMission = {
      id: `mission-${Date.now()}`,
      nom: modalMissionName,
      regionCible: modalTargetRegion,
      districtCible: `District Sanitaire Central (${modalTargetRegion})`,
      dateDebut: new Date().toISOString().split('T')[0],
      dateFin: new Date(Date.now() + 21 * 24 * 3600 * 1000).toISOString().split('T')[0],
      statut: 'en_cours',
      equipeSoignante: 'Équipe Mobile Fondation Orange BF + CHU Référent',
      capaciteDepistageJour: 75,
      femmesCibles: modalTargetGoal,
      femmesDepistees: 0,
      casSuspectsDetectes: 0,
      partenaireSponsor: 'Fondation Orange Burkina Faso (Data for Good)',
    };

    saveMissions([newMission, ...missions]);
    setIsDeployModalOpen(false);
    onDeployMobileClinic(modalTargetRegion);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. En-tête Institutionnel & Filtre CSPS */}
      <div className="bg-gradient-to-r from-[#17343B] via-[#0F4A57] to-[#007599] rounded-2xl p-5 text-white shadow-md border border-[#2D6A78]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-[11px] font-bold tracking-wider uppercase text-cyan-200 border border-white/20">
                Ministère de la Santé · Burkina Faso
              </span>
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-200 rounded-full text-[11px] font-semibold border border-emerald-400/30">
                <ShieldCheck className="w-3 h-3 text-emerald-300" />
                Données Anonymisées
              </span>
            </div>

            <h1 className="text-xl lg:text-2xl font-bold font-serif tracking-tight text-white">
              Tableau de Bord Épidémiologique & Pilotage Stratégique
            </h1>

            <p className="text-xs text-cyan-100/80 max-w-2xl leading-relaxed">
              Consolidation en temps réel des flux de dépistage anonymisés et orientation des ressources médicales.
            </p>
          </div>

          {/* Filtre Sélecteur Multi-CSPS compact */}
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-white/15 flex items-center gap-2.5 shrink-0">
            <Building2 className="w-4 h-4 text-cyan-300 shrink-0" />
            <div>
              <label htmlFor="csps-select" className="text-[10px] font-bold uppercase tracking-wider text-cyan-200 block">
                Périmètre d'analyse
              </label>
              <select
                id="csps-select"
                value={selectedCsps}
                onChange={(e) => setSelectedCsps(e.target.value)}
                className="bg-[#17343B] text-white text-xs font-semibold rounded-lg px-2.5 py-1 border border-cyan-500/40 focus:outline-none focus:ring-1 focus:ring-[#007599]"
              >
                <option value="all">
                  Tous les centres ({centresList.length ? `${centresList.length} connectés` : 'Agrégation Nationale'})
                </option>
                {centresList.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.commune || c.region})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Cartes d'indicateurs réels consolidés du Backend Spring Boot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Patientes Réelles Dépistées */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Patientes Suivies</span>
            <div className="text-2xl font-black text-[#17343B] mt-1">
              {realStats ? realStats.totalPatientes : 0}
            </div>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{realStats ? realStats.totalEvaluations : 0} bilans cliniques réalisés</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EEF7F7] text-[#007599] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 : Cas Suspects Réels */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Cas Suspects Détectés</span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {realStats ? realStats.totalCasEleves : 0}
            </div>
            <div className="text-xs font-semibold text-amber-700 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{realStats ? realStats.totalCasModeres : 0} cas modérés sous surveillance</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 : Bons de Santé Réels */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Bons de Mammographie Émis</span>
            <div className="text-2xl font-black text-[#007599] mt-1">
              {realStats ? realStats.totalBonsEmis : 0}
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Subventionnés Orange & Coris Bank
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#007599] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 : Fonds Disponible Réel */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Fonds de Solidarité Disponible</span>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {realStats ? Number(realStats.totalFondsDisponiblesXof).toLocaleString('fr-FR') : '0'} FCFA
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              {missions.filter((m) => m.statut === 'en_cours').length} mission(s) mobile(s) active(s)
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Coins className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Bandeau d'Alerte Stratégique & Déploiement */}
      <div className="bg-[#F0F9F8] border border-[#D6E8E8] rounded-xl p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-100/70 text-[#007599] flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-[#007599]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#007599] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                Alerte Déploiement
              </span>
              <span className="text-xs font-bold text-[#17343B]">
                Pic de suspicion anormal détecté en zone rurale (Sahel & Boucle du Mouhoun)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Forte concentration de scores élevés couplée à un déficit d'équipements de mammographie fixe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenDeployModal('Sahel')}
            className="py-2 px-3.5 bg-[#007599] hover:bg-[#005C75] text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Déployer Clinique Mobile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('missions')}
            className="py-2 px-3 bg-white hover:bg-slate-50 text-[#17343B] border border-slate-200 rounded-lg font-semibold text-xs transition-all flex items-center gap-1"
          >
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Missions ({missions.length})</span>
          </button>
        </div>
      </div>

      {/* 4. Barre d'onglets de navigation interne */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('heatmap')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'heatmap'
              ? 'bg-[#17343B] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Cartographie Thermique des 13 Régions</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('missions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'missions'
              ? 'bg-[#17343B] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Missions Mobiles Orange Actives ({missions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('decisions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'decisions'
              ? 'bg-[#17343B] text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Matrice Décisionnelle Régionale</span>
        </button>
      </div>

      {/* 5. Contenu de l'onglet actif */}
      {activeTab === 'heatmap' && (
        <div className="space-y-4">
          <BurkinaHeatmapView
            indicateurs={effectiveIndicateurs}
            onFilterByRegion={onFilterByRegion}
            onDeployMobileClinic={handleOpenDeployModal}
            isStandalone={true}
          />
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#17343B]">
                Suivi Opérationnel des Cliniques Mobiles de Mammographie
              </h3>
              <p className="text-xs text-[#536B70]">
                Flotte de camions médicalisés équipés de mammographes numériques et d'échographes solaires.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleOpenDeployModal('Centre-Nord')}
              className="py-2 px-3 bg-[#007599] hover:bg-[#005C75] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Nouvelle Mission</span>
            </button>
          </div>

          {missions.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
              <Truck className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-[#17343B]">Aucune mission mobile active</h4>
              <p className="text-xs text-[#536B70] max-w-sm mx-auto mt-1 mb-4">
                Aucune clinique mobile n'est actuellement déployée sur le terrain. Cliquez ci-dessous pour ordonner un déploiement dans une région prioritaire.
              </p>
              <button
                type="button"
                onClick={() => handleOpenDeployModal('Sahel')}
                className="py-2 px-4 bg-[#007599] hover:bg-[#005C75] text-white rounded-lg text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>+ Déployer une Clinique Mobile</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {missions.map((m) => {
                const avancement = Math.min(100, Math.round((m.femmesDepistees / m.femmesCibles) * 100));
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#007599] transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            m.statut === 'en_cours'
                              ? 'bg-emerald-100 text-emerald-800'
                              : m.statut === 'planifiee'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {m.statut === 'en_cours' ? '● En cours de mission' : 'Planifiée'}
                        </span>
                        <h4 className="font-bold text-sm text-[#17343B] mt-1.5">{m.nom}</h4>
                        <p className="text-xs text-[#007599] font-medium flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {m.regionCible} — {m.districtCible}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
                      <p><strong>Équipe :</strong> {m.equipeSoignante}</p>
                      <p><strong>Capacité :</strong> {m.capaciteDepistageJour} examens/jour</p>
                      <p><strong>Période :</strong> {m.dateDebut} au {m.dateFin}</p>
                      <p><strong>Partenaire :</strong> {m.partenaireSponsor}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">Progression objectif :</span>
                        <span className="font-bold text-[#17343B]">{m.femmesDepistees} / {m.femmesCibles} ({avancement}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#007599] h-full transition-all duration-500"
                          style={{ width: `${avancement}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded">
                        {m.casSuspectsDetectes} cas suspects orientés
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeployMobileClinic(m.regionCible)}
                        className="text-[#007599] hover:underline font-semibold"
                      >
                        Détails mission →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'decisions' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-[#17343B]">
              Matrice de Priorisation du Ministère de la Santé
            </h3>
            <p className="text-xs text-[#536B70]">
              Classement algorithmique des régions nécessitant un renfort immédiat en cliniques mobiles et fonds de solidarité.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold text-[11px]">
                  <th className="p-3">Région Sanitaire</th>
                  <th className="p-3">Chef-lieu</th>
                  <th className="p-3">Cas Suspects Détectés</th>
                  <th className="p-3">Taux Couverture</th>
                  <th className="p-3">Éloignement Centre Imagerie</th>
                  <th className="p-3">Niveau d'Urgence</th>
                  <th className="p-3 text-right">Action Recommandée</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {regionsPrioritaires.map((r, idx) => (
                  <tr key={r.regionId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-[#17343B]">
                      <span className="inline-block w-5 h-5 rounded-full bg-slate-100 text-center leading-5 text-[11px] mr-2">
                        {idx + 1}
                      </span>
                      {r.regionNom}
                    </td>
                    <td className="p-3 text-slate-600">{r.chefLieu}</td>
                    <td className="p-3 font-black text-rose-700">{r.casSuspicionElevee} cas</td>
                    <td className="p-3 font-semibold text-slate-700">{r.tauxCouverture}%</td>
                    <td className="p-3 text-slate-600">
                      {r.regionNom === 'Sahel'
                        ? '&gt; 250 km (Dori)'
                        : r.regionNom === 'Est'
                        ? '&gt; 220 km (Fada)'
                        : '80 à 150 km'}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        Alerte Rouge - Priorité 1
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDeployModal(r.regionNom)}
                        className="py-1.5 px-3 bg-[#007599] hover:bg-[#005C75] text-white rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Déployer Clinique Mobile</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal interactif de déploiement de clinique mobile */}
      {isDeployModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#007599] flex items-center justify-center">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#17343B]">
                    Ordre de Mission Clinique Mobile Orange
                  </h3>
                  <p className="text-xs text-slate-500">
                    Programme National de Dépistage Décentralisé
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeployModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDeploy} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Intitulé de la Mission
                </label>
                <input
                  type="text"
                  value={modalMissionName}
                  onChange={(e) => setModalMissionName(e.target.value)}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#007599]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Région Cible d'Intervention
                  </label>
                  <select
                    value={modalTargetRegion}
                    onChange={(e) => setModalTargetRegion(e.target.value)}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#007599]"
                  >
                    {indicateursRegions.map((r) => (
                      <option key={r.regionId} value={r.regionNom}>
                        {r.regionNom}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Objectif Patientes Dépistées
                  </label>
                  <input
                    type="number"
                    value={modalTargetGoal}
                    onChange={(e) => setModalTargetGoal(Number(e.target.value))}
                    min={200}
                    max={5000}
                    step={100}
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#007599]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-[#F0F9F8] rounded-xl border border-[#D6E8E8] text-xs text-[#17343B] space-y-1">
                <p className="font-bold flex items-center gap-1 text-[#007599]">
                  <ShieldCheck className="w-4 h-4 text-[#007599]" />
                  Financement & Logistique 100% pris en charge :
                </p>
                <p>
                  Dotation Orange Money pour carburant, kits de mammographie et indemnités des sages-femmes mobilisées.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeployModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#007599] hover:bg-[#005C75] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirmer le Déploiement Terrain</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
