package com.braveher.backend.security;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Raccourci typé vers l'utilisateur connecté, injectable dans les contrôleurs :
 * {@code @AuthenticationPrincipal Jwt jwt} puis {@code UtilisateurConnecte.from(jwt)}.
 */
public record UtilisateurConnecte(UUID id, String nom, String role, UUID centreId) {

    public static UtilisateurConnecte from(Jwt jwt) {
        String centre = jwt.getClaimAsString(JwtService.CLAIM_CENTRE_ID);
        return new UtilisateurConnecte(
                UUID.fromString(jwt.getClaimAsString(JwtService.CLAIM_USER_ID)),
                jwt.getClaimAsString(JwtService.CLAIM_NOM),
                jwt.getClaimAsStringList(JwtService.CLAIM_ROLES).getFirst(),
                centre != null ? UUID.fromString(centre) : null
        );
    }
}
