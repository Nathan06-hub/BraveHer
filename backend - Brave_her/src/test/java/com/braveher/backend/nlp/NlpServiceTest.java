package com.braveher.backend.nlp;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.braveher.backend.model.entity.IndicateursCliniques;

import static org.assertj.core.api.Assertions.assertThat;

class NlpServiceTest {

    private NlpService nlpService;

    @BeforeEach
    void setUp() {
        nlpService = new NlpService();
    }

    @Test
    @DisplayName("Extraction d'un cas suspect complet depuis une phrase de dictée")
    void extractionCasSuspect() {
        String dictee = "Patiente de 45 ans avec une boule au sein gauche, peau d'orange et ganglion sous l'aisselle.";

        IndicateursCliniques ind = nlpService.extraireIndicateurs(dictee);

        assertThat(ind.isNoduleSein()).isTrue();
        assertThat(ind.isPeauOrange()).isTrue();
        assertThat(ind.isAdenopathieAxillaire()).isTrue();
        assertThat(ind.isAge40Plus()).isTrue();
    }

    @Test
    @DisplayName("Extraction rétraction du mamelon et antécédents familiaux")
    void extractionRetractionEtFamille() {
        String dictee = "Rétraction visible du mamelon droit avec douleur persistante. Sa mère a eu un cancer du sein.";

        IndicateursCliniques ind = nlpService.extraireIndicateurs(dictee);

        assertThat(ind.isRetractionMamelon()).isTrue();
        assertThat(ind.isDouleurPersistante()).isTrue();
        assertThat(ind.isAntecedentsFamiliaux()).isTrue();
    }

    @Test
    @DisplayName("Ignorer les termes avec négations cliniques (aucun nodule, pas d'adénopathie)")
    void extractionAvecNegation() {
        String dictee = "Patiente de 25 ans. Examen bilatéral : aucun nodule, pas de peau d'orange, absence d'adénopathie axillaire.";

        IndicateursCliniques ind = nlpService.extraireIndicateurs(dictee);

        assertThat(ind.isNoduleSein()).isFalse();
        assertThat(ind.isPeauOrange()).isFalse();
        assertThat(ind.isAdenopathieAxillaire()).isFalse();
        assertThat(ind.isAge40Plus()).isFalse();
    }
}
