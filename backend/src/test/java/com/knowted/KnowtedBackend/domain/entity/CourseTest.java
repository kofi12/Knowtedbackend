package com.knowted.KnowtedBackend.domain.entity;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CourseTest {

    private UUID userId;
    private Course course;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        course = new Course(userId, "CS101", "Intro to CS", "Fall 2024");
    }

    @Test
    void constructor_setsAllFields() {
        assertThat(course.getUserId()).isEqualTo(userId);
        assertThat(course.getCode()).isEqualTo("CS101");
        assertThat(course.getName()).isEqualTo("Intro to CS");
        assertThat(course.getTerm()).isEqualTo("Fall 2024");
        assertThat(course.getCourseDocuments()).isEmpty();
    }

    @Test
    void addCourseDocument_addsDocumentAndSetsCourse() {
        CourseDocument doc = new CourseDocument(
                userId, null, "test.pdf", "key", "bucket", "application/pdf", 100L, null);

        course.addCourseDocument(doc);

        assertThat(course.getCourseDocuments()).hasSize(1).contains(doc);
        assertThat(doc.getCourse()).isSameAs(course);
    }

    @Test
    void addCourseDocument_throwsWhenExceedingLimit() {
        for (int i = 0; i < 50; i++) {
            CourseDocument doc = new CourseDocument(
                    userId, null, "doc" + i + ".pdf", "key" + i, null, "application/pdf", null, null);
            course.addCourseDocument(doc);
        }

        CourseDocument extra = new CourseDocument(
                userId, null, "extra.pdf", "extra", null, "application/pdf", null, null);

        assertThatThrownBy(() -> course.addCourseDocument(extra))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Too many courseDocuments");
    }

    @Test
    void removeCourseDocument_removesAndClearsCourse() {
        CourseDocument doc = new CourseDocument(
                userId, null, "test.pdf", "key", null, "application/pdf", null, null);
        course.addCourseDocument(doc);

        course.removeCourseDocument(doc);

        assertThat(course.getCourseDocuments()).isEmpty();
        assertThat(doc.getCourse()).isNull();
    }

    @Test
    void setters_updateFields() {
        course.setCode("CS102");
        course.setName("Advanced CS");
        course.setTerm("Spring 2025");

        assertThat(course.getCode()).isEqualTo("CS102");
        assertThat(course.getName()).isEqualTo("Advanced CS");
        assertThat(course.getTerm()).isEqualTo("Spring 2025");
    }
}
