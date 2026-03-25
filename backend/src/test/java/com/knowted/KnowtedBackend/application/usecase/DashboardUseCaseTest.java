package com.knowted.KnowtedBackend.application.usecase;

import com.knowted.KnowtedBackend.domain.entity.CourseDocument;
import com.knowted.KnowtedBackend.domain.entity.StudyAid;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseDocumentRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPACourseRepository;
import com.knowted.KnowtedBackend.infrastructure.persistence.JPAStudyAidRepository;
import com.knowted.KnowtedBackend.presentation.dto.DashboardRecentDto;
import com.knowted.KnowtedBackend.presentation.dto.DashboardSummaryDto;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardUseCaseTest {

    @Mock
    private JPACourseRepository courseRepository;

    @Mock
    private JPACourseDocumentRepository documentRepository;

    @Mock
    private JPAStudyAidRepository studyAidRepository;

    @InjectMocks
    private DashboardUseCase dashboardUseCase;

    private final UUID userId = UUID.randomUUID();
    private final UUID courseId = UUID.randomUUID();

    @Test
    void getSummary_returnsCounts() {
        when(courseRepository.countByUserId(userId)).thenReturn(3L);
        when(documentRepository.countByUserId(userId)).thenReturn(10L);
        when(studyAidRepository.countByUserId(userId)).thenReturn(5L);

        DashboardSummaryDto result = dashboardUseCase.getSummary(userId);

        assertThat(result.activeCourses()).isEqualTo(3);
        assertThat(result.studyMaterials()).isEqualTo(10);
        assertThat(result.generatedAids()).isEqualTo(5);
    }

    @Test
    void getRecent_withCourseId_returnsFilteredResults() {
        when(courseRepository.existsByCourseIdAndUserId(courseId, userId)).thenReturn(true);
        CourseDocument doc = new CourseDocument(userId, null, "f.pdf", "k", null, null, null, null);
        StudyAid aid = createStudyAid();
        when(documentRepository.findByCourse_CourseIdOrderByUploadedAtDesc(eq(courseId), any(Pageable.class)))
                .thenReturn(List.of(doc));
        when(studyAidRepository.findByCourse_CourseIdOrderByUpdatedAtDesc(eq(courseId), any(Pageable.class)))
                .thenReturn(List.of(aid));

        DashboardRecentDto result = dashboardUseCase.getRecent(userId, courseId, 5);

        assertThat(result.recentDocuments()).hasSize(1);
        assertThat(result.recentStudyAids()).hasSize(1);
    }

    @Test
    void getRecent_withCourseId_userDoesNotOwn_throws() {
        when(courseRepository.existsByCourseIdAndUserId(courseId, userId)).thenReturn(false);

        assertThatThrownBy(() -> dashboardUseCase.getRecent(userId, courseId, 5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Course not found");
    }

    @Test
    void getRecent_withoutCourseId_returnsAllUserResults() {
        CourseDocument doc = new CourseDocument(userId, null, "f.pdf", "k", null, null, null, null);
        StudyAid aid = createStudyAid();
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(List.of(doc));
        when(studyAidRepository.findByUserIdOrderByUpdatedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(List.of(aid));

        DashboardRecentDto result = dashboardUseCase.getRecent(userId, null, 5);

        assertThat(result.recentDocuments()).hasSize(1);
        assertThat(result.recentStudyAids()).hasSize(1);
    }

    @Test
    void getRecent_clampsLimitTo1() {
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(List.of());
        when(studyAidRepository.findByUserIdOrderByUpdatedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(List.of());

        DashboardRecentDto result = dashboardUseCase.getRecent(userId, null, 0);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(documentRepository).findByUserIdOrderByUploadedAtDesc(eq(userId), captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(1);
    }

    @Test
    void getRecent_clampsLimitTo50() {
        when(documentRepository.findByUserIdOrderByUploadedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(List.of());
        when(studyAidRepository.findByUserIdOrderByUpdatedAtDesc(eq(userId), any(Pageable.class)))
                .thenReturn(List.of());

        dashboardUseCase.getRecent(userId, null, 100);

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(documentRepository).findByUserIdOrderByUploadedAtDesc(eq(userId), captor.capture());
        assertThat(captor.getValue().getPageSize()).isEqualTo(50);
    }

    private StudyAid createStudyAid() {
        try {
            var ctor = StudyAid.class.getDeclaredConstructor();
            ctor.setAccessible(true);
            StudyAid aid = ctor.newInstance();
            org.springframework.test.util.ReflectionTestUtils.setField(aid, "studyAidId", UUID.randomUUID());
            org.springframework.test.util.ReflectionTestUtils.setField(aid, "userId", userId);
            org.springframework.test.util.ReflectionTestUtils.setField(aid, "documentId", UUID.randomUUID());
            org.springframework.test.util.ReflectionTestUtils.setField(aid, "typeId", (short) 1);
            org.springframework.test.util.ReflectionTestUtils.setField(aid, "title", "Aid");
            org.springframework.test.util.ReflectionTestUtils.setField(aid, "generationStatus", "READY");
            return aid;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
