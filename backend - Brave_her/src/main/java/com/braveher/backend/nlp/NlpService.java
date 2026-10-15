package com.braveher.backend.nlp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.braveher.backend.model.entity.IndicateursCliniques;

import java.util.Locale;

@Slf4j
@Service
public class NlpService {

    /**
     * Analyse un texte transcrit (médical / dictée) et en extrait automatiquement les signes cliniques.
     */
    public IndicateursCliniques extraireIndicateurs(String texte) {
        IndicateursCliniques ind = new IndicateursCliniques();
        if (texte == null || texte.isBlank()) {
            return ind;
        }

        String lower = texte.toLowerCase(Locale.FRENCH);

        // Nodule / masse / boule
        if (lower.contains("nodule") || lower.contains("masse") || lower.contains("boule")
                || lower.contains("tuméfaction") || lower.contains("induration")) {
            ind.setNoduleSein(true);
        }

        // Rétraction mamelonnaire
        if (lower.contains("rétraction") || lower.contains("retraction") || lower.contains("ombilication")
                || lower.contains("mamelon rentré") || lower.contains("mamelon inversé")) {
            ind.setRetractionMamelon(true);
        }

        // Peau d'orange
        if (lower.contains("peau d'orange") || lower.contains("peau d’orange") || lower.contains("capiton")
                || lower.contains("œdème cutané") || lower.contains("oedeme cutane")) {
            ind.setPeauOrange(true);
        }

        // Écoulement mamelonnaire
        if (lower.contains("écoulement") || lower.contains("ecoulement") || lower.contains("saignement")
                || lower.contains("sécrétion") || lower.contains("liquide du mamelon")) {
            ind.setEcoulementMamelon(true);
        }

        // Adénopathie axillaire (ganglion sous l'aisselle)
        if (lower.contains("adénopathie") || lower.contains("adenopathie") || lower.contains("ganglion")
                || lower.contains("aisselle") || lower.contains("axillaire")) {
            ind.setAdenopathieAxillaire(true);
        }

        // Modification taille ou forme
        if (lower.contains("asymétrie") || lower.contains("asymetrie") || lower.contains("déformation")
                || lower.contains("changement de taille") || lower.contains("modification de taille")) {
            ind.setModificationTailleForme(true);
        }

        // Antécédents familiaux
        if (lower.contains("antécédent") || lower.contains("antecedent") || lower.contains("mère")
                || lower.contains("soeur") || lower.contains("tante") || lower.contains("famille")) {
            ind.setAntecedentsFamiliaux(true);
        }

        // Âge mentionné >= 40 ans
        if (lower.contains("quarante") || lower.contains("cinquante") || lower.contains("soixante")
                || lower.matches(".*\\b(4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9])\\s*(ans|an)?\\b.*")) {
            ind.setAge40Plus(true);
        }

        // Douleur persistante
        if (lower.contains("douleur") || lower.contains("douloureux") || lower.contains("douloureuse")
                || lower.contains("mastodynie")) {
            ind.setDouleurPersistante(true);
        }

        log.debug("NLP extraction sur texte: '{}' -> nodule={}, peauOrange={}, adenopathie={}",
                texte, ind.isNoduleSein(), ind.isPeauOrange(), ind.isAdenopathieAxillaire());

        return ind;
    }
}
