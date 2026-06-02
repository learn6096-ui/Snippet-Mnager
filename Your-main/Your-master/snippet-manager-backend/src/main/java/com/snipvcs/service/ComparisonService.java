package com.snipvcs.service;

import com.snipvcs.dto.ComparisonResponse;
import com.snipvcs.exception.BusinessRuleViolationException;
import com.snipvcs.exception.ResourceNotFoundException;
import com.snipvcs.model.Comparison;
import com.snipvcs.model.Version;
import com.snipvcs.repository.ComparisonRepository;
import com.snipvcs.repository.VersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ComparisonService {

    private final ComparisonRepository comparisonRepository;
    private final VersionRepository versionRepository;

    public ComparisonService(ComparisonRepository comparisonRepository,
                             VersionRepository versionRepository) {
        this.comparisonRepository = comparisonRepository;
        this.versionRepository = versionRepository;
    }

    /**
     * Create a comparison between two versions.
     *
     * Business rules:
     *  - Both versions must exist.
     *  - Both versions must belong to the SAME snippet.
     *  - The two version IDs must be different.
     *  - Logs the comparison into the COMPARISONS table.
     *  - Returns both code contents so a diff engine can analyze them.
     */
    @Transactional
    public ComparisonResponse compareVersions(Long oldVersionId, Long newVersionId) {
        // Validate both versions exist
        Version oldVersion;
        Version newVersion;
        try {
            oldVersion = versionRepository.findById(oldVersionId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Version", oldVersionId);
        }
        try {
            newVersion = versionRepository.findById(newVersionId);
        } catch (Exception e) {
            throw new ResourceNotFoundException("Version", newVersionId);
        }

        // Must not compare a version with itself
        if (oldVersionId.equals(newVersionId)) {
            throw new BusinessRuleViolationException("Cannot compare a version with itself");
        }

        // Both must belong to the same snippet
        if (!oldVersion.getSnippetId().equals(newVersion.getSnippetId())) {
            throw new BusinessRuleViolationException(
                    "Both versions must belong to the same snippet. "
                    + "Old version belongs to snippet " + oldVersion.getSnippetId()
                    + ", new version belongs to snippet " + newVersion.getSnippetId());
        }

        // Log the comparison
        Long comparisonId = comparisonRepository.insert(oldVersionId, newVersionId);

        // Build response with both code contents
        ComparisonResponse response = new ComparisonResponse();
        response.setComparisonId(comparisonId);
        response.setOldVersionId(oldVersionId);
        response.setNewVersionId(newVersionId);
        response.setOldCodeContent(oldVersion.getCodeContent());
        response.setNewCodeContent(newVersion.getCodeContent());
        response.setOldCommitMessage(oldVersion.getCommitMessage());
        response.setNewCommitMessage(newVersion.getCommitMessage());
        response.setComparisonDate(java.time.LocalDateTime.now());

        return response;
    }
}
