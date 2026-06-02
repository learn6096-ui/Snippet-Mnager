package com.snipvcs.dto;

import jakarta.validation.constraints.NotBlank;

public class CommitVersionRequest {

    @NotBlank(message = "Code content is required")
    private String codeContent;

    @NotBlank(message = "Commit message is required")
    private String commitMessage;

    public CommitVersionRequest() {}

    public String getCodeContent() { return codeContent; }
    public void setCodeContent(String codeContent) { this.codeContent = codeContent; }

    public String getCommitMessage() { return commitMessage; }
    public void setCommitMessage(String commitMessage) { this.commitMessage = commitMessage; }
}
