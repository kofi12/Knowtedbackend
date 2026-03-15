package com.knowted.KnowtedBackend.domain.exception;

import java.util.UUID;

public class StudyAidNotFoundException extends RuntimeException {

    public StudyAidNotFoundException(UUID id) {
        super("Study aid not found with id: " + id);
    }
}
