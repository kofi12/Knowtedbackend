package com.knowted.KnowtedBackend.presentation.mapper;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import com.knowted.KnowtedBackend.presentation.dto.StudyAidDto;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StudyAidMapperTest {

    @Test
    void toDto_typeId1_mapsToFlashcardDeck() {
        StudyAid aid = createStudyAid(null, (short) 1);

        StudyAidDto dto = StudyAidMapper.toDto(aid);

        assertThat(dto.type()).isEqualTo("FLASHCARD_DECK");
    }

    @Test
    void toDto_typeId2_mapsToQuiz() {
        StudyAid aid = createStudyAid(null, (short) 2);

        StudyAidDto dto = StudyAidMapper.toDto(aid);

        assertThat(dto.type()).isEqualTo("QUIZ");
    }

    @Test
    void toDto_typeId3_mapsToUnknown() {
        StudyAid aid = createStudyAid(null, (short) 3);

        StudyAidDto dto = StudyAidMapper.toDto(aid);

        assertThat(dto.type()).isEqualTo("UNKNOWN");
    }

    @Test
    void toDto_nullTypeId_mapsToUnknown() {
        StudyAid aid = createStudyAidWithNullTypeId();

        StudyAidDto dto = StudyAidMapper.toDto(aid);

        assertThat(dto.type()).isEqualTo("UNKNOWN");
    }

    @Test
    void toDto_nullCourse_returnsNullCourseId() {
        StudyAid aid = createStudyAid(null, (short) 1);

        StudyAidDto dto = StudyAidMapper.toDto(aid);

        assertThat(dto.courseId()).isNull();
    }

    @Test
    void toDto_withCourse_returnsCourseId() {
        UUID courseId = UUID.randomUUID();
        Course course = new Course(UUID.randomUUID(), "C1", "Course", null);
        ReflectionTestUtils.setField(course, "courseId", courseId);
        StudyAid aid = createStudyAid(course, (short) 1);

        StudyAidDto dto = StudyAidMapper.toDto(aid);

        assertThat(dto.courseId()).isEqualTo(courseId);
        assertThat(dto.title()).isEqualTo("Test Aid");
        assertThat(dto.generationStatus()).isEqualTo("READY");
    }

    private StudyAid createStudyAid(Course course, short typeId) {
        try {
            var ctor = StudyAid.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            StudyAid aid = ctor.newInstance();
            ReflectionTestUtils.setField(aid, "studyAidId", UUID.randomUUID());
            ReflectionTestUtils.setField(aid, "userId", UUID.randomUUID());
            ReflectionTestUtils.setField(aid, "course", course);
            ReflectionTestUtils.setField(aid, "documentId", UUID.randomUUID());
            ReflectionTestUtils.setField(aid, "typeId", typeId);
            ReflectionTestUtils.setField(aid, "title", "Test Aid");
            ReflectionTestUtils.setField(aid, "generationStatus", "READY");
            ReflectionTestUtils.setField(aid, "createdAt", Instant.now());
            ReflectionTestUtils.setField(aid, "updatedAt", Instant.now());
            return aid;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private StudyAid createStudyAidWithNullTypeId() {
        try {
            var ctor = StudyAid.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            StudyAid aid = ctor.newInstance();
            ReflectionTestUtils.setField(aid, "studyAidId", UUID.randomUUID());
            ReflectionTestUtils.setField(aid, "userId", UUID.randomUUID());
            ReflectionTestUtils.setField(aid, "course", null);
            ReflectionTestUtils.setField(aid, "documentId", UUID.randomUUID());
            ReflectionTestUtils.setField(aid, "typeId", null);
            ReflectionTestUtils.setField(aid, "title", "Test");
            ReflectionTestUtils.setField(aid, "generationStatus", "READY");
            return aid;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
