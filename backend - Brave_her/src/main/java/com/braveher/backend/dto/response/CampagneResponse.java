package com.braveher.backend.dto.response;

import java.time.LocalDate;
import java.util.UUID;

import com.braveher.backend.model.entity.Campagne;
import com.braveher.backend.model.enums.Langue;
import com.braveher.backend.model.enums.StatutCampagne;

public record CampagneResponse(
        UUID id,
        String titre,
        String message,
        String region,
        String commune,
        Langue langueCible,
        LocalDate dateDebut,
        LocalDate dateFin,
        StatutCampagne statut,
        String planifieParNom,
        UUID centreId,
        String centreNom
) {
    public static CampagneResponse from(Campagne c) {
        return new CampagneResponse(
                c.getId(),
                c.getTitre(),
                c.getMessage(),
                c.getRegion(),
                c.getCommune(),
                c.getLangueCible(),
                c.getDateDebut(),
                c.getDateFin(),
                c.getStatut(),
                c.getPlanifiePar() != null ? c.getPlanifiePar().nomComplet() : null,
                c.getCentre() != null ? c.getCentre().getId() : null,
                c.getCentre() != null ? c.getCentre().getNom() : null
        );
    }
}
