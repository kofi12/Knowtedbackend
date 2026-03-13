package com.knowted.KnowtedBackend.presentation.dto;

public record UpdateCourseRequest(
        String code,
        String name,
        String term
) {}