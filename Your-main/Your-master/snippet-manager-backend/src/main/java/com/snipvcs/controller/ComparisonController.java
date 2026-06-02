package com.snipvcs.controller;

import com.snipvcs.dto.ComparisonResponse;
import com.snipvcs.service.ComparisonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comparisons")
public class ComparisonController {

    private final ComparisonService comparisonService;

    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    /**
     * POST /api/comparisons?old={oldVersionId}&new={newVersionId}
     *
     * Log a version comparison. Validates both versions belong to the same snippet,
     * records the comparison, and returns both code strings for diff analysis.
     */
    @PostMapping
    public ResponseEntity<ComparisonResponse> compareVersions(
            @RequestParam("old") Long oldVersionId,
            @RequestParam("new") Long newVersionId) {
        ComparisonResponse response = comparisonService.compareVersions(oldVersionId, newVersionId);
        return ResponseEntity.ok(response);
    }
}
