package com.braveher.backend.security;

import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import com.braveher.backend.model.entity.Utilisateur;

import java.time.Instant;
import java.util.List;

/** Émission des jetons JWT (HS256) via l'encodeur natif Spring Security (Nimbus). */
@Service
public class JwtService {

    public static final String CLAIM_ROLES = "roles";
    public static final String CLAIM_USER_ID = "uid";
    public static final String CLAIM_CENTRE_ID = "centreId";
    public static final String CLAIM_NOM = "nom";

    private final JwtEncoder jwtEncoder;
    private final JwtProperties properties;

    public JwtService(JwtEncoder jwtEncoder, JwtProperties properties) {
        this.jwtEncoder = jwtEncoder;
        this.properties = properties;
    }

    public JetonEmis generer(Utilisateur utilisateur) {
        Instant maintenant = Instant.now();
        Instant expiration = maintenant.plus(properties.expiration());

        JwtClaimsSet.Builder claims = JwtClaimsSet.builder()
                .issuer(properties.issuer())
                .issuedAt(maintenant)
                .expiresAt(expiration)
                .subject(utilisateur.getTelephone())
                .claim(CLAIM_USER_ID, utilisateur.getId().toString())
                .claim(CLAIM_NOM, utilisateur.nomComplet())
                .claim(CLAIM_ROLES, List.of(utilisateur.getRole().name()));
        if (utilisateur.getCentre() != null) {
            claims.claim(CLAIM_CENTRE_ID, utilisateur.getCentre().getId().toString());
        }

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        String token = jwtEncoder.encode(JwtEncoderParameters.from(header, claims.build())).getTokenValue();
        return new JetonEmis(token, properties.expiration().toSeconds());
    }

    public record JetonEmis(String token, long expiresInSeconds) {
    }
}
