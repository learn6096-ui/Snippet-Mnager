package com.snipvcs.dto;

import com.snipvcs.model.Comparison;
import java.time.LocalDateTime;

public class ComparisonResponse {

    private Long comparisonId;
    private Long oldVersionId;
    private Long newVersionId;
    private String oldCodeContent;
    private String newCodeContent;
    private String oldCommitMessage;
    private String newCommitMessage;
    private LocalDateTime comparisonDate;

    public ComparisonResponse() {}

    // --- Getters & Setters ---

    public Long getComparisonId() { return comparisonId; }
    public void setComparisonId(Long comparisonId) { this.comparisonId = comparisonId; }

    public Long getOldVersionId() { return oldVersionId; }
    public void setOldVersionId(Long oldVersionId) { this.oldVersionId = oldVersionId; }

    public Long getNewVersionId() { return newVersionId; }
    public void setNewVersionId(Long newVersionId) { this.newVersionId = newVersionId; }

    public String getOldCodeContent() { return oldCodeContent; }
    public void setOldCodeContent(String oldCodeContent) { this.oldCodeContent = oldCodeContent; }

    public String getNewCodeContent() { return newCodeContent; }
    public void setNewCodeContent(String newCodeContent) { this.newCodeContent = newCodeContent; }

    public String getOldCommitMessage() { return oldCommitMessage; }
    public void setOldCommitMessage(String oldCommitMessage) { this.oldCommitMessage = oldCommitMessage; }

    public String getNewCommitMessage() { return newCommitMessage; }
    public void setNewCommitMessage(String newCommitMessage) { this.newCommitMessage = newCommitMessage; }

    public LocalDateTime getComparisonDate() { return comparisonDate; }
    public void setComparisonDate(LocalDateTime comparisonDate) { this.comparisonDate = comparisonDate; }
}
