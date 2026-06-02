package com.snipvcs.model;

import java.time.LocalDateTime;

public class Snippet {

    private Long snippetId;
    private Long userId;
    private String title;
    private String programmingLanguage;
    private String description;
    private LocalDateTime createdAt;

    public Snippet() {}

    public Snippet(Long snippetId, Long userId, String title, String programmingLanguage,
                   String description, LocalDateTime createdAt) {
        this.snippetId = snippetId;
        this.userId = userId;
        this.title = title;
        this.programmingLanguage = programmingLanguage;
        this.description = description;
        this.createdAt = createdAt;
    }

    // --- Getters & Setters ---

    public Long getSnippetId() { return snippetId; }
    public void setSnippetId(Long snippetId) { this.snippetId = snippetId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProgrammingLanguage() { return programmingLanguage; }
    public void setProgrammingLanguage(String programmingLanguage) { this.programmingLanguage = programmingLanguage; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
