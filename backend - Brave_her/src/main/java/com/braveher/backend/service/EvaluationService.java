package com.braveher.backend.service;

import com.braveher.backend.dto.request.EvaluationRequest;
import com.braveher.backend.dto.request.IndicateursRequest;
import com.braveher.backend.dto.response.EvaluationResponse;
import com.braveher.backend.exception.ResourceNotFoundException;
import com.braveher.backend.model.entity.*;
import com.braveher.backend.model.enums.NiveauSuspicion;
import com.braveher.backend.model.enums.SourceSaisie;
import com.braveher.backend.repository.*;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.triage.TriageEngine;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class EvaluationService {

    private final EvaluationRepository evaluationRepository;
    private final PatienteRepository patienteRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final CentreSanteRepository centreRepository;
    private final CampagneRepository campagneRepository;
    private final DicteeVocaleRepository dicteeRepository;
    private final TriageEngine triageEngine;

    public EvaluationService(EvaluationRepository evaluationRepository,
                             PatienteRepository patienteRepository,
                             UtilisateurRepository utilisateurRepository,
                             CentreSanteRepository centreRepository,
                             CampagneRepository campagneRepository,
                             DicteeVocaleRepository dicteeRepository,
                             TriageEngine triageEngine) {
        this.evaluationRepository = evaluationRepository;
        this.patienteRepository = patienteRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.centreRepository = centreRepository;
        this.campagneRepository = campagneRepository;
        this.dicteeRepository = dicteeRepository;
        this.triageEngine = triageEngine;
    }

    @Transactional
    public EvaluationResponse creer(EvaluationRequest request, UtilisateurConnecte connecte) {
        UUID clientUuid = request.clientUuid() != null ? request.clientUuid() : UUID.randomUUID();

        // Idempotence : si l'évaluation avec ce clientUuid existe déjà, on la renvoie directement
        if (evaluationRepository.existsByClientUuid(clientUuid)) {
            log.info("Évaluation idempotente détectée pour clientUuid {}", clientUuid);
            return evaluationRepository.findAll().stream()
                    .filter(e -> clientUuid.equals(e.getClientUuid()))
                    .findFirst()
                    .map(EvaluationResponse::from)
                    .orElseThrow();
        }

        Patiente patiente = patienteRepository.findById(request.patienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Patiente", request.patienteId()));

        Utilisateur agent = utilisateurRepository.findById(connecte.id())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur", connecte.id()));

        CentreSante centre = agent.getCentre();
        if (centre == null && patiente.getCentre() != null) {
            centre = patiente.getCentre();
        }
        if (centre == null) {
            centre = centreRepository.findAll().stream().findFirst().orElse(null);
        }

        IndicateursCliniques ind = toEntity(request.indicateurs());

        // Calcul du score médical
        TriageEngine.ResultatTriage res = triageEngine.evaluer(ind, patiente.getAge());

        Evaluation e = new Evaluation();
        e.setClientUuid(clientUuid);
        e.setDateEvaluation(request.dateEvaluation() != null ? request.dateEvaluation() : LocalDateTime.now());
        e.setIndicateurs(ind);
        e.setScoreSuspicion(res.score());
        e.setNiveau(res.niveau());
        e.setRecommandation(res.recommandation());
        e.setObservations(request.observations());
        e.setSource(request.source() != null ? request.source() : SourceSaisie.FORMULAIRE);
        e.setLatitude(request.latitude());
        e.setLongitude(request.longitude());
        e.setPatiente(patiente);
        e.setAgent(agent);
        e.setCentre(centre);

        if (request.campagneId() != null) {
            campagneRepository.findById(request.campagneId()).ifPresent(e::setCampagne);
        }
        if (request.dicteeId() != null) {
            dicteeRepository.findById(request.dicteeId()).ifPresent(e::setDictee);
        }

        return EvaluationResponse.from(evaluationRepository.save(e));
    }

    @Transactional(readOnly = true)
    public Page<EvaluationResponse> lister(NiveauSuspicion niveau, UUID centreId, Pageable pageable) {
        if (niveau != null) {
            return evaluationRepository.findByNiveau(niveau, pageable).map(EvaluationResponse::from);
        }
        if (centreId != null) {
            return evaluationRepository.findByCentreId(centreId, pageable).map(EvaluationResponse::from);
        }
        return evaluationRepository.findAll(pageable).map(EvaluationResponse::from);
    }

    @Transactional(readOnly = true)
    public List<EvaluationResponse> parPatiente(UUID patienteId) {
        return evaluationRepository.findByPatienteIdOrderByDateEvaluationDesc(patienteId)
                .stream().map(EvaluationResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public EvaluationResponse obtenirParId(UUID id) {
        return evaluationRepository.findById(id)
                .map(EvaluationResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation", id));
    }

    public IndicateursCliniques toEntity(IndicateursRequest req) {
        IndicateursCliniques ind = new IndicateursCliniques();
        if (req != null) {
            ind.setAge40Plus(req.age40Plus());
            ind.setAntecedentsFamiliaux(req.antecedentsFamiliaux());
            ind.setNoduleSein(req.noduleSein());
            ind.setEcoulementMamelon(req.ecoulementMamelon());
            ind.setRetractionMamelon(req.retractionMamelon());
            ind.setPeauOrange(req.peauOrange());
            ind.setAdenopathieAxillaire(req.adenopathieAxillaire());
            ind.setModificationTailleForme(req.modificationTailleForme());
            ind.setDouleurPersistante(req.douleurPersistante());
        }
        return ind;
    }
}
