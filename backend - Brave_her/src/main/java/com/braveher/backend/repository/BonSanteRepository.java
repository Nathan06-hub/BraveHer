package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.BonSante;
import com.braveher.backend.model.enums.StatutBon;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BonSanteRepository extends JpaRepository<BonSante, UUID> {

    Optional<BonSante> findByCode(String code);

    boolean existsByCode(String code);

    List<BonSante> findByPatienteId(UUID patienteId);

    long countByStatut(StatutBon statut);
}
