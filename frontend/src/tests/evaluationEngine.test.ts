import { describe, it, expect } from 'vitest';
import { calculerScoreEvaluation, type AutresIndicateursEvaluation } from '../types/evaluation';

describe('Moteur de Score Clinique IA - Barème Officiel 15 Points', () => {
  it('doit renvoyer un score de 0 point et Risque FAIBLE si aucun signe d\'alerte', () => {
    const res = calculerScoreEvaluation(false, false, {
      agePatiente: 28,
      douleurMammaire: false,
      modificationTailleForme: false,
      antecedentsFamiliaux: false,
    });

    expect(res.pointsObtenus).toBe(0);
    expect(res.pointsMax).toBe(15);
    expect(res.scoreIA).toBe(0);
    expect(res.niveauRisque).toBe('FAIBLE');
    expect(res.alerteBonSante).toBe(false);
    expect(res.conduiteATenir).toContain('auto-palpation');
    expect(res.detailsBareme).toHaveLength(8);
  });

  describe('Pondération individuelle des 8 critères officiels', () => {
    it('1. Nodule au sein seul doit valoir exactement +3 points', () => {
      const res = calculerScoreEvaluation(true, false, {
        agePatiente: 30,
        consistanceNodule: 'dur_adherent',
      });
      expect(res.pointsObtenus).toBe(3);
      const critere = res.detailsBareme.find(c => c.symptome === 'Nodule au sein');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(3);
    });

    it('2. Peau d\'orange ou rétraction seule doit valoir exactement +3 points', () => {
      const res = calculerScoreEvaluation(false, true, {
        agePatiente: 32,
      });
      expect(res.pointsObtenus).toBe(3);
      const critere = res.detailsBareme.find(c => c.symptome === 'Peau d’orange ou rétraction');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(3);
    });

    it('3. Écoulement mamelonnaire seul doit valoir exactement +2 points', () => {
      const res = calculerScoreEvaluation(false, false, {
        agePatiente: 25,
        ecoulementMamelonnaire: true,
        typeEcoulement: 'sanglant',
      });
      expect(res.pointsObtenus).toBe(2);
      const critere = res.detailsBareme.find(c => c.symptome === 'Écoulement mamelonnaire');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(2);
    });

    it('4. Adénopathie axillaire seule doit valoir exactement +2 points', () => {
      const res = calculerScoreEvaluation(false, false, {
        agePatiente: 35,
        adenopathieAxillaire: true,
      });
      expect(res.pointsObtenus).toBe(2);
      const critere = res.detailsBareme.find(c => c.symptome === 'Adénopathie axillaire');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(2);
    });

    it('5. Modification de taille ou forme (asymétrie) seule doit valoir exactement +2 points', () => {
      const res = calculerScoreEvaluation(false, false, {
        agePatiente: 30,
        modificationTailleForme: true,
      });
      expect(res.pointsObtenus).toBe(2);
      const critere = res.detailsBareme.find(c => c.symptome === 'Modification de taille/forme');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(2);
    });

    it('6. Antécédents familiaux seuls doivent valoir exactement +1 point', () => {
      const res = calculerScoreEvaluation(false, false, {
        agePatiente: 29,
        antecedentsFamiliaux: true,
      });
      expect(res.pointsObtenus).toBe(1);
      const critere = res.detailsBareme.find(c => c.symptome === 'Antécédents familiaux');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(1);
    });

    it('7. Âge >= 40 ans seul doit valoir exactement +1 point (et 0 si < 40)', () => {
      const resMoins40 = calculerScoreEvaluation(false, false, { agePatiente: 39 });
      expect(resMoins40.pointsObtenus).toBe(0);

      const res40 = calculerScoreEvaluation(false, false, { agePatiente: 40 });
      expect(res40.pointsObtenus).toBe(1);
      const critere40 = res40.detailsBareme.find(c => c.symptome === 'Âge >= 40 ans');
      expect(critere40?.detecte).toBe(true);
      expect(critere40?.poids).toBe(1);

      const res65 = calculerScoreEvaluation(false, false, { agePatiente: 65 });
      expect(res65.pointsObtenus).toBe(1);
    });

    it('8. Douleur persistante / mastodynie seule doit valoir exactement +1 point', () => {
      const res = calculerScoreEvaluation(false, false, {
        agePatiente: 28,
        douleurMammaire: true,
      });
      expect(res.pointsObtenus).toBe(1);
      const critere = res.detailsBareme.find(c => c.symptome === 'Douleur persistante');
      expect(critere?.detecte).toBe(true);
      expect(critere?.poids).toBe(1);
    });
  });

  describe('Cumul total et cas maximal (15 / 15 points)', () => {
    it('doit totaliser exactement 15 points et 100% quand tous les critères sont réunis', () => {
      const autres: AutresIndicateursEvaluation = {
        agePatiente: 52, // +1
        ecoulementMamelonnaire: true, // +2
        adenopathieAxillaire: true, // +2
        modificationTailleForme: true, // +2
        douleurMammaire: true, // +1
        antecedentsFamiliaux: true, // +1
        retractionCutanee: true, // fait partie de peau orange / rétraction
      };

      const res = calculerScoreEvaluation(
        true, // nodule: +3
        true, // peau orange: +3
        autres
      );

      expect(res.pointsObtenus).toBe(15);
      expect(res.pointsMax).toBe(15);
      expect(res.scoreIA).toBe(100);
      expect(res.niveauRisque).toBe('ELEVE');
      expect(res.alerteBonSante).toBe(true);
      expect(res.detailsBareme.every(c => c.detecte)).toBe(true);
    });
  });

  describe('Classification et seuils d\'orientation clinique', () => {
    it('doit classer en Risque MODÉRÉ pour 3 à 4 points', () => {
      // Ex: Nodule seul (+3) chez une patiente de 35 ans (<40 ans)
      const res3 = calculerScoreEvaluation(true, false, { agePatiente: 35 });
      expect(res3.pointsObtenus).toBe(3);
      expect(res3.niveauRisque).toBe('MODERE');
      expect(res3.conduiteATenir).toContain('15 à 30 jours');

      // Ex: Ecoulement (+2) + Asymétrie (+2) = 4 points
      const res4 = calculerScoreEvaluation(false, false, {
        agePatiente: 30,
        ecoulementMamelonnaire: true,
        modificationTailleForme: true,
      });
      expect(res4.pointsObtenus).toBe(4);
      expect(res4.niveauRisque).toBe('MODERE');
    });

    it('doit classer en Risque ÉLEVÉ dès 5 points', () => {
      // Ex: Nodule (+3) + Ganglion (+2) = 5 points
      const res5 = calculerScoreEvaluation(true, false, {
        agePatiente: 32,
        adenopathieAxillaire: true,
      });
      expect(res5.pointsObtenus).toBe(5);
      expect(res5.niveauRisque).toBe('ELEVE');
      expect(res5.scoreIA).toBeGreaterThanOrEqual(70);
      expect(res5.alerteBonSante).toBe(true);
      expect(res5.conduiteATenir).toContain('Mammographie');
    });

    it('doit déclencher Risque ÉLEVÉ d\'urgence si Nodule + Peau d\'orange même à 6 points', () => {
      const res = calculerScoreEvaluation(true, true, { agePatiente: 25 });
      // 3 + 3 = 6 points
      expect(res.pointsObtenus).toBe(6);
      expect(res.niveauRisque).toBe('ELEVE');
      expect(res.alerteBonSante).toBe(true);
    });
  });
});
