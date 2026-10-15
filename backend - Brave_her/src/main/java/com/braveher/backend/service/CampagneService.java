package com.braveher.backend.service;

import com.braveher.backend.dto.request.CampagneRequest;
import com.braveher.backend.dto.response.CampagneNotificationReport;
import com.braveher.backend.dto.response.CampagneResponse;
import com.braveher.backend.exception.ResourceNotFoundException;
import com.braveher.backend.model.entity.*;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.StatutCampagne;
import com.braveher.backend.repository.CampagneRepository;
import com.braveher.backend.repository.CentreSanteRepository;
import com.braveher.backend.repository.PatienteRepository;
import com.braveher.backend.repository.UtilisateurRepository;
import com.braveher.backend.security.UtilisateurConnecte;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class CampagneService {

    private final CampagneRepository campagneRepository;
    private final PatienteRepository patienteRepository;
    private final CentreSanteRepository centreRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;

    public CampagneService(CampagneRepository campagneRepository,
                           PatienteRepository patienteRepository,
                           CentreSanteRepository centreRepository,
                           UtilisateurRepository utilisateurRepository,
                           NotificationService notificationService) {
        this.campagneRepository = campagneRepository;
        this.patienteRepository = patienteRepository;
        this.centreRepository = centreRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<CampagneResponse> listerToutes() {
        return campagneRepository.findAll().stream().map(CampagneResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CampagneResponse obtenirParId(UUID id) {
        return campagneRepository.findById(id)
                .map(CampagneResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Campagne", id));
    }

    @Transactional
    public CampagneResponse creer(CampagneRequest req, UtilisateurConnecte connecte) {
        Utilisateur auteur = utilisateurRepository.findById(connecte.id())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", connecte.id()));

        CentreSante centre = req.centreId() != null
                ? centreRepository.findById(req.centreId()).orElse(auteur.getCentre())
                : (auteur.getCentre() != null ? auteur.getCentre() : centreRepository.findAll().stream().findFirst().orElse(null));

        Campagne c = new Campagne();
        c.setTitre(req.titre());
        c.setMessage(req.message());
        c.setRegion(req.region());
        c.setCommune(req.commune());
        c.setLangueCible(req.langueCible());
        c.setDateDebut(req.dateDebut());
        c.setDateFin(req.dateFin());
        c.setStatut(StatutCampagne.EN_COURS);
        c.setPlanifiePar(auteur);
        c.setCentre(centre);

        return CampagneResponse.from(campagneRepository.save(c));
    }

    @Transactional
    public CampagneNotificationReport declencherNotifications(UUID campagneId) {
        Campagne campagne = campagneRepository.findById(campagneId)
                .orElseThrow(() -> new ResourceNotFoundException("Campagne", campagneId));

        List<Patiente> cibles = patienteRepository.findCiblesCampagne(
                campagne.getRegion(),
                campagne.getCommune(),
                campagne.getLangueCible()
        );

        int sms = 0;
        int wa = 0;
        int echecs = 0;

        for (Patiente p : cibles) {
            try {
                SmsLog entry = notificationService.notifierPatiente(p, campagne.getMessage(), null, campagne);
                if (entry != null) {
                    if (entry.getCanal() == CanalNotification.WHATSAPP) {
                        wa++;
                    } else {
                        sms++;
                    }
                } else {
                    echecs++;
                }
            } catch (Exception ex) {
                log.error("Erreur d'envoi notification à la patiente {}", p.getCodeAnonyme(), ex);
                echecs++;
            }
        }

        log.info("Campagne {} notifiée : {} cibles, {} SMS, {} WhatsApp, {} échecs",
                campagne.getTitre(), cibles.size(), sms, wa, echecs);

        return new CampagneNotificationReport(cibles.size(), sms, wa, echecs);
    }
}
