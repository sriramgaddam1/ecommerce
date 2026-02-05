package com.example.ecom.dto;

public class AdminUserListResponse {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private boolean enabled;
    private boolean hasProfilePhoto;

    public AdminUserListResponse() {}

    public AdminUserListResponse(
            Long id,
            String username,
            String email,
            String fullName,
            String role,
            boolean enabled,
            boolean hasProfilePhoto
    ) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.enabled = enabled;
        this.hasProfilePhoto = hasProfilePhoto;
    }

    public Long getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public boolean isHasProfilePhoto() {
        return hasProfilePhoto;
    }
}
