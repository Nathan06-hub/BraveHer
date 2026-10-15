package com.braveher.backend.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Signes cliniques observés lors de l'examen des seins. */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
public class IndicateursCliniques {

    @Column(nullable = false)
    private boolean age40Plus;
    @Column(nullable = false)
    private boolean antecedentsFamiliaux;
    @Column(nullable = false)
    private boolean noduleSein;
    @Column(nullable = false)
    private boolean ecoulementMamelon;
    @Column(nullable = false)
    private boolean retractionMamelon;
    @Column(nullable = false)
    private boolean peauOrange;
    @Column(nullable = false)
    private boolean adenopathieAxillaire;
    @Column(nullable = false)
    private boolean modificationTailleForme;
    @Column(nullable = false)
    private boolean douleurPersistante;
}
