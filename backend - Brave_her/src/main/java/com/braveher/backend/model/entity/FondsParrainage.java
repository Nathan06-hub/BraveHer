package com.braveher.backend.model.entity;

import com.braveher.backend.exception.BusinessException;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/** Fonds alimenté par un sponsor (ONG, entreprise, Orange...) pour financer les bons santé. */
@Entity
@Table(name = "fonds_parrainage")
@Getter
@Setter
@NoArgsConstructor
public class FondsParrainage extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(nullable = false, length = 150)
    private String sponsor;

    /** Montants en FCFA (XOF). */
    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal soldeInitial;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal soldeActuel;

    /** Verrou optimiste : empêche deux bons de débiter le même solde en parallèle. */
    @Version
    private Long version;

    public void debiter(BigDecimal montant) {
        if (montant == null || montant.signum() <= 0) {
            throw new BusinessException("Montant de débit invalide");
        }
        if (soldeActuel.compareTo(montant) < 0) {
            throw new BusinessException("Solde insuffisant sur le fonds « " + nom + " »");
        }
        soldeActuel = soldeActuel.subtract(montant);
    }
}
