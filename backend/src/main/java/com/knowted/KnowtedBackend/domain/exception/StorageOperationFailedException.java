package com.knowted.KnowtedBackend.domain.exception;

public class StorageOperationFailedException extends RuntimeException {
    public StorageOperationFailedException(String message, Throwable cause) {
        super(message, cause);
    }
}
