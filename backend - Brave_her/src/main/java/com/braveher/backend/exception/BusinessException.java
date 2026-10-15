package com.braveher.backend.exception;

/** Violation d'une règle métier (HTTP 422). */
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
