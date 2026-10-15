package com.braveher.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record BonSanteRequest(
        @NotNull(message = "L'ID de la patiente est obligatoire") UUID patienteId,
        UUID evaluationId,
        UUID fondsId,
        UUID centreId,
        @NotNull(message = "Le montant est obligatoire")
        @DecimalMin(value = "1000.0", message = "Le montant minimum est de 1000 FCFA")
        BigDecimal montant
) {}
