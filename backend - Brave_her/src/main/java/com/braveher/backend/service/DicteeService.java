package com.braveher.backend.service;

import com.braveher.backend.dto.response.DicteeResponse;
import com.braveher.backend.integration.orange.OrangeSpeechGateway;
import com.braveher.backend.model.entity.DicteeVocale;
import com.braveher.backend.model.entity.IndicateursCliniques;
import com.braveher.backend.model.entity.Utilisateur;
import com.braveher.backend.nlp.NlpService;
import com.braveher.backend.repository.DicteeVocaleRepository;
import com.braveher.backend.repository.UtilisateurRepository;
import com.braveher.backend.security.UtilisateurConnecte;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
public class DicteeService {

    private final OrangeSpeechGateway orangeSpeechGateway;
    private final NlpService nlpService;
    private final DicteeVocaleRepository dicteeRepository;
    private final UtilisateurRepository utilisateurRepository;

    public DicteeService(OrangeSpeechGateway orangeSpeechGateway,
                         NlpService nlpService,
                         DicteeVocaleRepository dicteeRepository,
                         UtilisateurRepository utilisateurRepository) {
        this.orangeSpeechGateway = orangeSpeechGateway;
        this.nlpService = nlpService;
        this.dicteeRepository = dicteeRepository;
        this.utilisateurRepository = utilisateurRepository;
    }

    @Transactional
    public DicteeResponse traiterAudio(MultipartFile fichierAudio, UtilisateurConnecte connecte) {
        byte[] bytes = new byte[0];
        String contentType = "audio/wav";
        if (fichierAudio != null && !fichierAudio.isEmpty()) {
            try {
                bytes = fichierAudio.getBytes();
                contentType = fichierAudio.getContentType() != null ? fichierAudio.getContentType() : contentType;
            } catch (IOException e) {
                log.warn("Impossible de lire les octets audio, utilisation du flux simulé", e);
            }
        }

        // 1. Transcription via la passerelle STT Orange (simulée pour démo)
        String transcription = orangeSpeechGateway.transcrireAudio(bytes, contentType);

        // 2. Extraction des entités cliniques via NLP
        IndicateursCliniques indicateurs = nlpService.extraireIndicateurs(transcription);

        // 3. Persistance
        DicteeVocale dictee = new DicteeVocale();
        dictee.setTranscription(transcription);
        dictee.setCheminAudio(fichierAudio != null ? fichierAudio.getOriginalFilename() : "audio_demo.wav");
        if (connecte != null) {
            Utilisateur auteur = utilisateurRepository.findById(connecte.id()).orElse(null);
            dictee.setAuteur(auteur);
        }

        DicteeVocale saved = dicteeRepository.save(dictee);
        return DicteeResponse.from(saved, indicateurs);
    }
}
