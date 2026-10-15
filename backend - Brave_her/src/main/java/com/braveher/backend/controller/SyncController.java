package com.braveher.backend.controller;

import com.braveher.backend.dto.request.SyncRequest;
import com.braveher.backend.dto.response.SyncResponse;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.service.SyncService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sync")
public class SyncController {

    private final SyncService syncService;

    public SyncController(SyncService syncService) {
        this.syncService = syncService;
    }

    @PostMapping("/evaluations")
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public SyncResponse synchroniser(
            @Valid @RequestBody SyncRequest request,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return syncService.synchroniser(request, UtilisateurConnecte.from(jwt));
    }
}
