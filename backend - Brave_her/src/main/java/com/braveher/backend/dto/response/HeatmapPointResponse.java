package com.braveher.backend.dto.response;

public record HeatmapPointResponse(
        String commune,
        String region,
        Double latitude,
        Double longitude,
        long totalEvaluations,
        long casEleves,
        long casModeres,
        long casFaibles,
        double tauxSuspicionElevee
) {}
