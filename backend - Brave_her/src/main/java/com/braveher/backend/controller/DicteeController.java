package com.braveher.backend.controller;

import com.braveher.backend.dto.response.DicteeResponse;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.service.DicteeService;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/dictees")
public class DicteeController {

    private final DicteeService dicteeService;

    public DicteeController(DicteeService dicteeService) {
        this.dicteeService = dicteeService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('AGENT_SANTE', 'SAGE_FEMME', 'ADMIN')")
    public DicteeResponse dicter(
            @RequestParam(value = "audio", required = false) MultipartFile audio,
            @AuthenticationPrincipal Jwt jwt
    ) {
        return dicteeService.traiterAudio(audio, UtilisateurConnecte.from(jwt));
    }
}
