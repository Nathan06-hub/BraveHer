package com.braveher.backend.controller;

import com.braveher.backend.dto.response.SmsLogResponse;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.repository.SmsLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sms")
@Transactional(readOnly = true)
public class NotificationLogController {

    private final SmsLogRepository smsLogRepository;

    public NotificationLogController(SmsLogRepository smsLogRepository) {
        this.smsLogRepository = smsLogRepository;
    }

    @GetMapping("/logs")
    @PreAuthorize("hasAnyRole('ADMIN', 'SAGE_FEMME', 'AGENT_SANTE', 'MINISTERE')")
    public Page<SmsLogResponse> listerLogs(
            @RequestParam(required = false) CanalNotification canal,
            Pageable pageable
    ) {
        if (canal != null) {
            return smsLogRepository.findByCanal(canal, pageable).map(SmsLogResponse::from);
        }
        return smsLogRepository.findAll(pageable).map(SmsLogResponse::from);
    }

    /**
     * Endpoint dédié pour la simulation : l'écran React « Téléphone de la patiente »
     * interroge les messages reçus pour son numéro.
     */
    @GetMapping("/logs/destinataire")
    @PreAuthorize("hasAnyRole('ADMIN', 'SAGE_FEMME', 'AGENT_SANTE', 'MINISTERE')")
    public List<SmsLogResponse> logsParDestinataire(@RequestParam String telephone) {
        return smsLogRepository.findByDestinataireOrderByDateEnvoiDesc(telephone.trim())
                .stream().map(SmsLogResponse::from).toList();
    }
}
