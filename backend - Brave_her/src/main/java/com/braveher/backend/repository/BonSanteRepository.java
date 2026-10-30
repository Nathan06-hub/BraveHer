package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;

import com.braveher.backend.model.entity.BonSante;
import com.braveher.backend.model.enums.StatutBon;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BonSanteRepository extends JpaRepository<BonSante, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<BonSante> findByCode(String code);

    boolean existsByCode(String code);

    List<BonSante> findByPatienteId(UUID patienteId);

    List<BonSante> findByCentreId(UUID centreId);

    List<BonSante> findByPatienteIdAndCentreId(UUID patienteId, UUID centreId);

    long countByStatut(StatutBon statut);
}
