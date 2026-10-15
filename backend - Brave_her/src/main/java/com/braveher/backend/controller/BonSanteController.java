package com.braveher.backend.controller;

import com.braveher.backend.dto.request.BonSanteRequest;
import com.braveher.backend.dto.response.BonSanteResponse;
import com.braveher.backend.service.BonSanteService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/bons")
public class BonSanteController {

    private final BonSanteService bonSanteService;

    public BonSanteController(BonSanteService bonSanteService) {
        this.bonSanteService = bonSanteService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN', 'MINISTERE')")
    public List<BonSanteResponse> lister() {
        return bonSanteService.listerTous();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN')")
    public BonSanteResponse emettre(@Valid @RequestBody BonSanteRequest request) {
        return bonSanteService.emettreBon(request);
    }

    @PutMapping("/{code}/utiliser")
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN', 'AGENT_SANTE')")
    public BonSanteResponse utiliser(@PathVariable String code) {
        return bonSanteService.utiliserBon(code);
    }

    @GetMapping("/patiente/{patienteId}")
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN', 'AGENT_SANTE')")
    public List<BonSanteResponse> parPatiente(@PathVariable UUID patienteId) {
        return bonSanteService.parPatiente(patienteId);
    }
}
