import { describe, it, expect } from 'vitest';
import { extraireIndicateursCliniques } from '../components/common/DicteeVocale';

describe('Extracteur NLP / Dictée Vocale Médicale', () => {
  it('doit extraire un nodule dur avec sa taille et son côté', () => {
    const text = "Palpation d'un nodule dur adhérent de 2.5 cm au niveau du sein droit.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.nodule).toBe(true);
    expect(detected.consistanceNodule).toBe('dur_adherent');
    expect(detected.tailleNoduleCm).toBe(2.5);
    expect(detected.seinConcerne).toBe('droit');
    expect(badges).toContain('Nodule dur/adhérent (+3 pts)');
    expect(badges).toContain('Sein droit');
  });

  it('doit extraire les signes cutanés : peau d\'orange et rétraction', () => {
    const text = "Présence d'un aspect en peau d'orange et d'une rétraction cutanée avec méplat.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.peauOrange).toBe(true);
    expect(detected.retractionCutanee).toBe(true);
    expect(badges).toContain('Peau d’orange (+3 pts)');
    expect(badges).toContain('Rétraction cutanée (+3 pts)');
  });

  it('doit extraire l\'écoulement mamelonnaire et son type sanglant', () => {
    const text = "Écoulement mamelonnaire spontané et sanglant au mamelon gauche.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.ecoulementMamelonnaire).toBe(true);
    expect(detected.typeEcoulement).toBe('sanglant');
    expect(detected.seinConcerne).toBe('gauche');
    expect(badges).toContain('Écoulement sanglant (+2 pts)');
    expect(badges).toContain('Sein gauche');
  });

  it('doit extraire l\'adénopathie axillaire', () => {
    const text = "Palpation d'un ganglion dur et indolore à l'aisselle gauche.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.adenopathieAxillaire).toBe(true);
    expect(badges).toContain('Adénopathie axillaire (+2 pts)');
  });

  it('doit extraire la modification de taille ou de forme (asymétrie)', () => {
    const text = "La patiente rapporte une asymétrie récente avec modification de forme du sein.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.modificationTailleForme).toBe(true);
    expect(badges).toContain('Modification taille/forme (+2 pts)');
  });

  it('doit extraire les antécédents familiaux', () => {
    const text = "Antécédent direct : la mère et la tante ont eu un cancer du sein.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.antecedentsFamiliaux).toBe(true);
    expect(badges).toContain('Antécédents familiaux (+1 pt)');
  });

  it('doit extraire la douleur persistante / mastodynie', () => {
    const text = "Patiente signalant une vive douleur mammaire permanente.";
    const { detected, badges } = extraireIndicateursCliniques(text);

    expect(detected.douleurMammaire).toBe(true);
    expect(badges).toContain('Douleur persistante (+1 pt)');
  });
});
