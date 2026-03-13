package com.knowted.KnowtedBackend.presentation.dto;

public record CreateCourseRequest(
        String code,
        String name,
        String term
) {}