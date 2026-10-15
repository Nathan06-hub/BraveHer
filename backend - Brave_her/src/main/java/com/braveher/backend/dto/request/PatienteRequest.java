package com.braveher.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

import com.braveher.backend.model.enums.Langue;

public record PatienteRequest(
        @NotBlank(message = "Le nom est obligatoire") String nom,
        @NotBlank(message = "Le prénom est obligatoire") String prenom,
        Integer age,
        String telephone,
        /** Case cochée au CSPS : [Oui/Non] */
        boolean utiliseWhatsApp,
        @NotNull(message = "La langue est obligatoire") Langue langue,
        @NotBlank(message = "La commune est obligatoire") String commune,
        @NotBlank(message = "La région est obligatoire") String region,
        boolean vulnerable,
        boolean deplaceeInterne,
        UUID centreId
) {}
