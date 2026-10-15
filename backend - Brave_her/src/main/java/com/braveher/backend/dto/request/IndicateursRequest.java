package com.braveher.backend.dto.request;

public record IndicateursRequest(
        boolean age40Plus,
        boolean antecedentsFamiliaux,
        boolean noduleSein,
        boolean ecoulementMamelon,
        boolean retractionMamelon,
        boolean peauOrange,
        boolean adenopathieAxillaire,
        boolean modificationTailleForme,
        boolean douleurPersistante
) {}
