package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import com.knowted.KnowtedBackend.presentation.dto.StudyAidDto;

import java.util.UUID;

public class StudyAidMapper {

    private StudyAidMapper() {}

    private static String mapType(short typeId) {
        return switch (typeId) {
            case 1 -> "FLASHCARD_DECK";
            case 2 -> "QUIZ";
            default -> "UNKNOWN";
        };
    }

    public static StudyAidDto toDto(StudyAid a) {
        UUID courseId = (a.getCourse() == null) ? null : a.getCourse().getCourseId();

        // handle nullable Short safely
        short typeId = (a.getTypeId() == null) ? (short) 0 : a.getTypeId();

        return new StudyAidDto(
                a.getStudyAidId(),
                courseId,
                a.getDocumentId(),
                typeId,
                mapType(typeId),
                a.getTitle(),
                a.getGenerationStatus(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}