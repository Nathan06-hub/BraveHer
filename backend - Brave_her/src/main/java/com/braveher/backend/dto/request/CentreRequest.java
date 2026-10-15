package com.braveher.backend.dto.request;

import com.braveher.backend.model.enums.TypeCentre;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CentreRequest(
        @NotBlank(message = "Le nom du centre est obligatoire") String nom,
        @NotNull(message = "Le type de centre est obligatoire") TypeCentre type,
        @NotBlank(message = "La région est obligatoire") String region,
        String province,
        @NotBlank(message = "La commune est obligatoire") String commune,
        Double latitude,
        Double longitude
) {}
