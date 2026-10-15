package com.braveher.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import com.braveher.backend.model.entity.Evaluation;
import com.braveher.backend.model.entity.IndicateursCliniques;
import com.braveher.backend.model.enums.NiveauSuspicion;
import com.braveher.backend.model.enums.SourceSaisie;

public record EvaluationResponse(
        UUID id,
        UUID clientUuid,
        LocalDateTime dateEvaluation,
        int scoreSuspicion,
        NiveauSuspicion niveau,
        String recommandation,
        String observations,
        SourceSaisie source,
        Double latitude,
        Double longitude,
        LocalDateTime dateSynchronisation,
        UUID patienteId,
        String patienteCodeAnonyme,
        String patienteNomComplet,
        String agentNom,
        String centreNom,
        IndicateursCliniques indicateurs
) {
    public static EvaluationResponse from(Evaluation e) {
        return new EvaluationResponse(
                e.getId(),
                e.getClientUuid(),
                e.getDateEvaluation(),
                e.getScoreSuspicion(),
                e.getNiveau(),
                e.getRecommandation(),
                e.getObservations(),
                e.getSource(),
                e.getLatitude(),
                e.getLongitude(),
                e.getDateSynchronisation(),
                e.getPatiente().getId(),
                e.getPatiente().getCodeAnonyme(),
                e.getPatiente().getPrenom() + " " + e.getPatiente().getNom(),
                e.getAgent() != null ? e.getAgent().nomComplet() : null,
                e.getCentre() != null ? e.getCentre().getNom() : null,
                e.getIndicateurs()
        );
    }
}
