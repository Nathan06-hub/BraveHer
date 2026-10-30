package com.braveher.backend.triage;

import org.springframework.stereotype.Component;

import com.braveher.backend.model.entity.IndicateursCliniques;
import com.braveher.backend.model.enums.NiveauSuspicion;

@Component
public class TriageEngine {

    public record ResultatTriage(
            int score,
            NiveauSuspicion niveau,
            String recommandation
    ) {}

    public ResultatTriage evaluer(IndicateursCliniques indicateurs, Integer age) {
        if (indicateurs == null) {
            return new ResultatTriage(0, NiveauSuspicion.FAIBLE,
                    "Aucun indicateur renseigné. Cette aide au repérage ne constitue pas un diagnostic; faire interpréter les données par un professionnel de santé.");
        }

        int score = 0;

        if (indicateurs.isNoduleSein()) score += 3;
        if (indicateurs.isPeauOrange() || indicateurs.isRetractionMamelon()) score += 3;
        if (indicateurs.isEcoulementMamelon()) score += 2;
        if (indicateurs.isAdenopathieAxillaire()) score += 2;
        if (indicateurs.isModificationTailleForme()) score += 2;
        if (indicateurs.isAntecedentsFamiliaux()) score += 1;
        if (indicateurs.isAge40Plus() || (age != null && age >= 40)) score += 1;
        if (indicateurs.isDouleurPersistante()) score += 1;

        // Règle logicielle de priorisation; elle ne remplace pas un protocole validé ni l'avis clinique.
        boolean alerteMajeure = indicateurs.isNoduleSein() && (indicateurs.isPeauOrange() || indicateurs.isRetractionMamelon());

        NiveauSuspicion niveau;
        String recommandation;

        if (alerteMajeure || score >= 6) {
            niveau = NiveauSuspicion.ELEVE;
            recommandation = "Alerte de priorité élevée générée par une règle logicielle non validée. Évaluation clinique rapide par un professionnel selon le protocole national en vigueur; ce résultat n'est pas un diagnostic et ne déclenche pas automatiquement une aide financière.";
        } else if (score >= 3) {
            niveau = NiveauSuspicion.MODERE;
            recommandation = "Alerte de suivi générée par une règle logicielle non validée. Faire revoir les signes par un professionnel de santé selon le protocole national en vigueur; ce résultat n'est pas un diagnostic.";
        } else {
            niveau = NiveauSuspicion.FAIBLE;
            recommandation = "Peu d'indicateurs sélectionnés dans ce formulaire; cela n'exclut pas une maladie. Ce résultat n'est pas un diagnostic; toute inquiétude doit être évaluée par un professionnel de santé.";
        }

        return new ResultatTriage(score, niveau, recommandation);
    }
}
