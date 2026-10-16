package com.braveher.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.model.enums.CanalNotification;

import java.util.List;
import java.util.UUID;

public interface SmsLogRepository extends JpaRepository<SmsLog, UUID> {

    @Override
    @EntityGraph(attributePaths = {"patiente", "campagne"})
    Page<SmsLog> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"patiente", "campagne"})
    Page<SmsLog> findByCanal(CanalNotification canal, Pageable pageable);

    @EntityGraph(attributePaths = {"patiente", "campagne"})
    List<SmsLog> findByCampagneIdOrderByDateEnvoiDesc(UUID campagneId);

    /** Alimente l'écran « Téléphone de la patiente (simulation) » de la démo. */
    @EntityGraph(attributePaths = {"patiente", "campagne"})
    List<SmsLog> findByDestinataireOrderByDateEnvoiDesc(String destinataire);
}
