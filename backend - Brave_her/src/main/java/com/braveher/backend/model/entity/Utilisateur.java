package com.braveher.backend.model.entity;

import com.braveher.backend.model.enums.Role;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "utilisateurs")
@Getter
@Setter
@NoArgsConstructor
public class Utilisateur extends BaseEntity {

    @Column(nullable = false, length = 80)
    private String nom;

    @Column(nullable = false, length = 80)
    private String prenom;

    /** Identifiant de connexion alternatif (agents terrain sans email). */
    @Column(nullable = false, unique = true, length = 20)
    private String telephone;

    @Column(unique = true, length = 150)
    private String email;

    /** Hash BCrypt — jamais le mot de passe en clair. */
    @Column(nullable = false)
    private String motDePasse;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Column(nullable = false)
    private boolean actif = true;

    /** Null pour ADMIN / MINISTERE (niveau national). */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "centre_id")
    private CentreSante centre;

    public String nomComplet() {
        return prenom + " " + nom;
    }
}
