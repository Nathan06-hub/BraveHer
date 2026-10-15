package com.braveher.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

import com.braveher.backend.model.enums.NiveauSuspicion;
import com.braveher.backend.model.enums.SourceSaisie;

@Entity
@Table(name = "evaluations",
        uniqueConstraints = @UniqueConstraint(name = "uk_evaluation_client_uuid", columnNames = "client_uuid"),
        indexes = {
                @Index(name = "idx_evaluation_niveau", columnList = "niveau"),
                @Index(name = "idx_evaluation_date", columnList = "date_evaluation")
        })
@Getter
@Setter
@NoArgsConstructor
public class Evaluation extends BaseEntity {

    /** UUID généré côté React (offline) : clé d'idempotence pour la synchronisation. */
    @Column(name = "client_uuid", nullable = false, updatable = false)
    private UUID clientUuid;

    @Column(name = "date_evaluation", nullable = false)
    private LocalDateTime dateEvaluation;

    @Embedded
    private IndicateursCliniques indicateurs = new IndicateursCliniques();

    @Column(nullable = false)
    private int scoreSuspicion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private NiveauSuspicion niveau;

    @Column(length = 500)
    private String recommandation;

    @Column(columnDefinition = "TEXT")
    private String observations;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SourceSaisie source = SourceSaisie.FORMULAIRE;

    private Double latitude;

    private Double longitude;

    /** Renseignée uniquement si l'évaluation a été saisie hors-ligne puis synchronisée. */
    private LocalDateTime dateSynchronisation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patiente_id", nullable = false)
    private Patiente patiente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agent_id", nullable = false)
    private Utilisateur agent;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centre_id", nullable = false)
    private CentreSante centre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campagne_id")
    private Campagne campagne;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dictee_id", unique = true)
    private DicteeVocale dictee;
}
