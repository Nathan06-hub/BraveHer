package com.braveher.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.braveher.backend.model.entity.Campagne;
import com.braveher.backend.model.enums.StatutCampagne;

import java.util.List;
import java.util.UUID;

public interface CampagneRepository extends JpaRepository<Campagne, UUID> {

    List<Campagne> findByStatutOrderByDateDebutDesc(StatutCampagne statut);

    List<Campagne> findByCentreIdOrderByDateDebutDesc(UUID centreId);
}
