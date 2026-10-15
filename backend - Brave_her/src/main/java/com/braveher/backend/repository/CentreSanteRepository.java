package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.CentreSante;
import com.braveher.backend.model.enums.TypeCentre;

import java.util.List;
import java.util.UUID;

public interface CentreSanteRepository extends JpaRepository<CentreSante, UUID> {

    List<CentreSante> findByRegionIgnoreCase(String region);

    List<CentreSante> findByType(TypeCentre type);
}
