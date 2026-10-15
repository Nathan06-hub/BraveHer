package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.braveher.backend.model.entity.Utilisateur;

import java.util.Optional;
import java.util.UUID;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, UUID> {

    /** Connexion par email OU téléphone (agents terrain sans email). */
    @EntityGraph(attributePaths = "centre")
    @Query("select u from Utilisateur u where lower(u.email) = lower(:identifiant) or u.telephone = :identifiant")
    Optional<Utilisateur> findByIdentifiant(@Param("identifiant") String identifiant);

    boolean existsByTelephone(String telephone);

    boolean existsByEmailIgnoreCase(String email);
}
