package com.braveher.backend.integration.orange;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Component
public class SimulatedOrangeMoneyGateway implements OrangeMoneyGateway {

    @Override
    public String initierPaiement(String beneficiaireTel, BigDecimal montant, String reference) {
        String txId = "OM-BF-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase();
        log.info("[SIMULATION ORANGE MONEY] Transaction: {}, Montant: {} XOF, Bénéficiaire: {}, Réf: {}",
                txId, montant, beneficiaireTel, reference);
        return txId;
    }
}
