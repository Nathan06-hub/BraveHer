package com.braveher.backend.service;

import com.braveher.backend.dto.request.BonSanteRequest;
import com.braveher.backend.exception.BusinessException;
import com.braveher.backend.integration.orange.OrangeMoneyGateway;
import com.braveher.backend.model.entity.BonSante;
import com.braveher.backend.model.entity.CentreSante;
import com.braveher.backend.model.entity.FondsParrainage;
import com.braveher.backend.model.entity.Patiente;
import com.braveher.backend.repository.*;
import com.braveher.backend.security.UtilisateurConnecte;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BonSanteServiceTest {

    @Mock BonSanteRepository bonSanteRepository;
    @Mock PatienteRepository patienteRepository;
    @Mock FondsParrainageRepository fondsRepository;
    @Mock CentreSanteRepository centreRepository;
    @Mock EvaluationRepository evaluationRepository;
    @Mock OrangeMoneyGateway orangeMoneyGateway;
    @InjectMocks BonSanteService bonSanteService;

    @Test
    void emissionReserveLeBonSansVerserSurLeTelephoneDeLaPatiente() {
        UUID patienteId = UUID.randomUUID();
        UUID centreId = UUID.randomUUID();
        Patiente patiente = new Patiente();
        patiente.setCodeAnonyme("BFK-ABC234");
        patiente.setTelephone("+22670000000");
        CentreSante centre = new CentreSante();
        centre.setNom("CSPS Test");
        patiente.setCentre(centre);
        FondsParrainage fonds = new FondsParrainage();
        fonds.setNom("Fonds test");
        fonds.setSoldeActuel(new BigDecimal("50000"));

        when(patienteRepository.findById(patienteId)).thenReturn(Optional.of(patiente));
        when(fondsRepository.findAll()).thenReturn(List.of(fonds));
        when(centreRepository.findById(centreId)).thenReturn(Optional.of(centre));
        when(bonSanteRepository.save(any(BonSante.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bonSanteRepository.existsByCode(any())).thenReturn(false);

        var response = bonSanteService.emettreBon(new BonSanteRequest(
                patienteId, null, null, centreId, new BigDecimal("25000")),
                new UtilisateurConnecte(UUID.randomUUID(), "Admin", "ADMIN", null));

        assertThat(response.transactionOrangeMoney()).isNull();
        verify(orangeMoneyGateway, never()).initierPaiement(any(), any(), any());
    }

    @Test
    void validationVerseAuCompteMarchandDuCentreEtRefuseUnBonDejaUtilise() {
        CentreSante centre = new CentreSante();
        centre.setCompteMarchandPaiement("MARCHAND-CSPS-01");
        Patiente patiente = new Patiente();
        patiente.setCodeAnonyme("BFK-ABC234");
        FondsParrainage fonds = new FondsParrainage();
        fonds.setNom("Fonds test");
        BonSante bon = new BonSante();
        bon.setCode("BON-ABC234");
        bon.setMontant(new BigDecimal("25000"));
        bon.setCentre(centre);
        bon.setPatiente(patiente);
        bon.setFonds(fonds);
        when(bonSanteRepository.findByCode("BON-ABC234")).thenReturn(Optional.of(bon));
        when(orangeMoneyGateway.initierPaiement("MARCHAND-CSPS-01", bon.getMontant(), "BON-BON-ABC234"))
                .thenReturn("OM-BF-TX-1");
        when(bonSanteRepository.save(any(BonSante.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var admin = new UtilisateurConnecte(UUID.randomUUID(), "Admin", "ADMIN", null);
        var response = bonSanteService.utiliserBon("BON-ABC234", admin);

        assertThat(response.transactionOrangeMoney()).isEqualTo("OM-BF-TX-1");
        assertThatThrownBy(() -> bonSanteService.utiliserBon("BON-ABC234", admin))
                .isInstanceOf(BusinessException.class);
        verify(orangeMoneyGateway, times(1)).initierPaiement(any(), any(), any());
    }
}
