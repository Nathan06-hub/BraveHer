package com.braveher.backend.dto.response;

import java.util.UUID;

import com.braveher.backend.model.entity.Utilisateur;
import com.braveher.backend.model.enums.Role;

public record UtilisateurResponse(
        UUID id,
        String nom,
        String prenom,
        String telephone,
        String email,
        Role role,
        UUID centreId,
        String centreNom
) {
    public static UtilisateurResponse from(Utilisateur u) {
        return new UtilisateurResponse(
                u.getId(), u.getNom(), u.getPrenom(), u.getTelephone(), u.getEmail(), u.getRole(),
                u.getCentre() != null ? u.getCentre().getId() : null,
                u.getCentre() != null ? u.getCentre().getNom() : null
        );
    }
}
