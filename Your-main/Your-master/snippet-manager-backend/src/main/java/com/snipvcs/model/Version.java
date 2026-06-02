package com.snipvcs.model;

import java.time.LocalDateTime;

public class Version {

    private Long versionId;
    private Long snippetId;
    private Long parentVersionId;   // NULL for root commit
    private int versionNumber;
    private String codeContent;
    private String commitMessage;
    private LocalDateTime createdAt;

    public Version() {}

    public Version(Long versionId, Long snippetId, Long parentVersionId, int versionNumber,
                   String codeContent, String commitMessage, LocalDateTime createdAt) {
        this.versionId = versionId;
        this.snippetId = snippetId;
        this.parentVersionId = parentVersionId;
        this.versionNumber = versionNumber;
        this.codeContent = codeContent;
        this.commitMessage = commitMessage;
        this.createdAt = createdAt;
    }

    // --- Getters & Setters ---

    public Long getVersionId() { return versionId; }
    public void setVersionId(Long versionId) { this.versionId = versionId; }

    public Long getSnippetId() { return snippetId; }
    public void setSnippetId(Long snippetId) { this.snippetId = snippetId; }

    public Long getParentVersionId() { return parentVersionId; }
    public void setParentVersionId(Long parentVersionId) { this.parentVersionId = parentVersionId; }

    public int getVersionNumber() { return versionNumber; }
    public void setVersionNumber(int versionNumber) { this.versionNumber = versionNumber; }

    public String getCodeContent() { return codeContent; }
    public void setCodeContent(String codeContent) { this.codeContent = codeContent; }

    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
