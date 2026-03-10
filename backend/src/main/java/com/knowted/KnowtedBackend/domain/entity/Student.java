package com.knowted.KnowtedBackend.domain.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "user_id")
    private UUID studentId;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "name")
    private String Name;

    @Column(name = "password")
    private String password;

    @Column(name = "auth_provider", nullable = false)
    private String authProvider;

    @Column(name = "provider_user_id")
    private String providerUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    protected Student() {}

    public Student(String email, String displayName, String passwordHash, String authProvider, String providerUserId) {
        this.email = email;
        this.Name = Name;
        this.password = password;
        this.authProvider = authProvider;
        this.providerUserId = providerUserId;
    }

    public UUID getStudentId() { return studentId; }
    public String getEmail() { return email; }
    public String getDisplayName() { return Name; }
    public String getPasswordHash() { return password; }
    public String getAuthProvider() { return authProvider; }
    public String getProviderUserId() { return providerUserId; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}