package com.braveher.backend.service;

import com.braveher.backend.dto.request.PatienteRequest;
import com.braveher.backend.dto.response.PatienteResponse;
import com.braveher.backend.exception.ResourceNotFoundException;
import com.braveher.backend.model.entity.CentreSante;
import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.repository.CentreSanteRepository;
import com.braveher.backend.repository.PatienteRepository;
import com.braveher.backend.security.UtilisateurConnecte;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PatienteService {

    private final PatienteRepository patienteRepository;
    private final CentreSanteRepository centreRepository;
    private final NotificationService notificationService;

    public PatienteService(PatienteRepository patienteRepository,
                           CentreSanteRepository centreRepository,
                           NotificationService notificationService) {
        this.patienteRepository = patienteRepository;
        this.centreRepository = centreRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Page<PatienteResponse> rechercher(String query, Pageable pageable, UtilisateurConnecte connecte) {
        UUID centreId = centreAutorise(connecte);
        if (centreId == null) {
            if (query == null || query.isBlank()) return patienteRepository.findAll(pageable).map(PatienteResponse::from);
            return patienteRepository.rechercher(query.trim(), pageable).map(PatienteResponse::from);
        }
        if (query == null || query.isBlank()) {
            return patienteRepository.findByCentreId(centreId, pageable).map(PatienteResponse::from);
        }
        return patienteRepository.rechercherParCentre(query.trim(), centreId, pageable).map(PatienteResponse::from);
    }

    @Transactional(readOnly = true)
    public PatienteResponse obtenirParId(UUID id, UtilisateurConnecte connecte) {
        UUID centreId = centreAutorise(connecte);
        return (centreId == null ? patienteRepository.findById(id) : patienteRepository.findByIdAndCentreId(id, centreId))
                .map(PatienteResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Patiente", id));
    }

    @Transactional(readOnly = true)
    public PatienteResponse obtenirParCode(String codeAnonyme) {
        return patienteRepository.findByCodeAnonyme(codeAnonyme.trim().toUpperCase())
                .map(PatienteResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Patiente", codeAnonyme));
    }

    @Transactional
    public PatienteResponse creer(PatienteRequest request, UtilisateurConnecte connecte) {
        Patiente p = new Patiente();
        if (request.id() != null) p.setId(request.id());
        remplir(p, request);
        UUID centreId = centreAutorise(connecte);
        if (centreId != null) p.setCentre(centreRepository.findById(centreId).orElseThrow());
        return PatienteResponse.from(patienteRepository.save(p));
    }

    @Transactional
    public PatienteResponse modifier(UUID id, PatienteRequest request, UtilisateurConnecte connecte) {
        UUID centreId = centreAutorise(connecte);
        Patiente p = (centreId == null ? patienteRepository.findById(id) : patienteRepository.findByIdAndCentreId(id, centreId))
                .orElseThrow(() -> new ResourceNotFoundException("Patiente", id));
        remplir(p, request);
        if (centreId != null) p.setCentre(centreRepository.findById(centreId).orElseThrow());
        return PatienteResponse.from(patienteRepository.save(p));
    }

    @Transactional
    public SmsLog notifier(UUID id, String message, String mediaUrl, UtilisateurConnecte connecte) {
        UUID centreId = centreAutorise(connecte);
        Patiente p = (centreId == null ? patienteRepository.findById(id) : patienteRepository.findByIdAndCentreId(id, centreId))
                .orElseThrow(() -> new ResourceNotFoundException("Patiente", id));
        return notificationService.notifierPatiente(p, message, mediaUrl, null);
    }

    private void remplir(Patiente p, PatienteRequest request) {
        p.setNom(request.nom());
        p.setPrenom(request.prenom());
        p.setAge(request.age());
        p.setTelephone(request.telephone());
        p.setUtiliseWhatsApp(request.utiliseWhatsApp());
        p.setLangue(request.langue());
        p.setCommune(request.commune());
        p.setRegion(request.region());
        p.setVulnerable(request.vulnerable());
        p.setDeplaceeInterne(request.deplaceeInterne());

        if (request.centreId() != null) {
            CentreSante centre = centreRepository.findById(request.centreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Centre", request.centreId()));
            p.setCentre(centre);
        }
    }

    /** null means a national administrator; clinical users are confined to their assigned centre. */
    private UUID centreAutorise(UtilisateurConnecte connecte) {
        if ("ADMIN".equals(connecte.role())) return null;
        if (connecte.centreId() == null) throw new AccessDeniedException("Aucun centre de santé n'est associé à ce compte");
        return connecte.centreId();
    }
}
