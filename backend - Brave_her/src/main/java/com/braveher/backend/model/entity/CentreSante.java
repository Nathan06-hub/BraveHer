package com.braveher.backend.model.entity;

import com.braveher.backend.model.enums.TypeCentre;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "centres_sante", indexes = {
        @Index(name = "idx_centre_region", columnList = "region"),
        @Index(name = "idx_centre_commune", columnList = "commune")
})
@Getter
@Setter
@NoArgsConstructor
public class CentreSante extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TypeCentre type;

    @Column(nullable = false, length = 80)
    private String region;

    @Column(length = 80)
    private String province;

    @Column(nullable = false, length = 80)
    private String commune;

    private Double latitude;

    private Double longitude;

    /** Compte marchand recevant le tiers-payant; jamais le téléphone personnel de la patiente. */
    @Column(name = "compte_marchand_paiement", length = 40)
    private String compteMarchandPaiement;
}
