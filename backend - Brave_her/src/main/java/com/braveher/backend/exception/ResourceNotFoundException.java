package com.braveher.backend.exception;

/** Ressource introuvable (HTTP 404). */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String ressource, Object id) {
        super(ressource + " introuvable : " + id);
    }
}
