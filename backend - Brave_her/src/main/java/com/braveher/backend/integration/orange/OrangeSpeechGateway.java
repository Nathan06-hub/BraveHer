package com.braveher.backend.integration.orange;

public interface OrangeSpeechGateway {
    String transcrireAudio(byte[] audioBytes, String contentType);
}
