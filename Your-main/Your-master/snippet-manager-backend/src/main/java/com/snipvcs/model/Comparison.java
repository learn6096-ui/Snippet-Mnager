package com.snipvcs.model;

import java.time.LocalDateTime;

public class Comparison {

    private Long comparisonId;
    private Long oldVersionId;
    private Long newVersionId;
    private LocalDateTime comparisonDate;

    public Comparison() {}

    public Comparison(Long comparisonId, Long oldVersionId, Long newVersionId, LocalDateTime comparisonDate) {
        this.comparisonId = comparisonId;
        this.oldVersionId = oldVersionId;
        this.newVersionId = newVersionId;
        this.comparisonDate = comparisonDate;
    }

    // --- Getters & Setters ---

    public Long getComparisonId() { return comparisonId; }
    public void setComparisonId(Long comparisonId) { this.comparisonId = comparisonId; }

    public Long getOldVersionId() { return oldVersionId; }
    public void setOldVersionId(Long oldVersionId) { this.oldVersionId = oldVersionId; }

    public Long getNewVersionId() { return newVersionId; }
    public void setNewVersionId(Long newVersionId) { this.newVersionId = newVersionId; }

    public LocalDateTime getComparisonDate() { return comparisonDate; }
    public void setComparisonDate(LocalDateTime comparisonDate) { this.comparisonDate = comparisonDate; }
}
