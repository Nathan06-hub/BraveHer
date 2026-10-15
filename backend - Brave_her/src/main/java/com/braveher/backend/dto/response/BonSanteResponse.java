package com.braveher.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.braveher.backend.model.entity.BonSante;
import com.braveher.backend.model.enums.StatutBon;

public record BonSanteResponse(
        UUID id,
        String code,
        BigDecimal montant,
        StatutBon statut,
        String transactionOrangeMoney,
        LocalDateTime dateEmission,
        LocalDateTime dateUtilisation,
        UUID patienteId,
        String patienteNomComplet,
        String patienteCodeAnonyme,
        String fondsNom,
        String centreNom
) {
    public static BonSanteResponse from(BonSante b) {
        return new BonSanteResponse(
                b.getId(),
                b.getCode(),
                b.getMontant(),
                b.getStatut(),
                b.getTransactionOrangeMoney(),
                b.getDateEmission(),
                b.getDateUtilisation(),
                b.getPatiente().getId(),
                b.getPatiente().getPrenom() + " " + b.getPatiente().getNom(),
                b.getPatiente().getCodeAnonyme(),
                b.getFonds() != null ? b.getFonds().getNom() : null,
                b.getCentre() != null ? b.getCentre().getNom() : null
        );
    }
}
