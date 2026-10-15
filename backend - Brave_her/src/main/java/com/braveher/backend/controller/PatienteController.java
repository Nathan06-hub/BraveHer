package com.braveher.backend.controller;

import com.braveher.backend.dto.request.PatienteRequest;
import com.braveher.backend.dto.response.PatienteResponse;
import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.service.PatienteService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/patientes")
public class PatienteController {

    private final PatienteService patienteService;

    public PatienteController(PatienteService patienteService) {
        this.patienteService = patienteService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public Page<PatienteResponse> rechercher(
            @RequestParam(required = false) String q,
            Pageable pageable
    ) {
        return patienteService.rechercher(q, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public PatienteResponse detail(@PathVariable UUID id) {
        return patienteService.obtenirParId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public PatienteResponse creer(@Valid @RequestBody PatienteRequest request) {
        return patienteService.creer(request);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public PatienteResponse modifier(@PathVariable UUID id, @Valid @RequestBody PatienteRequest request) {
        return patienteService.modifier(id, request);
    }

    @PostMapping("/{id}/notifications")
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public Map<String, Object> notifier(
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body
    ) {
        String msg = body != null ? body.get("message") : null;
        String media = body != null ? body.get("mediaUrl") : null;
        SmsLog log = patienteService.notifier(id, msg, media);
        return Map.of(
                "success", log != null,
                "canal", log != null ? log.getCanal().name() : "NON_JOIGNABLE",
                "messageId", log != null ? log.getMessageIdExterne() : "",
                "statut", log != null ? log.getStatut().name() : ""
        );
    }
}
