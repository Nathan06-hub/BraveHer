package com.braveher.backend.controller;

import com.braveher.backend.dto.request.CentreRequest;
import com.braveher.backend.dto.response.CentreResponse;
import com.braveher.backend.service.CentreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/centres")
public class CentreController {

    private final CentreService centreService;

    public CentreController(CentreService centreService) {
        this.centreService = centreService;
    }

    @GetMapping
    public List<CentreResponse> lister() {
        return centreService.listerTous();
    }

    @GetMapping("/{id}")
    public CentreResponse detail(@PathVariable UUID id) {
        return centreService.obtenirParId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public CentreResponse creer(@Valid @RequestBody CentreRequest request) {
        return centreService.creer(request);
    }
}
