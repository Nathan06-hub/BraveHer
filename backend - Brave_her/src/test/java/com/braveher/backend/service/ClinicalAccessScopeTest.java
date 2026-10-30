package com.braveher.backend.service;

import com.braveher.backend.dto.request.EvaluationRequest;
import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.model.enums.NiveauSuspicion;
import com.braveher.backend.repository.*;
import com.braveher.backend.security.UtilisateurConnecte;
import com.braveher.backend.triage.TriageEngine;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClinicalAccessScopeTest {

    @Mock PatienteRepository patienteRepository;
    @Mock CentreSanteRepository centreRepository;
    @Mock NotificationService notificationService;
    @InjectMocks PatienteService patienteService;

    @Mock EvaluationRepository evaluationRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock CampagneRepository campagneRepository;
    @Mock DicteeVocaleRepository dicteeRepository;
    @Mock TriageEngine triageEngine;
    @InjectMocks EvaluationService evaluationService;

    @Test
    void recherchePatientesLimiteeAuCentreDuSoignant() {
        UUID centreId = UUID.randomUUID();
        var pageable = PageRequest.of(0, 20);
        when(patienteRepository.findByCentreId(centreId, pageable)).thenReturn(Page.empty(pageable));

        patienteService.rechercher(null, pageable,
                new UtilisateurConnecte(UUID.randomUUID(), "Agent", "AGENT_SANTE", centreId));

        verify(patienteRepository).findByCentreId(centreId, pageable);
        verify(patienteRepository, never()).findAll(pageable);
    }

    @Test
    void listeEvaluationsIgnoreLeCentreDemandeEtUtiliseLeCentreDuJeton() {
        UUID centreDuJeton = UUID.randomUUID();
        UUID centreDemande = UUID.randomUUID();
        var pageable = PageRequest.of(0, 20);
        when(evaluationRepository.findByNiveauAndCentreId(NiveauSuspicion.ELEVE, centreDuJeton, pageable))
                .thenReturn(Page.empty(pageable));

        evaluationService.lister(NiveauSuspicion.ELEVE, centreDemande, pageable,
                new UtilisateurConnecte(UUID.randomUUID(), "Agent", "SAGE_FEMME", centreDuJeton));

        verify(evaluationRepository).findByNiveauAndCentreId(NiveauSuspicion.ELEVE, centreDuJeton, pageable);
        verify(evaluationRepository, never()).findByNiveau(any(), any());
    }

    @Test
    void creationEvaluationRefuseUnePatienteDUnAutreCentre() {
        UUID patientId = UUID.randomUUID();
        UUID centreId = UUID.randomUUID();
        UUID agentId = UUID.randomUUID();
        when(evaluationRepository.existsByClientUuid(any())).thenReturn(false);
        when(patienteRepository.findById(patientId)).thenReturn(Optional.of(new Patiente()));
        when(patienteRepository.existsByIdAndCentreId(patientId, centreId)).thenReturn(false);

        var request = new EvaluationRequest(UUID.randomUUID(), patientId, null, null, null,
                null, null, null, null, null);
        var user = new UtilisateurConnecte(agentId, "Agent", "AGENT_SANTE", centreId);

        assertThatThrownBy(() -> evaluationService.creer(request, user))
                .isInstanceOf(AccessDeniedException.class);
        verifyNoInteractions(utilisateurRepository, triageEngine);
    }
}
