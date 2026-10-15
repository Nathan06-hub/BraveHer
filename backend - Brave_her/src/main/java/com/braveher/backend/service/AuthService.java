package com.braveher.backend.service;

import com.braveher.backend.dto.request.LoginRequest;
import com.braveher.backend.dto.response.LoginResponse;
import com.braveher.backend.dto.response.UtilisateurResponse;
import com.braveher.backend.exception.ResourceNotFoundException;
import com.braveher.backend.model.entity.Utilisateur;
import com.braveher.backend.repository.UtilisateurRepository;
import com.braveher.backend.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager,
                       UtilisateurRepository utilisateurRepository,
                       JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.utilisateurRepository = utilisateurRepository;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String identifiant = request.identifiant().trim();
        // Lève BadCredentialsException / DisabledException -> 401 via GlobalExceptionHandler
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(identifiant, request.motDePasse()));

        Utilisateur utilisateur = utilisateurRepository.findByIdentifiant(identifiant)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", identifiant));
        JwtService.JetonEmis jeton = jwtService.generer(utilisateur);
        log.info("Connexion réussie : {} ({})", utilisateur.nomComplet(), utilisateur.getRole());
        return new LoginResponse(jeton.token(), jeton.expiresInSeconds(), UtilisateurResponse.from(utilisateur));
    }

    @Transactional(readOnly = true)
    public UtilisateurResponse profil(UUID utilisateurId) {
        return utilisateurRepository.findById(utilisateurId)
                .map(UtilisateurResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", utilisateurId));
    }
}
