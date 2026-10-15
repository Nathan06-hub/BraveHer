package com.braveher.backend.dto.response;

import java.util.UUID;

import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.model.enums.CanalNotification;
import com.braveher.backend.model.enums.Langue;

public record PatienteResponse(
        UUID id,
        String codeAnonyme,
        String nom,
        String prenom,
        Integer age,
        String telephone,
        boolean utiliseWhatsApp,
        CanalNotification canalNotification,
        Langue langue,
        String commune,
        String region,
        boolean vulnerable,
        boolean deplaceeInterne,
        UUID centreId,
        String centreNom
) {
    public static PatienteResponse from(Patiente p) {
        return new PatienteResponse(
                p.getId(),
                p.getCodeAnonyme(),
                p.getNom(),
                p.getPrenom(),
                p.getAge(),
                p.getTelephone(),
                p.isUtiliseWhatsApp(),
                p.canalNotification(),
                p.getLangue(),
                p.getCommune(),
                p.getRegion(),
                p.isVulnerable(),
                p.isDeplaceeInterne(),
                p.getCentre() != null ? p.getCentre().getId() : null,
                p.getCentre() != null ? p.getCentre().getNom() : null
        );
    }
}
