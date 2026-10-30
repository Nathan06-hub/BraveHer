package com.braveher.backend.service;

import com.braveher.backend.integration.orange.OrangeSmsGateway;
import com.braveher.backend.integration.whatsapp.WhatsAppGateway;
import com.braveher.backend.model.entity.Campagne;
import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.StatutSms;
import com.braveher.backend.repository.SmsLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class NotificationService {

    private final OrangeSmsGateway orangeSmsGateway;
    private final WhatsAppGateway whatsAppGateway;
    private final SmsLogRepository smsLogRepository;

    public NotificationService(OrangeSmsGateway orangeSmsGateway,
                               WhatsAppGateway whatsAppGateway,
                               SmsLogRepository smsLogRepository) {
        this.orangeSmsGateway = orangeSmsGateway;
        this.whatsAppGateway = whatsAppGateway;
        this.smsLogRepository = smsLogRepository;
    }

    @Transactional
    public SmsLog notifierPatiente(Patiente patiente, String message, String mediaUrl, Campagne campagne) {
        if (!patiente.estJoignable()) {
            log.warn("Patiente {} non joignable (pas de téléphone)", patiente.getCodeAnonyme());
            return null;
        }

        CanalNotification canal = patiente.canalNotification();
        String messageId;

        // Message adapté et traduit selon la langue
        String contenuAjuste = traduireOuAdapter(message, patiente);

        if (canal == CanalNotification.WHATSAPP) {
            // Média facultatif : aucun catalogue audio/vidéo n'est configuré dans ce prototype.
            String media = mediaUrl;
            messageId = whatsAppGateway.envoyerMessage(patiente.getTelephone(), contenuAjuste, media, patiente.getLangue());
        } else {
            // SMS Orange classique (texte court)
            messageId = orangeSmsGateway.envoyerSms(patiente.getTelephone(), contenuAjuste, patiente.getLangue());
        }

        SmsLog logEntry = new SmsLog();
        logEntry.setDestinataire(patiente.getTelephone());
        logEntry.setCanal(canal);
        logEntry.setLangue(patiente.getLangue());
        logEntry.setContenu(contenuAjuste);
        logEntry.setMediaUrl(canal == CanalNotification.WHATSAPP ? mediaUrl : null);
        logEntry.setStatut(StatutSms.SIMULE);
        logEntry.setMessageIdExterne(messageId);
        logEntry.setDateEnvoi(LocalDateTime.now());
        logEntry.setPatiente(patiente);
        logEntry.setCampagne(campagne);

        return smsLogRepository.save(logEntry);
    }

    private String traduireOuAdapter(String messageOriginal, Patiente patiente) {
        if (messageOriginal == null || messageOriginal.isBlank()) {
            return switch (patiente.getLangue()) {
                case MOORE -> "Ne y baasgo! Wa n gese f yĩnga la f biis CSPS pʋgẽ. Dépistage yaa zaalem.";
                case DIOULA -> "I ni sogoma! Na ka i fari lajɛ CSPS la. Dépistage bɛ kɛ gansan de.";
                case FULFULDE -> "Jam waali! Gar-ee to CSPS ngam ƴeewtindaare. Ko ɓe njoɓataa hay huunde.";
                case FRANCAIS -> "Dépistage gratuit du cancer du sein ce samedi au CSPS le plus proche. Prenez soin de vous !";
            };
        }
        return messageOriginal;
    }
}
