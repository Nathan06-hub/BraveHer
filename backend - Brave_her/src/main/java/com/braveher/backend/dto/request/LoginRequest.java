package com.braveher.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

/** identifiant = email ou numéro de téléphone (+226...). */
public record LoginRequest(
        @NotBlank(message = "L'identifiant est obligatoire") String identifiant,
        @NotBlank(message = "Le mot de passe est obligatoire") String motDePasse
) {
}
