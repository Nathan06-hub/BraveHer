package com.braveher.backend.service;

import com.braveher.backend.dto.request.BonSanteRequest;
import com.braveher.backend.dto.response.BonSanteResponse;
import com.braveher.backend.exception.BusinessException;
import com.braveher.backend.exception.ResourceNotFoundException;
import com.braveher.backend.integration.orange.OrangeMoneyGateway;
import com.braveher.backend.model.entity.*;
import com.braveher.backend.model.enums.StatutBon;
import com.braveher.backend.repository.*;
import com.braveher.backend.security.UtilisateurConnecte;
import org.springframework.security.access.AccessDeniedException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class BonSanteService {

    private static final String CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final BonSanteRepository bonSanteRepository;
    private final PatienteRepository patienteRepository;
    private final FondsParrainageRepository fondsRepository;
    private final CentreSanteRepository centreRepository;
    private final EvaluationRepository evaluationRepository;
    private final OrangeMoneyGateway orangeMoneyGateway;

    public BonSanteService(BonSanteRepository bonSanteRepository,
                           PatienteRepository patienteRepository,
                           FondsParrainageRepository fondsRepository,
                           CentreSanteRepository centreRepository,
                           EvaluationRepository evaluationRepository,
                           OrangeMoneyGateway orangeMoneyGateway) {
        this.bonSanteRepository = bonSanteRepository;
        this.patienteRepository = patienteRepository;
        this.fondsRepository = fondsRepository;
        this.centreRepository = centreRepository;
        this.evaluationRepository = evaluationRepository;
        this.orangeMoneyGateway = orangeMoneyGateway;
    }

    @Transactional
    public BonSanteResponse emettreBon(BonSanteRequest req, UtilisateurConnecte connecte) {
        Patiente patiente = patienteRepository.findById(req.patienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Patiente", req.patienteId()));
        UUID centreAutorise = centreAutorise(connecte);
        if (centreAutorise != null && !patienteRepository.existsByIdAndCentreId(req.patienteId(), centreAutorise)) {
            throw new AccessDeniedException("Cette patiente n'appartient pas à votre centre de santé");
        }

        // Choix du fonds : fonds spécifié ou premier fonds actif disposant d'assez de solde
        FondsParrainage fonds;
        if (req.fondsId() != null) {
            fonds = fondsRepository.findById(req.fondsId())
                    .orElseThrow(() -> new ResourceNotFoundException("Fonds de parrainage", req.fondsId()));
        } else {
            fonds = fondsRepository.findAll().stream()
                    .filter(f -> f.getSoldeActuel().compareTo(req.montant()) >= 0)
                    .findFirst()
                    .orElseThrow(() -> new BusinessException("Aucun fonds de parrainage avec un solde suffisant pour " + req.montant() + " FCFA"));
        }

        // Débit avec contrôle de concurrence optimiste
        fonds.debiter(req.montant());
        fondsRepository.save(fonds);

        CentreSante centre = centreAutorise != null
                ? centreRepository.findById(centreAutorise).orElseThrow()
                : req.centreId() != null
                ? centreRepository.findById(req.centreId()).orElse(patiente.getCentre())
                : (patiente.getCentre() != null ? patiente.getCentre() : centreRepository.findAll().stream().findFirst().orElse(null));

        BonSante bon = new BonSante();
        bon.setCode(genererCodeUnique());
        bon.setMontant(req.montant());
        bon.setStatut(StatutBon.EMIS);
        bon.setDateEmission(LocalDateTime.now());
        bon.setPatiente(patiente);
        bon.setFonds(fonds);
        bon.setCentre(centre);

        if (req.evaluationId() != null) {
            evaluationRepository.findById(req.evaluationId()).ifPresent(bon::setEvaluation);
        }

        BonSante saved = bonSanteRepository.save(bon);
        log.info("Bon santé émis : {} ({} XOF, patiente {}, fonds {})",
                saved.getCode(), saved.getMontant(), patiente.getCodeAnonyme(), fonds.getNom());

        return BonSanteResponse.from(saved);
    }

    @Transactional
    public BonSanteResponse utiliserBon(String code, UtilisateurConnecte connecte) {
        BonSante bon = bonSanteRepository.findByCode(code.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Bon de santé", code));

        if (bon.getStatut() != StatutBon.EMIS) {
            throw new BusinessException("Le bon de santé " + code + " n'est plus valide (statut: " + bon.getStatut() + ")");
        }
        UUID centreAutorise = centreAutorise(connecte);
        if (centreAutorise != null && !centreAutorise.equals(bon.getCentre().getId())) {
            throw new AccessDeniedException("Ce bon n'est pas rattaché à votre centre de santé");
        }

        String compteMarchand = bon.getCentre().getCompteMarchandPaiement();
        if (compteMarchand == null || compteMarchand.isBlank()) {
            throw new BusinessException("Aucun compte marchand n'est configuré pour le centre destinataire");
        }

        // Le tiers-payant est versé au centre lors de la validation du bon, jamais à la patiente.
        String transaction = orangeMoneyGateway.initierPaiement(
                compteMarchand, bon.getMontant(), "BON-" + bon.getCode());
        bon.setTransactionOrangeMoney(transaction);

        bon.setStatut(StatutBon.UTILISE);
        bon.setDateUtilisation(LocalDateTime.now());

        log.info("Bon santé consommé : {}", bon.getCode());
        return BonSanteResponse.from(bonSanteRepository.save(bon));
    }

    @Transactional(readOnly = true)
    public List<BonSanteResponse> listerTous(UtilisateurConnecte connecte) {
        UUID centreId = centreAutorise(connecte);
        var bons = centreId == null ? bonSanteRepository.findAll() : bonSanteRepository.findByCentreId(centreId);
        return bons.stream().map(BonSanteResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<BonSanteResponse> parPatiente(UUID patienteId, UtilisateurConnecte connecte) {
        UUID centreId = centreAutorise(connecte);
        if (centreId != null && !patienteRepository.existsByIdAndCentreId(patienteId, centreId)) {
            throw new ResourceNotFoundException("Patiente", patienteId);
        }
        var bons = centreId == null ? bonSanteRepository.findByPatienteId(patienteId)
                : bonSanteRepository.findByPatienteIdAndCentreId(patienteId, centreId);
        return bons.stream().map(BonSanteResponse::from).toList();
    }

    private UUID centreAutorise(UtilisateurConnecte connecte) {
        if ("ADMIN".equals(connecte.role()) || "MINISTERE".equals(connecte.role())) return null;
        if (connecte.centreId() == null) throw new AccessDeniedException("Aucun centre de santé n'est associé à ce compte");
        return connecte.centreId();
    }

    private String genererCodeUnique() {
        String code;
        do {
            StringBuilder sb = new StringBuilder("BON-");
            for (int i = 0; i < 6; i++) {
                sb.append(CODE_ALPHABET.charAt(RANDOM.nextInt(CODE_ALPHABET.length())));
            }
            code = sb.toString();
        } while (bonSanteRepository.existsByCode(code));
        return code;
    }
}
