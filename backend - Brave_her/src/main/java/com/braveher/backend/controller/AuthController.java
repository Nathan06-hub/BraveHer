package com.braveher.backend.controller;

import com.braveher.backend.dto.request.LoginRequest;
import com.braveher.backend.dto.response.LoginResponse;
import com.braveher.backend.dto.response.UtilisateurResponse;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Profil de l'utilisateur connecté (React l'appelle au démarrage si un token est stocké). */
    @GetMapping("/me")
    public UtilisateurResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.profil(UtilisateurConnecte.from(jwt).id());
    }
}
