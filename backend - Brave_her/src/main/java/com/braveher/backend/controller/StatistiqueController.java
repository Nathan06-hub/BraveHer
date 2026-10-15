package com.braveher.backend.controller;

import com.braveher.backend.dto.response.DashboardStatsResponse;
import com.braveher.backend.dto.response.HeatmapPointResponse;
import com.braveher.backend.service.StatistiqueService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    public StatistiqueController(StatistiqueService statistiqueService) {
        this.statistiqueService = statistiqueService;
    }

    @GetMapping("/heatmap")
    @PreAuthorize("hasAnyRole('MINISTERE', 'ADMIN', 'SAGE_FEMME')")
    public List<HeatmapPointResponse> heatmap() {
        return statistiqueService.genererHeatmap();
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('MINISTERE', 'ADMIN', 'SAGE_FEMME')")
    public DashboardStatsResponse dashboard() {
        return statistiqueService.genererDashboard();
    }
}
