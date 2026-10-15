package com.braveher.backend.integration.orange;

import com.braveher.backend.model.enums.Langue;

public interface OrangeSmsGateway {
    String envoyerSms(String destinataire, String message, Langue langue);
}
