import React, { useState, useMemo } from 'react';
import type { IndicateurZoneBF } from '../../types/solidarity';
import {
  ArrowLeft,
  MapPin,
  TrendingUp,
  AlertTriangle,
  Users,
  CreditCard,
  Search,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  Truck,
} from 'lucide-react';

interface BurkinaHeatmapViewProps {
  indicateurs: IndicateurZoneBF[];
  onBack?: () => void;
  onFilterByRegion?: (regionNom: string) => void;
  onDeployMobileClinic?: (regionNom: string) => void;
  isStandalone?: boolean;
}

type MetricKey =
  | 'casSuspicionElevee'
  | 'femmesSensibilisees'
  | 'depistagesRealises'
  | 'aidesAttribuees'
  | 'tauxCouverture';

interface RegionCoords {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  path: string;
}

// 13 Régions sanitaires du Burkina Faso avec géométrie cartographique
const REGIONS_GEOMETRY: RegionCoords[] = [
  {
    id: 'sahel',
    name: 'Sahel',
    x: 480,
    y: 50,
    width: 170,
    height: 110,
    path: 'M 440 60 L 590 30 L 640 110 L 550 170 L 460 140 Z',
  },
  {
    id: 'nord',
    name: 'Nord',
    x: 320,
    y: 110,
    width: 130,
    height: 90,
    path: 'M 300 110 L 440 60 L 460 140 L 370 190 L 290 160 Z',
  },
  {
    id: 'centre-nord',
    name: 'Centre-Nord',
    x: 430,
    y: 160,
    width: 120,
    height: 90,
    path: 'M 460 140 L 550 170 L 530 250 L 420 230 L 370 190 Z',
  },
  {
    id: 'boucle-mouhoun',
    name: 'Boucle du Mouhoun',
    x: 180,
    y: 180,
    width: 130,
    height: 150,
    path: 'M 290 160 L 370 190 L 330 280 L 250 330 L 170 270 L 210 180 Z',
  },
  {
    id: 'plateau-central',
    name: 'Plateau-Central',
    x: 400,
    y: 220,
    width: 90,
    height: 70,
    path: 'M 370 190 L 420 230 L 460 270 L 390 290 L 360 240 Z',
  },
  {
    id: 'centre',
    name: 'Centre (Ouaga)',
    x: 355,
    y: 245,
    width: 60,
    height: 50,
    path: 'M 360 240 L 390 240 L 390 275 L 350 275 Z',
  },
  {
    id: 'centre-ouest',
    name: 'Centre-Ouest',
    x: 290,
    y: 250,
    width: 100,
    height: 90,
    path: 'M 330 280 L 350 275 L 360 330 L 300 370 L 250 330 Z',
  },
  {
    id: 'centre-sud',
    name: 'Centre-Sud',
    x: 360,
    y: 290,
    width: 90,
    height: 80,
    path: 'M 350 275 L 390 275 L 440 330 L 380 390 L 360 330 Z',
  },
  {
    id: 'centre-est',
    name: 'Centre-Est',
    x: 450,
    y: 270,
    width: 110,
    height: 100,
    path: 'M 460 270 L 530 250 L 570 330 L 480 390 L 440 330 Z',
  },
  {
    id: 'est',
    name: 'Est',
    x: 540,
    y: 210,
    width: 180,
    height: 180,
    path: 'M 550 170 L 640 110 L 730 220 L 670 340 L 570 330 L 530 250 Z',
  },
  {
    id: 'hauts-bassins',
    name: 'Hauts-Bassins',
    x: 150,
    y: 310,
    width: 130,
    height: 100,
    path: 'M 170 270 L 250 330 L 240 400 L 140 390 L 120 320 Z',
  },
  {
    id: 'cascades',
    name: 'Cascades',
    x: 100,
    y: 380,
    width: 120,
    height: 90,
    path: 'M 140 390 L 210 400 L 190 480 L 90 460 L 110 400 Z',
  },
  {
    id: 'sud-ouest',
    name: 'Sud-Ouest',
    x: 210,
    y: 380,
    width: 110,
    height: 110,
    path: 'M 250 330 L 300 370 L 290 470 L 200 480 L 240 400 Z',
  },
];

export const BurkinaHeatmapView: React.FC<BurkinaHeatmapViewProps> = ({
  indicateurs,
  onBack,
  onFilterByRegion,
  onDeployMobileClinic,
  isStandalone = false,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>('casSuspicionElevee');
  const [selectedRegionId, setSelectedRegionId] = useState<string>('centre');
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [searchTable, setSearchTable] = useState('');

  // Finding the maximum value for the selected metric to calculate color intensity
  const maxMetricValue = useMemo(() => {
    return Math.max(...indicateurs.map((i) => i[selectedMetric]), 1);
  }, [indicateurs, selectedMetric]);

  const activeRegion = useMemo(() => {
    return (
      indicateurs.find((i) => i.regionId === (hoveredRegionId || selectedRegionId)) ||
      indicateurs[0]
    );
  }, [indicateurs, selectedRegionId, hoveredRegionId]);

  // Color gradient calculation based on metric
  const getRegionFillColor = (value: number) => {
    const ratio = Math.min(Math.max(value / maxMetricValue, 0.15), 1);

    if (selectedMetric === 'casSuspicionElevee') {
      // Rose/Red gradient for alert
      const lightness = 95 - ratio * 45;
      return `hsl(340, 85%, ${lightness}%)`;
    } else if (selectedMetric === 'femmesSensibilisees') {
      // Teal gradient
      const lightness = 95 - ratio * 45;
      return `hsl(192, 85%, ${lightness}%)`;
    } else if (selectedMetric === 'aidesAttribuees') {
      // Orange gradient
      const lightness = 95 - ratio * 45;
      return `hsl(28, 95%, ${lightness}%)`;
    } else if (selectedMetric === 'tauxCouverture') {
      // Green gradient
      const lightness = 95 - ratio * 45;
      return `hsl(155, 75%, ${lightness}%)`;
    } else {
      // Blue/Teal gradient
      const lightness = 95 - ratio * 45;
      return `hsl(205, 80%, ${lightness}%)`;
    }
  };

  const filteredIndicateurs = useMemo(() => {
    if (!searchTable.trim()) return indicateurs;
    const q = searchTable.toLowerCase();
    return indicateurs.filter(
      (i) =>
        i.regionNom.toLowerCase().includes(q) ||
        i.chefLieu.toLowerCase().includes(q)
    );
  }, [indicateurs, searchTable]);

  return (
    <div className="inpage-view-container">
      {/* En-tête In-Page sans modal */}
      <div className="inpage-header">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              className="inpage-back-btn"
              onClick={onBack}
              aria-label="Retour aux demandes"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>
          )}
          <div>
            <span className="modal-eyebrow">
              {isStandalone ? 'MINISTÈRE DE LA SANTÉ & ORANGE DATA FOR GOOD' : 'MODULE 4 · PILOTAGE ÉPIDÉMIOLOGIQUE TERRITORIAL'}
            </span>
            <h2 className="text-xl font-bold text-[#17343B] font-serif">
              Cartographie & Tendances de Dépistage au Burkina Faso
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 bg-[#EEF7F7] text-[#007599] rounded-full border border-[#B2DDDD]">
            13 Régions Sanitaires Déployées
          </span>
        </div>
      </div>

      {/* Barre de métriques épidémiologiques */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#D6E8E8]">
        <button
          type="button"
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedMetric === 'casSuspicionElevee'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          onClick={() => setSelectedMetric('casSuspicionElevee')}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Cas de Suspicion Élevée</span>
        </button>

        <button
          type="button"
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedMetric === 'femmesSensibilisees'
              ? 'bg-[#007599] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          onClick={() => setSelectedMetric('femmesSensibilisees')}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Femmes Sensibilisées</span>
        </button>

        <button
          type="button"
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedMetric === 'depistagesRealises'
              ? 'bg-sky-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          onClick={() => setSelectedMetric('depistagesRealises')}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Dépistages Cliniques</span>
        </button>

        <button
          type="button"
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedMetric === 'aidesAttribuees'
              ? 'bg-[#FF7900] text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          onClick={() => setSelectedMetric('aidesAttribuees')}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Aides Orange Money</span>
        </button>

        <button
          type="button"
          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            selectedMetric === 'tauxCouverture'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
          }`}
          onClick={() => setSelectedMetric('tauxCouverture')}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Taux de Couverture (%)</span>
        </button>
      </div>

      {/* Grille principale : Carte Interactive SVG + Inspecteur Régional */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche (2/3) : Carte vectorielle SVG */}
        <div className="lg:col-span-2 inpage-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#007599]" />
              <h3 className="text-sm font-bold text-[#17343B]">
                Carte Épidémiologique des 13 Régions
              </h3>
            </div>
            <span className="text-[11px] text-[#64748B]">
              Survolez ou cliquez sur une région pour inspecter
            </span>
          </div>

          {/* Rendu SVG du Burkina Faso */}
          <div className="w-full flex items-center justify-center p-2 bg-[#F8FCFC] rounded-xl border border-[#D6E8E8] relative">
            <svg
              viewBox="80 20 670 470"
              className="w-full h-auto max-h-[460px] drop-shadow-sm select-none"
            >
              {REGIONS_GEOMETRY.map((geo) => {
                const ind = indicateurs.find((i) => i.regionId === geo.id);
                const val = ind ? ind[selectedMetric] : 0;
                const isSelected = selectedRegionId === geo.id;
                const isHovered = hoveredRegionId === geo.id;
                const fillColor = getRegionFillColor(val);

                return (
                  <g
                    key={geo.id}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredRegionId(geo.id)}
                    onMouseLeave={() => setHoveredRegionId(null)}
                    onClick={() => setSelectedRegionId(geo.id)}
                  >
                    <path
                      d={geo.path}
                      fill={fillColor}
                      stroke={isSelected ? '#007599' : isHovered ? '#17343B' : '#FFFFFF'}
                      strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.5}
                      className="transition-colors duration-200"
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 4px 6px rgba(0, 117, 153, 0.35))'
                          : undefined,
                      }}
                    />

                    {/* Étiquette textuelle de la région */}
                    <text
                      x={geo.x}
                      y={geo.y}
                      textAnchor="middle"
                      className="text-[11px] font-bold fill-[#17343B] pointer-events-none select-none"
                      style={{
                        paintOrder: 'stroke',
                        stroke: '#FFFFFF',
                        strokeWidth: 3,
                        strokeLinejoin: 'round',
                      }}
                    >
                      {geo.name}
                    </text>

                    {/* Valeur chiffrée sur la carte */}
                    <text
                      x={geo.x}
                      y={geo.y + 14}
                      textAnchor="middle"
                      className="text-[10px] font-bold fill-[#005C75] pointer-events-none select-none"
                    >
                      {selectedMetric === 'tauxCouverture' ? `${val}%` : val.toLocaleString('fr-FR')}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Légende de gradient */}
            <div className="absolute bottom-3 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg border border-slate-200 text-[10px] text-[#475569] flex items-center gap-2">
              <span>Faible</span>
              <div
                className="w-20 h-2.5 rounded-full"
                style={{
                  background:
                    selectedMetric === 'casSuspicionElevee'
                      ? 'linear-gradient(90deg, #FDF2F6 0%, #E11D48 100%)'
                      : selectedMetric === 'aidesAttribuees'
                      ? 'linear-gradient(90deg, #FFF7ED 0%, #FF7900 100%)'
                      : 'linear-gradient(90deg, #EEF7F7 0%, #007599 100%)',
                }}
              />
              <span>Élevé (Max : {maxMetricValue.toLocaleString('fr-FR')})</span>
            </div>
          </div>

          {/* Rappel d'anonymat */}
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#007599] shrink-0" />
            <span>
              Conformité stricte : Données agrégées sans aucune information nominative.
            </span>
          </div>
        </div>

        {/* Colonne droite (1/3) : Inspecteur Régional Détaillé */}
        <div className="space-y-4">
          <div className="inpage-card border-2 border-[#007599]/30">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#D6E8E8]">
              <div>
                <span className="text-[11px] text-[#007599] font-bold uppercase tracking-wider block">
                  Région Sanitaire
                </span>
                <h3 className="text-base font-bold text-[#17343B]">
                  {activeRegion.regionNom}
                </h3>
                <span className="text-xs text-[#64748B]">
                  Chef-lieu : <strong>{activeRegion.chefLieu}</strong>
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  activeRegion.niveauRisque === 'eleve'
                    ? 'bg-rose-100 text-rose-800'
                    : activeRegion.niveauRisque === 'modere'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activeRegion.niveauRisque === 'eleve'
                  ? 'Priorité Haute'
                  : activeRegion.niveauRisque === 'modere'
                  ? 'Vigilance'
                  : 'Stable'}
              </span>
            </div>

            {/* Grille des indicateurs régionaux */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[#64748B] block text-[11px]">Sensibilisées</span>
                <strong className="text-sm font-bold text-[#17343B]">
                  {activeRegion.femmesSensibilisees.toLocaleString('fr-FR')}
                </strong>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[#64748B] block text-[11px]">Dépistées cliniques</span>
                <strong className="text-sm font-bold text-[#007599]">
                  {activeRegion.depistagesRealises.toLocaleString('fr-FR')}
                </strong>
              </div>

              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100">
                <span className="text-rose-700 block text-[11px] font-bold">Cas suspects</span>
                <strong className="text-sm font-bold text-rose-800">
                  {activeRegion.casSuspicionElevee}
                </strong>
              </div>

              <div className="p-2.5 bg-orange-50 rounded-lg border border-orange-100">
                <span className="text-[#C2410C] block text-[11px] font-bold">Aides allouées</span>
                <strong className="text-sm font-bold text-[#C2410C]">
                  {activeRegion.aidesAttribuees}
                </strong>
              </div>

              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-800 block text-[11px]">Examens faits</span>
                <strong className="text-sm font-bold text-emerald-800">
                  {activeRegion.examensRealises}
                </strong>
              </div>

              <div className="p-2.5 bg-[#EEF7F7] rounded-lg border border-[#B2DDDD]">
                <span className="text-[#005C75] block text-[11px]">Couverture</span>
                <strong className="text-sm font-bold text-[#005C75]">
                  {activeRegion.tauxCouverture}%
                </strong>
              </div>
            </div>

            {/* Recommandation sanitaire territoriale */}
            <div className="mt-3 p-3 bg-[#FFFDF9] rounded-lg border border-amber-200 text-xs text-[#17343B]">
              <strong className="block text-amber-900 mb-1">
                Recommandation de santé publique :
              </strong>
              {activeRegion.niveauRisque === 'eleve' ? (
                <span>
                  Forte concentration de cas suspects détectés. Déploiement urgent d'équipes de mammographie mobile et augmentation de la dotation solidaire Orange Money.
                </span>
              ) : activeRegion.niveauRisque === 'modere' ? (
                <span>
                  Intensifier les séances de palpation clinique dans les CSPS ruraux et sensibiliser les femmes de plus de 45 ans.
                </span>
              ) : (
                <span>
                  Maintenir les activités régulières de dépistage précoce et consolider le maillage d'orientation vers les centres d'imagerie.
                </span>
              )}
            </div>

            {/* Bouton de filtrage direct */}
            {onFilterByRegion && (
              <button
                type="button"
                onClick={() => onFilterByRegion(activeRegion.regionNom)}
                className="w-full mt-3 py-2 px-3 bg-[#007599] hover:bg-[#005C75] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Voir les dossiers d'aide ({activeRegion.demandesAideDeposees})</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}

            {/* Bouton de déploiement clinique mobile Orange */}
            {onDeployMobileClinic && (
              <button
                type="button"
                onClick={() => onDeployMobileClinic(activeRegion.regionNom)}
                className="w-full mt-2 py-2 px-3 bg-[#FF7900] hover:bg-[#E06A00] text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Truck className="w-4 h-4" />
                <span>Déployer Clinique Mobile Orange ({activeRegion.regionNom})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tableau comparatif exhaustif des 13 régions du Burkina Faso */}
      <div className="inpage-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#17343B]">
              Tableau Récapitulatif National des 13 Régions
            </h3>
            <p className="text-xs text-[#64748B]">
              Classement comparatif des indicateurs de dépistage et de solidarité financière.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Rechercher une région, chef-lieu..."
              value={searchTable}
              onChange={(e) => setSearchTable(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-[#CBD5E1] rounded-lg focus:outline-none focus:border-[#007599]"
            />
          </div>
        </div>

        <div className="aid-table-wrapper">
          <table className="aid-table">
            <thead>
              <tr>
                <th>Région Sanitaire</th>
                <th>Chef-lieu</th>
                <th>Sensibilisées</th>
                <th>Dépistages</th>
                <th>Cas Suspects</th>
                <th>Aides Orange Money</th>
                <th>Mammographies Faites</th>
                <th>Couverture</th>
                <th>Priorité</th>
              </tr>
            </thead>
            <tbody>
              {filteredIndicateurs.map((ind) => (
                <tr
                  key={ind.regionId}
                  className={selectedRegionId === ind.regionId ? 'table-row-urgent' : ''}
                  onClick={() => setSelectedRegionId(ind.regionId)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <strong className="text-xs text-[#17343B]">{ind.regionNom}</strong>
                  </td>
                  <td>
                    <span className="text-xs text-[#64748B]">{ind.chefLieu}</span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-[#17343B]">
                      {ind.femmesSensibilisees.toLocaleString('fr-FR')}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-semibold text-[#007599]">
                      {ind.depistagesRealises.toLocaleString('fr-FR')}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      {ind.casSuspicionElevee} cas
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-[#C2410C]">
                      {ind.aidesAttribuees} ({ind.demandesAideDeposees} déposées)
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-[#475569] font-medium">
                      {ind.examensRealises}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs font-bold text-emerald-800">
                      {ind.tauxCouverture}%
                    </span>
                  </td>
                  <td>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        ind.niveauRisque === 'eleve'
                          ? 'bg-rose-100 text-rose-800'
                          : ind.niveauRisque === 'modere'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ind.niveauRisque === 'eleve'
                        ? 'Haute'
                        : ind.niveauRisque === 'modere'
                        ? 'Vigilance'
                        : 'Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
