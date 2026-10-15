package com.braveher.backend.dto.response;

import java.util.UUID;

import com.braveher.backend.model.entity.CentreSante;
import com.braveher.backend.model.enums.TypeCentre;

public record CentreResponse(
        UUID id,
        String nom,
        TypeCentre type,
        String region,
        String province,
        String commune,
        Double latitude,
        Double longitude
) {
    public static CentreResponse from(CentreSante c) {
        return new CentreResponse(
                c.getId(),
                c.getNom(),
                c.getType(),
                c.getRegion(),
                c.getProvince(),
                c.getCommune(),
                c.getLatitude(),
                c.getLongitude()
        );
    }
}
