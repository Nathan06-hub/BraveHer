package com.braveher.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.braveher.backend.model.enums.StatutBon;

/** Bon santé financé par un fonds de parrainage, payé via Orange Money au centre. */
@Entity
@Table(name = "bons_sante", indexes = @Index(name = "idx_bon_statut", columnList = "statut"))
@Getter
@Setter
@NoArgsConstructor
public class BonSante extends BaseEntity {

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    /** FCFA (XOF). */
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private StatutBon statut = StatutBon.EMIS;

    @Column(length = 100)
    private String transactionOrangeMoney;

    @Column(nullable = false)
    private LocalDateTime dateEmission;

    private LocalDateTime dateUtilisation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patiente_id", nullable = false)
    private Patiente patiente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "fonds_id", nullable = false)
    private FondsParrainage fonds;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id")
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "centre_id", nullable = false)
    private CentreSante centre;
}
