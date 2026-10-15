package com.braveher.backend.dto.response;

import java.util.UUID;

import com.braveher.backend.model.entity.DicteeVocale;
import com.braveher.backend.model.entity.IndicateursCliniques;

public record DicteeResponse(
        UUID id,
        String transcription,
        IndicateursCliniques indicateursPreRemplis
) {
    public static DicteeResponse from(DicteeVocale d, IndicateursCliniques ind) {
        return new DicteeResponse(
                d.getId(),
                d.getTranscription(),
                ind
        );
    }
}
