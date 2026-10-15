package com.braveher.backend.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.security.SecureRandom;

import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.Langue;

@Entity
@Table(name = "patientes", indexes = {
        @Index(name = "idx_patiente_commune_langue", columnList = "commune, langue"),
        @Index(name = "idx_patiente_region", columnList = "region")
})
@Getter
@Setter
@NoArgsConstructor
public class Patiente extends BaseEntity {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /** Code pseudonyme utilisé dans les statistiques (jamais le nom). Ex : BFK-7K3QX9 */
    @Column(nullable = false, unique = true, length = 12, updatable = false)
    private String codeAnonyme;

    @Column(nullable = false, length = 80)
    private String nom;

    @Column(nullable = false, length = 80)
    private String prenom;

    private Integer age;

    /** Format international, ex : +22670123456 */
    @Column(length = 20)
    private String telephone;

    /**
     * Saisi par l'agent de santé / la sage-femme au CSPS :
     * « La patiente utilise-t-elle WhatsApp ? [Oui] [Non] ».
     */
    @Column(nullable = false)
    private boolean utiliseWhatsApp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Langue langue = Langue.FRANCAIS;

    @Column(nullable = false, length = 80)
    private String commune;

    @Column(nullable = false, length = 80)
    private String region;

    @Column(nullable = false)
    private boolean vulnerable;

    @Column(nullable = false)
    private boolean deplaceeInterne;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id")
    private CentreSante centre;

    /** Canal de notification déduit du profil : WhatsApp si smartphone, sinon SMS Orange. */
    public CanalNotification canalNotification() {
        return utiliseWhatsApp ? CanalNotification.WHATSAPP : CanalNotification.SMS;
    }

    public boolean estJoignable() {
        return telephone != null && !telephone.isBlank();
    }

    @PrePersist
    void genererCodeAnonyme() {
        if (codeAnonyme == null) {
            StringBuilder sb = new StringBuilder("BFK-");
            for (int i = 0; i < 6; i++) {
                sb.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
            }
            codeAnonyme = sb.toString();
        }
    }
}
