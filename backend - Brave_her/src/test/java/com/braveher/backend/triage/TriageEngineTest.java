package com.braveher.backend.triage;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import com.braveher.backend.model.entity.IndicateursCliniques;
import com.braveher.backend.model.enums.NiveauSuspicion;

import static org.assertj.core.api.Assertions.assertThat;

class TriageEngineTest {

    private TriageEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TriageEngine();
    }

    @Test
    @DisplayName("Examen normal sans signe -> score 0, FAIBLE")
    void normalExamReturnsFaible() {
        IndicateursCliniques ind = new IndicateursCliniques();
        TriageEngine.ResultatTriage res = engine.evaluer(ind, 28);

        assertThat(res.score()).isEqualTo(0);
        assertThat(res.niveau()).isEqualTo(NiveauSuspicion.FAIBLE);
    }

    @Test
    @DisplayName("Nodule seul chez patiente < 40 ans -> score 3, MODERE")
    void noduleSeulReturnsModere() {
        IndicateursCliniques ind = new IndicateursCliniques();
        ind.setNoduleSein(true);

        TriageEngine.ResultatTriage res = engine.evaluer(ind, 32);

        assertThat(res.score()).isEqualTo(3);
        assertThat(res.niveau()).isEqualTo(NiveauSuspicion.MODERE);
    }

    @Test
    @DisplayName("Alerte majeure : Nodule + Peau d'orange -> ELEVE d'office")
    void nodulePlusPeauOrangeTriggersEleveDirect() {
        IndicateursCliniques ind = new IndicateursCliniques();
        ind.setNoduleSein(true);
        ind.setPeauOrange(true);

        TriageEngine.ResultatTriage res = engine.evaluer(ind, 45);

        assertThat(res.score()).isGreaterThanOrEqualTo(6);
        assertThat(res.niveau()).isEqualTo(NiveauSuspicion.ELEVE);
        assertThat(res.recommandation()).contains("Suspicion ÉLEVÉE");
    }

    @Test
    @DisplayName("Signes multiples : nodule + adenopathie + age >= 40 -> score >= 6, ELEVE")
    void multipleSignsReturnsEleve() {
        IndicateursCliniques ind = new IndicateursCliniques();
        ind.setNoduleSein(true); // +3
        ind.setAdenopathieAxillaire(true); // +2
        ind.setAntecedentsFamiliaux(true); // +1
        // age 48 -> +1

        TriageEngine.ResultatTriage res = engine.evaluer(ind, 48);

        assertThat(res.score()).isEqualTo(7);
        assertThat(res.niveau()).isEqualTo(NiveauSuspicion.ELEVE);
    }
}
