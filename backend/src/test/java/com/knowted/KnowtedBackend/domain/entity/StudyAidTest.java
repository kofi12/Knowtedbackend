package com.knowted.KnowtedBackend.domain.entity;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class StudyAidTest {

    @Test
    void getters_returnCorrectValues() {
        StudyAid aid = createStudyAid(null, (short) 1);
        assertThat(aid.getStudyAidId()).isNull();
        assertThat(aid.getUserId()).isNotNull();
        assertThat(aid.getDocumentId()).isNotNull();
        assertThat(aid.getTypeId()).isEqualTo((short) 1);
        assertThat(aid.getTitle()).isEqualTo("Test Aid");
        assertThat(aid.getGenerationStatus()).isEqualTo("READY");
    }

    @Test
    void getCourse_returnsCourseWhenSet() {
        UUID userId = UUID.randomUUID();
        Course course = new Course(userId, "C1", "Course", null);
        StudyAid aid = createStudyAid(course, (short) 2);
        assertThat(aid.getCourse()).isSameAs(course);
    }

    @Test
    void getCourse_returnsNullWhenNotSet() {
        StudyAid aid = createStudyAid(null, (short) 1);
        assertThat(aid.getCourse()).isNull();
    }

    private StudyAid createStudyAid(Course course, short typeId) {
        StudyAid aid;
        try {
            var ctor = StudyAid.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            aid = ctor.newInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        ReflectionTestUtils.setField(aid, "userId", UUID.randomUUID());
        ReflectionTestUtils.setField(aid, "course", course);
        ReflectionTestUtils.setField(aid, "documentId", UUID.randomUUID());
        ReflectionTestUtils.setField(aid, "typeId", typeId);
        ReflectionTestUtils.setField(aid, "title", "Test Aid");
        ReflectionTestUtils.setField(aid, "generationStatus", "READY");
        return aid;
    }
}
