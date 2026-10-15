package com.braveher.backend.model.enums;

public enum SourceSaisie {
    /** Saisie manuelle du formulaire en ligne */
    FORMULAIRE,
    /** Formulaire pré-rempli par dictée vocale (STT + NLP) */
    DICTEE_VOCALE,
    /** Saisie hors-ligne remontée par synchronisation */
    SYNC_OFFLINE
}
