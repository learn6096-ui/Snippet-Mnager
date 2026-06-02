package com.snipvcs.controller;

import com.snipvcs.dto.CreateSnippetRequest;
import com.snipvcs.model.Snippet;
import com.snipvcs.service.SnippetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/snippets")
public class SnippetController {

    private final SnippetService snippetService;

    public SnippetController(SnippetService snippetService) {
        this.snippetService = snippetService;
    }

    /**
     * POST /api/snippets
     * Create a new snippet with its initial version (v1) in a single transaction.
     */
    @PostMapping
    public ResponseEntity<Snippet> createSnippet(@Valid @RequestBody CreateSnippetRequest request) {
        Snippet snippet = snippetService.createSnippet(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(snippet);
    }

    /**
     * GET /api/snippets/user/{userId}
     * Get all snippets belonging to a user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Snippet>> getSnippetsByUser(@PathVariable Long userId) {
        List<Snippet> snippets = snippetService.getSnippetsByUserId(userId);
        return ResponseEntity.ok(snippets);
    }

    /**
     * GET /api/snippets/{snippetId}
     * Get a single snippet by ID.
     */
    @GetMapping("/{snippetId}")
    public ResponseEntity<Snippet> getSnippet(@PathVariable Long snippetId) {
        Snippet snippet = snippetService.getSnippetById(snippetId);
        return ResponseEntity.ok(snippet);
    }
}
