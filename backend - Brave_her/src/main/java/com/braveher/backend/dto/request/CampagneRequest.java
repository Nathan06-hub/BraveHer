package com.braveher.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

import com.braveher.backend.model.enums.Langue;

public record CampagneRequest(
        @NotBlank(message = "Le titre est obligatoire") String titre,
        String message,
        @NotBlank(message = "La région est obligatoire") String region,
        String commune,
        Langue langueCible,
        @NotNull(message = "La date de début est obligatoire") LocalDate dateDebut,
        @NotNull(message = "La date de fin est obligatoire") LocalDate dateFin,
        UUID centreId
) {}
