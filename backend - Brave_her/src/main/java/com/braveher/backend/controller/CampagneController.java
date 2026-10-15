package com.braveher.backend.controller;

import com.braveher.backend.dto.request.CampagneRequest;
import com.braveher.backend.dto.response.CampagneNotificationReport;
import com.braveher.backend.dto.response.CampagneResponse;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.service.CampagneService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/campagnes")
public class CampagneController {

    private final CampagneService campagneService;

    public CampagneController(CampagneService campagneService) {
        this.campagneService = campagneService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'AGENT_SANTE', 'ADMIN', 'MINISTERE')")
    public List<CampagneResponse> lister() {
        return campagneService.listerToutes();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'AGENT_SANTE', 'ADMIN', 'MINISTERE')")
    public CampagneResponse detail(@PathVariable UUID id) {
        return campagneService.obtenirParId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN')")
    public CampagneResponse creer(
            @Valid @RequestBody CampagneRequest req,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return campagneService.creer(req, UtilisateurConnecte.from(jwt));
    }

    @PostMapping("/{id}/notifications")
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN')")
    public CampagneNotificationReport notifier(@PathVariable UUID id) {
        return campagneService.declencherNotifications(id);
    }

    // Alias compatible avec les spécifications initiales
    @PostMapping("/{id}/sms")
    @PreAuthorize("hasAnyRole('SAGE_FEMME', 'ADMIN')")
    public CampagneNotificationReport notifierAlias(@PathVariable UUID id) {
        return campagneService.declencherNotifications(id);
    }
}
