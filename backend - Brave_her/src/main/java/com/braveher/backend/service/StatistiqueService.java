package com.braveher.backend.service;

import com.braveher.backend.dto.response.DashboardStatsResponse;
import com.braveher.backend.dto.response.HeatmapPointResponse;
import com.braveher.backend.model.entity.CentreSante;
import com.braveher.backend.model.entity.Evaluation;
import com.braveher.backend.model.entity.FondsParrainage;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.NiveauSuspicion;
import com.braveher.backend.model.enums.StatutBon;
import com.braveher.backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StatistiqueService {

    private final EvaluationRepository evaluationRepository;
    private final PatienteRepository patienteRepository;
    private final BonSanteRepository bonSanteRepository;
    private final SmsLogRepository smsLogRepository;
    private final FondsParrainageRepository fondsRepository;
    private final CentreSanteRepository centreRepository;

    public StatistiqueService(EvaluationRepository evaluationRepository,
                              PatienteRepository patienteRepository,
                              BonSanteRepository bonSanteRepository,
                              SmsLogRepository smsLogRepository,
                              FondsParrainageRepository fondsRepository,
                              CentreSanteRepository centreRepository) {
        this.evaluationRepository = evaluationRepository;
        this.patienteRepository = patienteRepository;
        this.bonSanteRepository = bonSanteRepository;
        this.smsLogRepository = smsLogRepository;
        this.fondsRepository = fondsRepository;
        this.centreRepository = centreRepository;
    }

    @Transactional(readOnly = true)
    public List<HeatmapPointResponse> genererHeatmap() {
        List<Evaluation> evals = evaluationRepository.findAll();

        // Regroupement par commune (données strictement anonymisées)
        Map<String, List<Evaluation>> parCommune = evals.stream()
                .filter(e -> e.getCentre() != null && e.getCentre().getCommune() != null)
                .collect(Collectors.groupingBy(e -> e.getCentre().getCommune()));

        // S'il n'y a pas encore d'évaluations par commune, on inclut les centres de santé avec compte à zéro pour la carte
        Map<String, CentreSante> centresParCommune = centreRepository.findAll().stream()
                .filter(c -> c.getCommune() != null && c.getLatitude() != null && c.getLongitude() != null)
                .collect(Collectors.toMap(CentreSante::getCommune, c -> c, (c1, c2) -> c1));

        List<HeatmapPointResponse> points = new ArrayList<>();

        for (Map.Entry<String, CentreSante> entry : centresParCommune.entrySet()) {
            String commune = entry.getKey();
            CentreSante c = entry.getValue();
            List<Evaluation> liste = parCommune.getOrDefault(commune, Collections.emptyList());

            long total = liste.size();
            long eleves = liste.stream().filter(e -> e.getNiveau() == NiveauSuspicion.ELEVE).count();
            long moderes = liste.stream().filter(e -> e.getNiveau() == NiveauSuspicion.MODERE).count();
            long faibles = liste.stream().filter(e -> e.getNiveau() == NiveauSuspicion.FAIBLE).count();
            double taux = total > 0 ? (double) eleves / total * 100.0 : 0.0;

            points.add(new HeatmapPointResponse(
                    commune,
                    c.getRegion(),
                    c.getLatitude(),
                    c.getLongitude(),
                    total,
                    eleves,
                    moderes,
                    faibles,
                    Math.round(taux * 10.0) / 10.0
            ));
        }

        return points;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse genererDashboard() {
        long totalPatientes = patienteRepository.count();
        long totalEvaluations = evaluationRepository.count();

        List<Evaluation> evals = evaluationRepository.findAll();
        long eleves = evals.stream().filter(e -> e.getNiveau() == NiveauSuspicion.ELEVE).count();
        long moderes = evals.stream().filter(e -> e.getNiveau() == NiveauSuspicion.MODERE).count();
        long faibles = evals.stream().filter(e -> e.getNiveau() == NiveauSuspicion.FAIBLE).count();

        long bonsEmis = bonSanteRepository.count();
        long bonsUtilises = bonSanteRepository.countByStatut(StatutBon.UTILISE);

        long sms = smsLogRepository.findAll().stream().filter(l -> l.getCanal() == CanalNotification.SMS).count();
        long wa = smsLogRepository.findAll().stream().filter(l -> l.getCanal() == CanalNotification.WHATSAPP).count();

        BigDecimal fondsRestants = fondsRepository.findAll().stream()
                .map(FondsParrainage::getSoldeActuel)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DashboardStatsResponse(
                totalPatientes,
                totalEvaluations,
                eleves,
                moderes,
                faibles,
                bonsEmis,
                bonsUtilises,
                sms,
                wa,
                fondsRestants
        );
    }
}
