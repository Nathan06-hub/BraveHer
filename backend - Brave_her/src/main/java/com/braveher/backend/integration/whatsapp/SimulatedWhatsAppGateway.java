package com.braveher.backend.integration.whatsapp;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import com.braveher.backend.model.enums.Langue;

import java.util.UUID;

@Slf4j
@Component
public class SimulatedWhatsAppGateway implements WhatsAppGateway {

    @Override
    public String envoyerMessage(String destinataire, String message, String mediaUrl, Langue langue) {
        String msgId = "WA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[SIMULATION WHATSAPP] Id: {}, Destinataire: {}, Langue: {}, Media: {}, Contenu: \"{}\"",
                msgId, destinataire, langue, mediaUrl != null ? mediaUrl : "aucun", message);
        return msgId;
    }
}
