package com.braveher.backend.integration.orange;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SimulatedOrangeSpeechGateway implements OrangeSpeechGateway {

    @Override
    public String transcrireAudio(byte[] audioBytes, String contentType) {
        log.info("[SIMULATION ORANGE SPEECH] Traitement audio (taille: {} octets, format: {})",
                audioBytes != null ? audioBytes.length : 0, contentType);

        // Transcription réaliste pour la démo clinique
        return "Patiente de quarante-cinq ans venue pour consultation. Palpation révèle un nodule indolore " +
                "au quadrant supéro-externe du sein gauche avec une légère rétraction du mamelon et aspect peau d'orange. " +
                "Présence d'une adénopathie axillaire palpable. Antécédents de cancer chez la tante maternelle.";
    }
}
