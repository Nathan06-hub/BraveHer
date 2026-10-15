package com.braveher.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.model.enums.Langue;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PatienteRepository extends JpaRepository<Patiente, UUID> {

    Optional<Patiente> findByCodeAnonyme(String codeAnonyme);

    Page<Patiente> findByCentreId(UUID centreId, Pageable pageable);

    /**
     * Ciblage d'une campagne : région obligatoire, commune et langue optionnelles (null = toutes).
     * Seules les patientes joignables (téléphone renseigné) sont retournées.
     */
    @Query("""
            select p from Patiente p
            where lower(p.region) = lower(:region)
              and (:commune is null or lower(p.commune) = lower(:commune))
              and (:langue is null or p.langue = :langue)
              and p.telephone is not null and p.telephone <> ''
            """)
    List<Patiente> findCiblesCampagne(@Param("region") String region,
                                      @Param("commune") String commune,
                                      @Param("langue") Langue langue);

    @Query("""
            select p from Patiente p
            where lower(p.nom) like lower(concat('%', :q, '%'))
               or lower(p.prenom) like lower(concat('%', :q, '%'))
               or p.codeAnonyme = upper(:q)
               or p.telephone like concat('%', :q, '%')
            """)
    Page<Patiente> rechercher(@Param("q") String q, Pageable pageable);
}
