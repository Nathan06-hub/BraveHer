package com.braveher.backend.dto.response;

public record CampagneNotificationReport(
        int totalCibles,
        int totalEnvoyesSms,
        int totalEnvoyesWhatsApp,
        int totalEchecs
) {}
