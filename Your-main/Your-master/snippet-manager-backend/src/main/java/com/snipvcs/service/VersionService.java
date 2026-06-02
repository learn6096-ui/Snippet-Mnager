package com.snipvcs.service;

import com.snipvcs.dto.CommitVersionRequest;
import com.snipvcs.exception.BusinessRuleViolationException;
import com.snipvcs.exception.ResourceNotFoundException;
import com.snipvcs.model.Version;
import com.snipvcs.repository.SnippetRepository;
import com.snipvcs.repository.VersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VersionService {

    private final VersionRepository versionRepository;
    private final SnippetRepository snippetRepository;

    public VersionService(VersionRepository versionRepository, SnippetRepository snippetRepository) {
        this.versionRepository = versionRepository;
        this.snippetRepository = snippetRepository;
    }

    /**
     * Commit a new version for a snippet.
     *
     * Business rules:
     *  - The snippet must exist.
     *  - The latest version is fetched automatically as the parent.
     *  - version_number is auto-incremented.
     *  - parent_version_id points to the previous version (self-referencing FK).
     */
    @Transactional
    public Version commitNewVersion(Long snippetId, CommitVersionRequest request) {
        // Verify snippet exists
        snippetRepository.findById(snippetId);

        // Fetch the latest version to determine parent and next version number
        Version latestVersion = versionRepository.findLatestBySnippetId(snippetId)
                .orElseThrow(() -> new BusinessRuleViolationException(
                        "Snippet has no versions. Create a snippet first to get an initial version."));

        int nextVersionNumber = latestVersion.getVersionNumber() + 1;
        Long parentVersionId = latestVersion.getVersionId();

        Long newVersionId = versionRepository.insert(
                snippetId,
                parentVersionId,
                nextVersionNumber,
                request.getCodeContent(),
                request.getCommitMessage()
        );

        return versionRepository.findById(newVersionId);
    }

    /**
     * Get the full commit history for a snippet using the recursive CTE.
     * Returns versions in chronological order (root first).
     */
    @Transactional(readOnly = true)
    public List<Version> getVersionHistory(Long snippetId) {
        snippetRepository.findById(snippetId);
        return versionRepository.findVersionTree(snippetId);
    }

    /**
     * Get a specific version by its ID.
     */
    @Transactional(readOnly = true)
    public Version getVersionById(Long versionId) {
        return versionRepository.findById(versionId);
    }
}
