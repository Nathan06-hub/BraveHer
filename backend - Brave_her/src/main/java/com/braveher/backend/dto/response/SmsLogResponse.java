package com.braveher.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.Langue;
import com.braveher.backend.model.enums.StatutSms;

public record SmsLogResponse(
        UUID id,
        String destinataire,
        CanalNotification canal,
        Langue langue,
        String contenu,
        String mediaUrl,
        StatutSms statut,
        String messageIdExterne,
        LocalDateTime dateEnvoi,
        UUID patienteId,
        String patienteNomComplet,
        UUID campagneId,
        String campagneTitre
) {
    public static SmsLogResponse from(SmsLog log) {
        return new SmsLogResponse(
                log.getId(),
                log.getDestinataire(),
                log.getCanal(),
                log.getLangue(),
                log.getContenu(),
                log.getMediaUrl(),
                log.getStatut(),
                log.getMessageIdExterne(),
                log.getDateEnvoi(),
                log.getPatiente() != null ? log.getPatiente().getId() : null,
                log.getPatiente() != null ? log.getPatiente().getPrenom() + " " + log.getPatiente().getNom() : null,
                log.getCampagne() != null ? log.getCampagne().getId() : null,
                log.getCampagne() != null ? log.getCampagne().getTitre() : null
        );
    }
}
