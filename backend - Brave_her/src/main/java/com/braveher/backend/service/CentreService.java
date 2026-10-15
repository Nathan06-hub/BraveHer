package com.braveher.backend.service;

import com.braveher.backend.dto.request.CentreRequest;
import com.braveher.backend.dto.response.CentreResponse;
import com.braveher.backend.exception.ResourceNotFoundException;
import com.braveher.backend.model.entity.CentreSante;
import com.braveher.backend.repository.CentreSanteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CentreService {

    private final CentreSanteRepository centreRepository;

    public CentreService(CentreSanteRepository centreRepository) {
        this.centreRepository = centreRepository;
    }

    @Transactional(readOnly = true)
    public List<CentreResponse> listerTous() {
        return centreRepository.findAll().stream().map(CentreResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public CentreResponse obtenirParId(UUID id) {
        return centreRepository.findById(id)
                .map(CentreResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("Centre de santé", id));
    }

    @Transactional
    public CentreResponse creer(CentreRequest request) {
        CentreSante c = new CentreSante();
        c.setNom(request.nom());
        c.setType(request.type());
        c.setRegion(request.region());
        c.setProvince(request.province());
        c.setCommune(request.commune());
        c.setLatitude(request.latitude());
        c.setLongitude(request.longitude());
        return CentreResponse.from(centreRepository.save(c));
    }
}
