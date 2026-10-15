package com.braveher.backend.integration.orange;

import java.math.BigDecimal;

public interface OrangeMoneyGateway {
    String initierPaiement(String beneficiaireTel, BigDecimal montant, String reference);
}
