package com.braveher.backend.nlp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import com.braveher.backend.model.entity.IndicateursCliniques;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class NlpService {

    private static final Pattern NEGATION_PATTERN = Pattern.compile(
            "\\b(pas\\s+de|pas\\s+d'|aucun|aucune|sans|absence\\s+de|absence\\s+d'|ni|non|ne\\s+présente\\s+pas\\s+de|ne\\s+presente\\s+pas\\s+de|n'observe\\s+pas\\s+de|ras)\\b.{0,25}$",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Analyse un texte transcrit (médical / dictée) et en extrait automatiquement les signes cliniques,
     * en éliminant les faux positifs dus aux formulations négatives ("aucun nodule", "pas de rétraction", etc.).
     */
    public IndicateursCliniques extraireIndicateurs(String texte) {
        IndicateursCliniques ind = new IndicateursCliniques();
        if (texte == null || texte.isBlank()) {
            return ind;
        }

        String lower = texte.toLowerCase(Locale.FRENCH);

        // Nodule / masse / boule
        if (estAffirme(lower, "nodule", "masse", "boule", "tuméfaction", "tumefaction", "induration")) {
            ind.setNoduleSein(true);
        }

        // Rétraction mamelonnaire
        if (estAffirme(lower, "rétraction", "retraction", "ombilication", "mamelon rentré", "mamelon rentre", "mamelon inversé", "mamelon inverse")) {
            ind.setRetractionMamelon(true);
        }

        // Peau d'orange
        if (estAffirme(lower, "peau d'orange", "peau d’orange", "capiton", "œdème cutané", "oedeme cutane")) {
            ind.setPeauOrange(true);
        }

        // Écoulement mamelonnaire
        if (estAffirme(lower, "écoulement", "ecoulement", "saignement", "sécrétion", "secretion", "liquide du mamelon")) {
            ind.setEcoulementMamelon(true);
        }

        // Adénopathie axillaire (ganglion sous l'aisselle)
        if (estAffirme(lower, "adénopathie", "adenopathie", "ganglion", "aisselle", "axillaire")) {
            ind.setAdenopathieAxillaire(true);
        }

        // Modification taille ou forme
        if (estAffirme(lower, "asymétrie", "asymetrie", "déformation", "deformation", "changement de taille", "modification de taille")) {
            ind.setModificationTailleForme(true);
        }

        // Antécédents familiaux
        if (estAffirme(lower, "antécédent", "antecedent", "mère", "mere", "soeur", "tante", "famille")) {
            ind.setAntecedentsFamiliaux(true);
        }

        // Âge mentionné >= 40 ans
        if (lower.contains("quarante") || lower.contains("cinquante") || lower.contains("soixante")
                || lower.matches(".*\\b(4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9])\\s*(ans|an)?\\b.*")) {
            ind.setAge40Plus(true);
        }

        // Douleur persistante
        if (estAffirme(lower, "douleur", "douloureux", "douloureuse", "mastodynie")) {
            ind.setDouleurPersistante(true);
        }

        log.debug("NLP extraction sur texte: '{}' -> nodule={}, peauOrange={}, adenopathie={}",
                texte, ind.isNoduleSein(), ind.isPeauOrange(), ind.isAdenopathieAxillaire());

        return ind;
    }

    /**
     * Vérifie si l'un des termes cibles est mentionné de façon affirmative (non niée).
     */
    private boolean estAffirme(String texte, String... termes) {
        for (String terme : termes) {
            int index = 0;
            while ((index = texte.indexOf(terme, index)) != -1) {
                // Analyse de la fenêtre précédant le terme (jusqu'à 35 caractères)
                int debutFenetre = Math.max(0, index - 35);
                String prefixe = texte.substring(debutFenetre, index).trim();

                // Si le préfixe se termine par une négation directe, le terme est nié
                Matcher m = NEGATION_PATTERN.matcher(prefixe);
                if (!m.find()) {
                    return true; // Terme affirmé sans négation
                }
                index += terme.length();
            }
        }
        return false;
    }
}
