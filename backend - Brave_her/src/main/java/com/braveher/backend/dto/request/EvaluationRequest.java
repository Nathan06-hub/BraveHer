package com.braveher.backend.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

import com.braveher.backend.model.enums.SourceSaisie;

public record EvaluationRequest(
        /** UUID généré par le client React (hors-ligne ou direct) pour l'idempotence. */
        UUID clientUuid,
        @NotNull(message = "L'ID de la patiente est obligatoire") UUID patienteId,
        LocalDateTime dateEvaluation,
        IndicateursRequest indicateurs,
        String observations,
        SourceSaisie source,
        Double latitude,
        Double longitude,
        UUID campagneId,
        UUID dicteeId
) {}
