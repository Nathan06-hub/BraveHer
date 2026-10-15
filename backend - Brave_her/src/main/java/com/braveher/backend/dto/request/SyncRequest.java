package com.braveher.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SyncRequest(
        @NotEmpty(message = "Le lot d'évaluations ne peut pas être vide")
        List<@Valid EvaluationRequest> evaluations
) {}
