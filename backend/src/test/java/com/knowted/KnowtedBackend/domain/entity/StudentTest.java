package com.knowted.KnowtedBackend.domain.entity;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class StudentTest {

    @Test
    void constructor_setsAllFields() {
        String email = "test@example.com";
        String displayName = "Test User";
        String passwordHash = "hash123";
        String authProvider = "google";
        String providerUserId = "google-sub-123";

        Student student = new Student(email, displayName, passwordHash, authProvider, providerUserId);

        assertThat(student.getEmail()).isEqualTo(email);
        assertThat(student.getDisplayName()).isEqualTo(displayName);
        assertThat(student.getPasswordHash()).isEqualTo(passwordHash);
        assertThat(student.getAuthProvider()).isEqualTo(authProvider);
        assertThat(student.getProviderUserId()).isEqualTo(providerUserId);
        assertThat(student.getStudentId()).isNull();
    }

    @Test
    void createFromGoogle_createsStudentWithGoogleProvider() {
        String googleSub = "google-123";
        String email = "user@gmail.com";
        String displayName = "Google User";

        Student student = Student.createFromGoogle(googleSub, email, displayName);

        assertThat(student.getProviderUserId()).isEqualTo(googleSub);
        assertThat(student.getEmail()).isEqualTo(email);
        assertThat(student.getDisplayName()).isEqualTo(displayName);
        assertThat(student.getAuthProvider()).isEqualTo("google");
    }

    @Test
    void setEmail_updatesEmail() {
        Student student = new Student("a@b.com", "Name", null, "google", "sub");
        student.setEmail("new@example.com");
        assertThat(student.getEmail()).isEqualTo("new@example.com");
    }

    @Test
    void getters_returnCorrectValues() {
        Student student = new Student("e@x.com", "Disp", "hash", "google", "pid");
        assertThat(student.getStudentId()).isNull();
        assertThat(student.getCreatedAt()).isNull();
        assertThat(student.getUpdatedAt()).isNull();
    }
}
