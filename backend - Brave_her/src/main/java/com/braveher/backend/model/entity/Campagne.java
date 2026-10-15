package com.braveher.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

import com.braveher.backend.model.enums.Langue;
import com.braveher.backend.model.enums.StatutCampagne;

@Entity
@Table(name = "campagnes")
@Getter
@Setter
@NoArgsConstructor
public class Campagne extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String titre;

    /** Message de sensibilisation (texte de base, traduit selon la langue de chaque patiente). */
    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false, length = 80)
    private String region;

    @Column(length = 80)
    private String commune;

    /** Null = toutes les langues. */
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Langue langueCible;

    @Column(nullable = false)
    private LocalDate dateDebut;

    @Column(nullable = false)
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 12)
    private StatutCampagne statut = StatutCampagne.PLANIFIEE;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "planifie_par_id", nullable = false)
    private Utilisateur planifiePar;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centre_id", nullable = false)
    private CentreSante centre;
}
