import React, { useState, useMemo } from 'react';
import type { IndicateurZoneBF } from '../../types/solidarity';
import { BurkinaHeatmapView } from '../solidarity/BurkinaHeatmapView';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  ShieldCheck,
  TrendingUp,
  Truck,
  Users,
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

const INITIAL_MISSIONS: MobileClinicMission[] = [
  {
    id: 'mission-1',
    nom: 'Clinique Mobile Orange N°1 — Espoir Sahel',
    regionCible: 'Sahel',
    districtCible: 'District Sanitaire de Dori',
    dateDebut: '2026-10-01',
    dateFin: '2026-10-22',
    statut: 'en_cours',
    equipeSoignante: 'Dr. Sawadogo (Radiologue) + 3 Sages-femmes',
    capaciteDepistageJour: 80,
    femmesCibles: 1200,
    femmesDepistees: 940,
    casSuspectsDetectes: 34,
    partenaireSponsor: 'Fondation Orange Burkina Faso',
  },
  {
    id: 'mission-2',
    nom: 'Clinique Mobile Orange N°2 — Boucle Solidaire',
    regionCible: 'Boucle du Mouhoun',
    districtCible: 'District Sanitaire de Dédougou',
    dateDebut: '2026-10-10',
    dateFin: '2026-10-31',
    statut: 'en_cours',
    equipeSoignante: 'Dr. Ilboudo + 2 Infirmières d\'État',
    capaciteDepistageJour: 70,
    femmesCibles: 1000,
    femmesDepistees: 520,
    casSuspectsDetectes: 19,
    partenaireSponsor: 'Fondation Orange Burkina Faso',
  },
  {
    id: 'mission-3',
    nom: 'Clinique Mobile N°3 — Rameau Est',
    regionCible: 'Est',
    districtCible: 'Fada N\'Gourma / Kantchari',
    dateDebut: '2026-11-05',
    dateFin: '2026-11-25',
    statut: 'planifiee',
    equipeSoignante: 'Équipe CHR Fada N\'Gourma',
    capaciteDepistageJour: 60,
    femmesCibles: 900,
    femmesDepistees: 0,
    casSuspectsDetectes: 0,
    partenaireSponsor: 'Coris Bank International',
  },
];

const CSPS_LIST = [
  { id: 'all', nom: 'Tous les 18 CSPS connectés (Agrégation Nationale)', region: 'National', connecte: true },
  { id: 'csps-schiphra', nom: 'CSPS Schiphra', region: 'Centre', connecte: true },
  { id: 'csps-bogodogo', nom: 'CSPS Bogodogo', region: 'Centre', connecte: true },
  { id: 'csps-sig-noghin', nom: 'CSPS Sig-Noghin', region: 'Centre', connecte: true },
  { id: 'cma-kossodo', nom: 'CMA Kossodo', region: 'Centre', connecte: true },
  { id: 'csps-dori', nom: 'CSPS Dori Centre', region: 'Sahel', connecte: true },
  { id: 'csps-gorom', nom: 'CSPS Gorom-Gorom', region: 'Sahel', connecte: true },
  { id: 'csps-dedougou', nom: 'CSPS Dédougou Urbain', region: 'Boucle du Mouhoun', connecte: true },
  { id: 'csps-tougan', nom: 'CSPS Tougan', region: 'Boucle du Mouhoun', connecte: true },
  { id: 'csps-fada', nom: 'CSPS Fada N\'Gourma', region: 'Est', connecte: true },
  { id: 'csps-bobo-22', nom: 'CSPS Bobo Secteur 22', region: 'Hauts-Bassins', connecte: true },
  { id: 'csps-ouahigouya', nom: 'CSPS Ouahigouya Centre', region: 'Nord', connecte: true },
];

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
  const [missions, setMissions] = useState<MobileClinicMission[]>(INITIAL_MISSIONS);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'missions' | 'decisions'>('heatmap');
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [modalTargetRegion, setModalTargetRegion] = useState<string>('Sahel');
  const [modalMissionName, setModalMissionName] = useState<string>('Clinique Mobile Orange');
  const [modalTargetGoal, setModalTargetGoal] = useState<number>(1000);

  // Calculs statistiques consolidés multi-CSPS
  const statsNationales = useMemo(() => {
    const totalSensibilisees = indicateursRegions.reduce((sum, r) => sum + r.femmesSensibilisees, 0);
    const totalDepistages = indicateursRegions.reduce((sum, r) => sum + r.depistagesRealises, 0);
    const totalCasSuspects = indicateursRegions.reduce((sum, r) => sum + r.casSuspicionElevee, 0);
    const totalAides = indicateursRegions.reduce((sum, r) => sum + r.aidesAttribuees, 0);
    const moyenneSuspicion = totalDepistages > 0 ? ((totalCasSuspects / totalDepistages) * 100).toFixed(1) : '3.8';
    const regionsAlerte = indicateursRegions.filter((r) => r.niveauRisque === 'eleve').length;
    const missionsActives = missions.filter((m) => m.statut === 'en_cours').length;

    return {
      totalSensibilisees,
      totalDepistages,
      totalCasSuspects,
      totalAides,
      moyenneSuspicion,
      regionsAlerte,
      missionsActives,
    };
  }, [indicateursRegions, missions]);

  // Régions en alerte prioritaire détectées par l'algorithme prédictif
  const regionsPrioritaires = useMemo(() => {
    return [...indicateursRegions]
      .sort((a, b) => b.casSuspicionElevee - a.casSuspicionElevee)
      .slice(0, 3);
  }, [indicateursRegions]);

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

    setMissions([newMission, ...missions]);
    setIsDeployModalOpen(false);
    onDeployMobileClinic(modalTargetRegion);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. En-tête Institutionnel & Data for Good */}
      <div className="bg-gradient-to-r from-[#17343B] via-[#0F4A57] to-[#007599] rounded-2xl p-6 text-white shadow-lg border border-[#2D6A78]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase text-amber-200 border border-white/20">
                Ministère de la Santé du Burkina Faso
              </span>
              <span className="px-3 py-1 bg-[#FF7900] text-white rounded-full text-xs font-bold tracking-wider uppercase shadow-sm">
                Orange Data for Good
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-200 rounded-full text-xs font-semibold border border-emerald-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                Données Anonymisées & Conformes Santé Publique
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight text-white">
              Tableau de Bord Prédictif & Pilotage Stratégique National
            </h1>

            <p className="text-sm text-cyan-100/90 max-w-3xl leading-relaxed">
              Consolidation épidémiologique en temps réel des flux de dépistage anonymisés de tous les CSPS connectés. 
              Visualisez les hotspots territoriaux et orientez les ressources médicales d'Orange (cliniques mobiles, dotations de mammographie gratuite).
            </p>
          </div>

          {/* Filtre Sélecteur Multi-CSPS */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 min-w-[280px] space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="csps-select" className="text-xs font-bold uppercase tracking-wider text-cyan-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#FF7900]" />
                Réseau des CSPS Connectés
              </label>
              <span className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                18 Connectés
              </span>
            </div>

            <select
              id="csps-select"
              value={selectedCsps}
              onChange={(e) => setSelectedCsps(e.target.value)}
              className="w-full bg-[#17343B] text-white text-xs font-medium rounded-lg px-3 py-2 border border-cyan-500/40 focus:outline-none focus:ring-2 focus:ring-[#FF7900]"
            >
              {CSPS_LIST.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom} {c.region !== 'National' ? `(${c.region})` : ''}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-cyan-200/70 italic">
              {selectedCsps === 'all'
                ? 'Données consolidées à l’échelle des 13 régions du Burkina Faso'
                : `Focalisation sur les données transmises par ${CSPS_LIST.find((c) => c.id === selectedCsps)?.nom}`}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Cartes d'indicateurs nationaux agrégés */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Dépistages Consolidés */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Dépistages Consolidés</span>
            <div className="text-2xl font-black text-[#17343B] mt-1">
              {statsNationales.totalDepistages.toLocaleString('fr-FR')}
            </div>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% ce trimestre</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#EEF7F7] text-[#007599] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 2 : Taux Moyen de Suspicion */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Taux Moyen de Suspicion</span>
            <div className="text-2xl font-black text-[#FF7900] mt-1">
              {statsNationales.moyenneSuspicion}%
            </div>
            <div className="text-xs font-semibold text-rose-700 flex items-center gap-1 mt-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Seuil de vigilance : 3.0%</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#FF7900] flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 3 : Régions en Alerte Rouge */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Régions en Alerte Élevée</span>
            <div className="text-2xl font-black text-rose-700 mt-1">
              {statsNationales.regionsAlerte} / 13
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-1">
              Sahel & Boucle du Mouhoun
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        {/* KPI 4 : Cliniques Mobiles en Opération */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-500">Cliniques Mobiles Orange</span>
            <div className="text-2xl font-black text-[#007599] mt-1">
              {statsNationales.missionsActives} Actives
            </div>
            <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>1 460 femmes dépistées sur le terrain</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-cyan-50 text-[#007599] flex items-center justify-center">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Section Recommandation Prédictive Stratégique : Déploiement de Cliniques Mobiles */}
      <div className="bg-gradient-to-br from-amber-50 to-[#FFF9F0] border-2 border-[#FF7900]/40 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF7900] text-white rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              Recommandation Stratégique Ministère × Orange Data for Good
            </div>

            <h3 className="text-xl font-bold text-[#17343B]">
              Alerte de Déploiement : Pic de suspicion anormal détecté dans les zones rurales
            </h3>

            <p className="text-xs text-[#536B70] leading-relaxed">
              L'analyse croisée des bilans cliniques issus des CSPS montre une concentration alarmante de nodules adhérents 
              et de scores IA &gt; 70% dans les régions du <strong>Sahel (Dori)</strong> et de la <strong>Boucle du Mouhoun (Dédougou)</strong>, 
              couplée à un déficit d'équipements de mammographie fixe.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Cible d'Intervention</span>
                <span className="text-sm font-black text-[#17343B]">2 500 Femmes Isolées</span>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Diagnostics Précoces Estimés</span>
                <span className="text-sm font-black text-rose-700">~45 Cas Infiltrants Évités</span>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200">
                <span className="text-[11px] font-bold text-slate-500 uppercase block">Économie de Santé Projetée</span>
                <span className="text-sm font-black text-emerald-800">42 500 000 FCFA</span>
              </div>
            </div>
          </div>

          {/* Bouton d'action directe de déploiement */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[260px]">
            <button
              type="button"
              onClick={() => handleOpenDeployModal('Sahel')}
              className="py-3 px-5 bg-[#FF7900] hover:bg-[#E06A00] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Truck className="w-5 h-5 text-white" />
              <span>Déployer Clinique Mobile Orange</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('missions')}
              className="py-2.5 px-4 bg-white hover:bg-slate-50 text-[#17343B] border border-slate-300 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Consulter les Missions en Cours ({missions.length})</span>
            </button>
          </div>
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
            indicateurs={indicateursRegions}
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
              className="py-2 px-3 bg-[#FF7900] hover:bg-[#E06A00] text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Truck className="w-4 h-4" />
              <span>Nouvelle Mission</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {missions.map((m) => {
              const avancement = Math.min(100, Math.round((m.femmesDepistees / m.femmesCibles) * 100));
              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#FF7900] transition-all space-y-3"
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
                        className="bg-[#FF7900] h-full transition-all duration-500"
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
                        className="py-1.5 px-3 bg-[#FF7900] hover:bg-[#E06A00] text-white rounded-lg font-bold text-xs transition-all inline-flex items-center gap-1"
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
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#FF7900] flex items-center justify-center">
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
                  className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF7900]"
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
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF7900]"
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
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-[#FF7900]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-[#FF7900]" />
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
                  className="px-5 py-2 bg-[#FF7900] hover:bg-[#E06A00] text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
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
