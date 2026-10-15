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
            return new ResultatTriage(0, NiveauSuspicion.FAIBLE, "Examen sans anomalie signalée. Sensibilisation à l'auto-palpation.");
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

        // Règle d'alerte immédiate : nodule + rétraction ou peau d'orange
        boolean alerteMajeure = indicateurs.isNoduleSein() && (indicateurs.isPeauOrange() || indicateurs.isRetractionMamelon());

        NiveauSuspicion niveau;
        String recommandation;

        if (alerteMajeure || score >= 6) {
            niveau = NiveauSuspicion.ELEVE;
            recommandation = "Suspicion ÉLEVÉE : Référence urgente vers un CMA ou CHU pour mammographie, échographie et biopsie. Éligible bon de prise en charge.";
        } else if (score >= 3) {
            niveau = NiveauSuspicion.MODERE;
            recommandation = "Suspicion MODÉRÉE : Consultation médicale de contrôle au CSPS/CMA sous 15 jours. Examen clinique sénologique approfondi.";
        } else {
            niveau = NiveauSuspicion.FAIBLE;
            recommandation = "Risque FAIBLE : Sensibilisation à l'auto-palpation mensuelle et contrôle annuel de routine.";
        }

        return new ResultatTriage(score, niveau, recommandation);
    }
}
