package com.knowted.KnowtedBackend.presentation.controllers;

import com.knowted.KnowtedBackend.application.usecase.CourseUseCase;
import com.knowted.KnowtedBackend.infrastructure.auth.JwtAuthenticationFilter;
import com.knowted.KnowtedBackend.infrastructure.auth.OAuth2SuccessHandler;
import com.knowted.KnowtedBackend.domain.entity.Course;
import com.knowted.KnowtedBackend.presentation.dto.CreateCourseRequest;
import com.knowted.KnowtedBackend.presentation.dto.UpdateCourseRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CourseController.class)
@org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class CourseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CourseUseCase courseUseCase;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    private final UUID userId = UUID.randomUUID();
    private final UUID courseId = UUID.randomUUID();

    @Test
    void list_returnsCourses() throws Exception {
        Course c = new Course(userId, "CS101", "Intro", "F24");
        when(courseUseCase.listCourses(userId)).thenReturn(List.of(c));

        mockMvc.perform(get("/api/courses").param("userId", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].name").value("Intro"));
    }

    @Test
    void create_validRequest_returns201() throws Exception {
        Course saved = new Course(userId, "CS101", "Intro", "F24");
        org.springframework.test.util.ReflectionTestUtils.setField(saved, "courseId", courseId);
        when(courseUseCase.createCourse(eq(userId), any(CreateCourseRequest.class))).thenReturn(saved);

        mockMvc.perform(post("/api/courses")
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"CS101\",\"name\":\"Intro\",\"term\":\"F24\"}")
)
                .andExpect(status().isOk());
    }

    @Test
    void get_found_returns200() throws Exception {
        Course c = new Course(userId, "CS101", "Intro", "F24");
        org.springframework.test.util.ReflectionTestUtils.setField(c, "courseId", courseId);
        when(courseUseCase.getCourse(userId, courseId)).thenReturn(c);

        mockMvc.perform(get("/api/courses/{courseId}", courseId)
                        .param("userId", userId.toString())
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Intro"));
    }

    @Test
    void get_notFound_returns404() throws Exception {
        when(courseUseCase.getCourse(userId, courseId))
                .thenThrow(new ResponseStatusException(org.springframework.http.HttpStatus.NOT_FOUND, "Not found"));

        mockMvc.perform(get("/api/courses/{courseId}", courseId)
                        .param("userId", userId.toString())
)
                .andExpect(status().isNotFound());
    }

    @Test
    void patch_updatesAndReturns() throws Exception {
        Course updated = new Course(userId, "CS102", "Advanced", "S25");
        org.springframework.test.util.ReflectionTestUtils.setField(updated, "courseId", courseId);
        when(courseUseCase.updateCourse(eq(userId), eq(courseId), any(UpdateCourseRequest.class)))
                .thenReturn(updated);

        mockMvc.perform(patch("/api/courses/{courseId}", courseId)
                        .param("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Advanced\"}")
)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Advanced"));
    }

    @Test
    void delete_succeeds() throws Exception {
        doNothing().when(courseUseCase).deleteCourse(userId, courseId);

        mockMvc.perform(delete("/api/courses/{courseId}", courseId)
                        .param("userId", userId.toString())
)
                .andExpect(status().isOk());
    }
}
