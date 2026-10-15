package com.braveher.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.SmsLog;
import com.braveher.backend.model.enums.CanalNotification;

import java.util.List;
import java.util.UUID;

public interface SmsLogRepository extends JpaRepository<SmsLog, UUID> {

    Page<SmsLog> findByCanal(CanalNotification canal, Pageable pageable);

    List<SmsLog> findByCampagneIdOrderByDateEnvoiDesc(UUID campagneId);

    /** Alimente l'écran « Téléphone de la patiente (simulation) » de la démo. */
    List<SmsLog> findByDestinataireOrderByDateEnvoiDesc(String destinataire);
}
