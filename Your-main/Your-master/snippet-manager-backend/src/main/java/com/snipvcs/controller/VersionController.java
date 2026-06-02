package com.snipvcs.controller;

import com.snipvcs.dto.CommitVersionRequest;
import com.snipvcs.model.Version;
import com.snipvcs.service.VersionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snippets")
public class VersionController {

    private final VersionService versionService;

    public VersionController(VersionService versionService) {
        this.versionService = versionService;
    }

    /**
     * POST /api/snippets/{snippetId}/versions
     * Commit a new version. The parent is automatically resolved
     * as the current latest version of the snippet.
     */
    @PostMapping("/{snippetId}/versions")
    public ResponseEntity<Version> commitVersion(
            @PathVariable Long snippetId,
            @Valid @RequestBody CommitVersionRequest request) {
        Version version = versionService.commitNewVersion(snippetId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(version);
    }

    /**
     * GET /api/snippets/{snippetId}/versions
     * Get the full commit history for a snippet (recursive CTE tree walk).
     * Returns versions in chronological order (root first).
     */
    @GetMapping("/{snippetId}/versions")
    public ResponseEntity<List<Version>> getVersionHistory(@PathVariable Long snippetId) {
        List<Version> versions = versionService.getVersionHistory(snippetId);
        return ResponseEntity.ok(versions);
    }

    /**
     * GET /api/snippets/versions/{versionId}
     * Get a specific version's code content by version ID.
     */
    @GetMapping("/versions/{versionId}")
    public ResponseEntity<Version> getVersionById(@PathVariable Long versionId) {
        Version version = versionService.getVersionById(versionId);
        return ResponseEntity.ok(version);
    }
}
