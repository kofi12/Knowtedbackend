package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.services.StorageService;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.presentation.dto.CreateCourseRequest;
import com.knowted.KnowtedBackend.presentation.dto.UpdateCourseRequest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CourseUseCaseTest {

    @Mock
    private JPACourseRepository courseRepository;

    @Mock
    private JPACourseDocumentRepository documentRepository;

    @Mock
    private StorageService storageService;

    @InjectMocks
    private CourseUseCase courseUseCase;

    private final UUID userId = UUID.randomUUID();
    private final UUID courseId = UUID.randomUUID();

    @Test
    void listCourses_returnsUserCourses() {
        Course c = new Course(userId, "C1", "Course 1", "F24");
        when(courseRepository.findByUserId(userId)).thenReturn(List.of(c));

        List<Course> result = courseUseCase.listCourses(userId);

        assertThat(result).hasSize(1).containsExactly(c);
        verify(courseRepository).findByUserId(userId);
    }

    @Test
    void createCourse_validRequest_savesAndReturns() {
        CreateCourseRequest req = new CreateCourseRequest("CS101", "Intro", "Fall");
        Course saved = new Course(userId, "CS101", "Intro", "Fall");
        when(courseRepository.save(any(Course.class))).thenReturn(saved);

        Course result = courseUseCase.createCourse(userId, req);

        assertThat(result).isNotNull();
        ArgumentCaptor<Course> captor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository).save(captor.capture());
        assertThat(captor.getValue().getUserId()).isEqualTo(userId);
        assertThat(captor.getValue().getName()).isEqualTo("Intro");
    }

    @Test
    void createCourse_nullName_throwsBadRequest() {
        CreateCourseRequest req = new CreateCourseRequest(null, null, null);

        assertThatThrownBy(() -> courseUseCase.createCourse(userId, req))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void createCourse_blankName_throwsBadRequest() {
        CreateCourseRequest req = new CreateCourseRequest("C1", "  ", "F24");

        assertThatThrownBy(() -> courseUseCase.createCourse(userId, req))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void createCourse_nullRequest_throwsBadRequest() {
        assertThatThrownBy(() -> courseUseCase.createCourse(userId, null))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void getCourse_found_returnsCourse() {
        Course c = new Course(userId, "C1", "Course", null);
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(c));

        Course result = courseUseCase.getCourse(userId, courseId);

        assertThat(result).isSameAs(c);
    }

    @Test
    void getCourse_notFound_throwsNotFound() {
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseUseCase.getCourse(userId, courseId))
                .isInstanceOf(ResponseStatusException.class);
    }

    @Test
    void updateCourse_patchesNonNullFields() {
        Course existing = new Course(userId, "C1", "Old", "F24");
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(existing));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        UpdateCourseRequest req = new UpdateCourseRequest("C2", "New Name", null);

        Course result = courseUseCase.updateCourse(userId, courseId, req);

        assertThat(existing.getCode()).isEqualTo("C2");
        assertThat(existing.getName()).isEqualTo("New Name");
        assertThat(existing.getTerm()).isEqualTo("F24");
        verify(courseRepository).save(existing);
    }

    @Test
    void updateCourse_nullFieldsNotUpdated() {
        Course existing = new Course(userId, "C1", "Name", "F24");
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(existing));
        when(courseRepository.save(any(Course.class))).thenAnswer(i -> i.getArgument(0));

        UpdateCourseRequest req = new UpdateCourseRequest(null, null, "Spring");

        courseUseCase.updateCourse(userId, courseId, req);

        assertThat(existing.getCode()).isEqualTo("C1");
        assertThat(existing.getName()).isEqualTo("Name");
        assertThat(existing.getTerm()).isEqualTo("Spring");
    }

    @Test
    void deleteCourse_deletesStorageAndCourse() {
        Course existing = new Course(userId, "C1", "Course", null);
        CourseDocument doc = new CourseDocument(userId, null, "f.pdf", "storage-key", null, "pdf", 1L, null);
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(existing));
        when(documentRepository.findByCourse_CourseId(courseId)).thenReturn(List.of(doc));

        courseUseCase.deleteCourse(userId, courseId);

        verify(storageService).delete("storage-key");
        verify(courseRepository).delete(existing);
    }

    @Test
    void deleteCourse_skipsDocWithBlankStorageKey() {
        Course existing = new Course(userId, "C1", "Course", null);
        CourseDocument doc = new CourseDocument(userId, null, "f.pdf", "", null, "pdf", null, null);
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(existing));
        when(documentRepository.findByCourse_CourseId(courseId)).thenReturn(List.of(doc));

        courseUseCase.deleteCourse(userId, courseId);

        verify(storageService, never()).delete(any());
        verify(courseRepository).delete(existing);
    }

    @Test
    void deleteCourse_continuesWhenStorageDeleteFails() {
        Course existing = new Course(userId, "C1", "Course", null);
        CourseDocument doc = new CourseDocument(userId, null, "f.pdf", "key", null, "pdf", null, null);
        when(courseRepository.findByCourseIdAndUserId(courseId, userId)).thenReturn(Optional.of(existing));
        when(documentRepository.findByCourse_CourseId(courseId)).thenReturn(List.of(doc));
        doThrow(new RuntimeException("GCS error")).when(storageService).delete("key");

        courseUseCase.deleteCourse(userId, courseId);

        verify(courseRepository).delete(existing);
    }
}
