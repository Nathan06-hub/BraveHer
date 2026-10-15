package com.braveher.backend.service;

import com.braveher.backend.dto.request.EvaluationRequest;
import com.braveher.backend.dto.request.SyncRequest;
import com.braveher.backend.dto.response.SyncResponse;
import com.braveher.backend.model.entity.*;
import com.braveher.backend.model.enums.SourceSaisie;
import com.braveher.backend.repository.CentreSanteRepository;
import com.braveher.backend.repository.EvaluationRepository;
import com.braveher.backend.repository.PatienteRepository;
import com.braveher.backend.repository.UtilisateurRepository;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.triage.TriageEngine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class SyncService {

    private final EvaluationRepository evaluationRepository;
    private final PatienteRepository patienteRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CentreSanteRepository centreRepository;
    private final TriageEngine triageEngine;
    private final EvaluationService evaluationService;

    public SyncService(EvaluationRepository evaluationRepository,
                       PatienteRepository patienteRepository,
                       UtilisateurRepository utilisateurRepository,
                       CentreSanteRepository centreRepository,
                       TriageEngine triageEngine,
                       EvaluationService evaluationService) {
        this.evaluationRepository = evaluationRepository;
        this.patienteRepository = patienteRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.centreRepository = centreRepository;
        this.triageEngine = triageEngine;
        this.evaluationService = evaluationService;
    }

    @Transactional
    public SyncResponse synchroniser(SyncRequest request, UtilisateurConnecte connecte) {
        List<UUID> acceptees = new ArrayList<>();
        List<UUID> dupliquees = new ArrayList<>();
        List<String> erreurs = new ArrayList<>();

        Utilisateur agent = utilisateurRepository.findById(connecte.id()).orElse(null);

        for (EvaluationRequest evalReq : request.evaluations()) {
            UUID clientUuid = evalReq.clientUuid() != null ? evalReq.clientUuid() : UUID.randomUUID();

            try {
                // Idempotence : si déjà synchronisée par ce clientUuid, on l'enregistre comme dupliquée (succès idempotent)
                if (evaluationRepository.existsByClientUuid(clientUuid)) {
                    log.info("Évaluation hors-ligne déjà synchronisée (clientUuid: {})", clientUuid);
                    dupliquees.add(clientUuid);
                    continue;
                }

                Patiente patiente = patienteRepository.findById(evalReq.patienteId()).orElse(null);
                if (patiente == null) {
                    erreurs.add("Patiente introuvable pour clientUuid: " + clientUuid);
                    continue;
                }

                IndicateursCliniques ind = evaluationService.toEntity(evalReq.indicateurs());
                TriageEngine.ResultatTriage res = triageEngine.evaluer(ind, patiente.getAge());

                CentreSante centre = agent != null && agent.getCentre() != null
                        ? agent.getCentre()
                        : (patiente.getCentre() != null ? patiente.getCentre() : centreRepository.findAll().stream().findFirst().orElse(null));

                Evaluation e = new Evaluation();
                e.setClientUuid(clientUuid);
                e.setDateEvaluation(evalReq.dateEvaluation() != null ? evalReq.dateEvaluation() : LocalDateTime.now());
                e.setIndicateurs(ind);
                e.setScoreSuspicion(res.score());
                e.setNiveau(res.niveau());
                e.setRecommandation(res.recommandation());
                e.setObservations(evalReq.observations());
                e.setSource(SourceSaisie.SYNC_OFFLINE);
                e.setLatitude(evalReq.latitude());
                e.setLongitude(evalReq.longitude());
                e.setDateSynchronisation(LocalDateTime.now());
                e.setPatiente(patiente);
                e.setAgent(agent);
                e.setCentre(centre);

                evaluationRepository.save(e);
                acceptees.add(clientUuid);
            } catch (Exception ex) {
                log.error("Erreur lors de la synchronisation de l'évaluation {}", clientUuid, ex);
                erreurs.add("Erreur sur clientUuid " + clientUuid + " : " + ex.getMessage());
            }
        }

        log.info("Synchro terminée : {} reçues, {} acceptées, {} dupliquées, {} erreurs",
                request.evaluations().size(), acceptees.size(), dupliquees.size(), erreurs.size());

        return new SyncResponse(
                request.evaluations().size(),
                acceptees.size(),
                dupliquees.size(),
                erreurs.size(),
                acceptees,
                dupliquees,
                erreurs
        );
    }
}
