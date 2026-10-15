package com.braveher.backend.dto.response;

import java.math.BigDecimal;

public record DashboardStatsResponse(
        long totalPatientes,
        long totalEvaluations,
        long totalCasEleves,
        long totalCasModeres,
        long totalCasFaibles,
        long totalBonsEmis,
        long totalBonsUtilises,
        long totalSmsEnvoyes,
        long totalWhatsAppEnvoyes,
        BigDecimal totalFondsDisponiblesXof
) {}
