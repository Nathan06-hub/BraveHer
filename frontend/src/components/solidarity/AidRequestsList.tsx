import React, { useState, useMemo } from 'react';
import type { DemandeAide, StatutAide, NiveauPriorite } from '../../types/solidarity';
import type { CurrentUserContext } from '../../types/campaign';
import { AidStatusBadge, PriorityBadge } from './AidStatusBadge';
import {
  Search,
  X,
  CreditCard,
  CheckCircle,
  FileText,
  Building,
  User,
  Filter,
} from 'lucide-react';

interface AidRequestsListProps {
  demandes: DemandeAide[];
  currentUser: CurrentUserContext;
  onViewDetail: (demande: DemandeAide) => void;
  onValidate: (demande: DemandeAide) => void;
  onPayOrangeMoney: (demande: DemandeAide) => void;
}

export const AidRequestsList: React.FC<AidRequestsListProps> = ({
  demandes,
  currentUser,
  onViewDetail,
  onValidate,
  onPayOrangeMoney,
}) => {
  const [search, setSearch] = useState('');
  const [selectedStatut, setSelectedStatut] = useState<StatutAide | 'tous'>('tous');
  const [selectedPriorite, setSelectedPriorite] = useState<NiveauPriorite | 'tous'>('tous');

  // Filtrage
  const filteredDemandes = useMemo(() => {
    return demandes.filter((d) => {
      if (selectedStatut !== 'tous' && d.statut !== selectedStatut) return false;
      if (selectedPriorite !== 'tous' && d.niveauPriorite !== selectedPriorite) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = `${d.patientePrenom} ${d.patienteNom}`.toLowerCase().includes(q);
        const matchCode = d.codeDossier.toLowerCase().includes(q);
        const matchCentre = d.centreDemandeurNom.toLowerCase().includes(q);
        const matchCommune = d.commune.toLowerCase().includes(q);
        const matchTel = d.patienteTelephone.includes(q);

        if (!matchName && !matchCode && !matchCentre && !matchCommune && !matchTel) {
          return false;
        }
      }

      return true;
    });
  }, [demandes, selectedStatut, selectedPriorite, search]);

  const canValidate = currentUser.role === 'responsable' || currentUser.role === 'admin';

  return (
    <div className="aid-requests-section">
      {/* Barre de recherche et filtres */}
      <div className="filters-main-row mb-4">
        <div className="filter-search-wrapper">
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            className="filter-search-input"
            placeholder="Rechercher par patiente, N° dossier, téléphone, commune..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearch('')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filtre Priorité */}
        <div className="filter-select-wrapper">
          <Filter className="select-icon w-4 h-4 text-[#007599]" />
          <select
            className="filter-select"
            value={selectedPriorite}
            onChange={(e) => setSelectedPriorite(e.target.value as NiveauPriorite | 'tous')}
            aria-label="Filtrer par niveau de priorité"
          >
            <option value="tous">Toutes les priorités</option>
            <option value="urgent">Urgent</option>
            <option value="eleve">Élevé</option>
            <option value="standard">Standard</option>
          </select>
        </div>

        {/* Filtre Statut */}
        <div className="filter-select-wrapper">
          <select
            className="filter-select pl-3"
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value as StatutAide | 'tous')}
            aria-label="Filtrer par statut"
          >
            <option value="tous">Tous les statuts ({demandes.length})</option>
            <option value="a_examiner">À examiner</option>
            <option value="en_attente_decision">En attente de décision</option>
            <option value="approuvee">Approuvée</option>
            <option value="aide_attribuee">Aide attribuée (Orange Money)</option>
            <option value="examen_realise">Mammographie effectuée</option>
            <option value="refusee">Non retenue</option>
          </select>
        </div>
      </div>

      {/* Tableau des demandes */}
      {filteredDemandes.length > 0 ? (
        <div className="beneficiaries-table-wrapper">
          <table className="beneficiaries-table">
            <thead>
              <tr>
                <th>Dossier</th>
                <th>Bénéficiaire</th>
                <th>Centre Demandeur & Radiologie</th>
                <th>Priorité</th>
                <th>Montant Mammographie</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDemandes.map((d) => (
                <tr key={d.id}>
                  {/* N° Dossier & Date */}
                  <td>
                    <strong className="block text-[#007599] font-mono font-bold text-xs">
                      {d.codeDossier}
                    </strong>
                    <span className="text-[11px] text-[#536B70]">
                      {d.dateDemande}
                    </span>
                  </td>

                  {/* Patiente */}
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#F0F9F8] border border-[#D6E8E8] text-[#007599] font-bold flex items-center justify-center text-xs shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="block text-[#17343B]">
                          {d.patientePrenom} {d.patienteNom}
                        </strong>
                        <span className="text-[11px] text-[#536B70] block">
                          {d.patienteAge} ans · {d.commune} ({d.patienteLangue})
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Centres */}
                  <td>
                    <div className="max-w-[240px]">
                      <span className="block text-xs text-[#17343B] font-semibold truncate">
                        {d.centreDemandeurNom}
                      </span>
                      <span className="text-[11px] text-[#007599] flex items-center gap-1 truncate mt-0.5">
                        <Building className="w-3 h-3 shrink-0" />
                        <span className="truncate">{d.centreImagerieNom.split('—')[0]}</span>
                      </span>
                    </div>
                  </td>

                  {/* Priorité */}
                  <td>
                    <PriorityBadge priorite={d.niveauPriorite} />
                  </td>

                  {/* Coût FCFA */}
                  <td>
                    <div>
                      <strong className="block text-xs font-bold text-[#17343B]">
                        {d.coutEstime.toLocaleString('fr-FR')} FCFA
                      </strong>
                      {d.montantAccorde > 0 && d.statut !== 'refusee' && (
                        <span className="text-[11px] text-emerald-700 font-medium">
                          Accordé : {d.montantAccorde.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Statut */}
                  <td>
                    <AidStatusBadge statut={d.statut} size="sm" />
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Si statut approuvee : CTA Débloquer Orange Money */}
                      {d.statut === 'approuvee' && canValidate && (
                        <button
                          type="button"
                          className="btn-om-action"
                          onClick={() => onPayOrangeMoney(d)}
                          title="Simuler le déblocage Orange Money"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Orange Money</span>
                        </button>
                      )}

                      {/* Si en attente : CTA Examiner pour le responsable */}
                      {(d.statut === 'a_examiner' || d.statut === 'en_attente_decision') && canValidate && (
                        <button
                          type="button"
                          className="btn-card-action btn-validate text-xs py-1 px-2.5"
                          onClick={() => onValidate(d)}
                          title="Instruire et valider l'aide"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Instruire</span>
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-card-action btn-secondary text-xs py-1 px-2.5"
                        onClick={() => onViewDetail(d)}
                        title="Consulter le dossier complet"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Fiche</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#F8FAFB] rounded-xl border border-dashed border-[#D6E8E8]">
          <FileText className="w-10 h-10 text-[#536B70] mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-[#17343B]">Aucune demande d'aide correspondante</h4>
          <p className="text-xs text-[#536B70] mt-1">
            Modifiez vos filtres ou effectuez une nouvelle recherche pour afficher les dossiers.
          </p>
        </div>
      )}
    </div>
  );
};
