package com.braveher.backend.dto.response;

public record LoginResponse(
        String token,
        String type,
        long expiresIn,
        UtilisateurResponse utilisateur
) {
    public LoginResponse(String token, long expiresIn, UtilisateurResponse utilisateur) {
        this(token, "Bearer", expiresIn, utilisateur);
    }
}
