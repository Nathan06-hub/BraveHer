package com.braveher.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.Evaluation;
import com.braveher.backend.model.enums.NiveauSuspicion;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

public interface EvaluationRepository extends JpaRepository<Evaluation, UUID> {

    /** Idempotence de la synchronisation offline. */
    boolean existsByClientUuid(UUID clientUuid);

    List<Evaluation> findByClientUuidIn(Collection<UUID> clientUuids);

    @EntityGraph(attributePaths = {"patiente", "centre"})
    Page<Evaluation> findByNiveau(NiveauSuspicion niveau, Pageable pageable);

    @EntityGraph(attributePaths = {"patiente", "centre"})
    Page<Evaluation> findByCentreId(UUID centreId, Pageable pageable);

    List<Evaluation> findByPatienteIdOrderByDateEvaluationDesc(UUID patienteId);
}
