package com.braveher.backend.integration.orange;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import com.braveher.backend.model.enums.Langue;

import java.util.UUID;

@Slf4j
@Component
public class SimulatedOrangeSmsGateway implements OrangeSmsGateway {

    @Override
    public String envoyerSms(String destinataire, String message, Langue langue) {
        String msgId = "ORA-SMS-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[SIMULATION ORANGE SMS] Id: {}, Destinataire: {}, Langue: {}, Contenu: \"{}\"",
                msgId, destinataire, langue, message);
        return msgId;
    }
}
