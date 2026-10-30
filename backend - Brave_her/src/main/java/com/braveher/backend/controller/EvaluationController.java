package com.braveher.backend.controller;

import com.braveher.backend.dto.request.EvaluationRequest;
import com.braveher.backend.dto.response.EvaluationResponse;
import com.braveher.backend.model.enums.NiveauSuspicion;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.service.EvaluationService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    public EvaluationController(EvaluationService evaluationService) {
        this.evaluationService = evaluationService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public EvaluationResponse creer(
            @Valid @RequestBody EvaluationRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return evaluationService.creer(request, UtilisateurConnecte.from(jwt));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public Page<EvaluationResponse> lister(
            @RequestParam(required = false) NiveauSuspicion niveau,
            @RequestParam(required = false) UUID centreId,
            Pageable pageable,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return evaluationService.lister(niveau, centreId, pageable, UtilisateurConnecte.from(jwt));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public EvaluationResponse detail(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        return evaluationService.obtenirParId(id, UtilisateurConnecte.from(jwt));
    }

    @GetMapping("/patiente/{patienteId}")
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public List<EvaluationResponse> parPatiente(@PathVariable UUID patienteId, @AuthenticationPrincipal Jwt jwt) {
        return evaluationService.parPatiente(patienteId, UtilisateurConnecte.from(jwt));
    }
}
