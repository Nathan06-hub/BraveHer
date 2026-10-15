package com.braveher.backend.integration.whatsapp;

import com.braveher.backend.model.enums.Langue;

public interface WhatsAppGateway {
    String envoyerMessage(String destinataire, String message, String mediaUrl, Langue langue);
}
