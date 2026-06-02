package com.snipvcs.service;

import com.snipvcs.dto.CreateSnippetRequest;
import com.snipvcs.exception.BusinessRuleViolationException;
import com.snipvcs.exception.ResourceNotFoundException;
import com.snipvcs.model.Snippet;
import com.snipvcs.model.Version;
import com.snipvcs.repository.SnippetRepository;
import com.snipvcs.repository.UserRepository;
import com.snipvcs.repository.VersionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SnippetService {

    private final SnippetRepository snippetRepository;
    private final VersionRepository versionRepository;
    private final UserRepository userRepository;

    public SnippetService(SnippetRepository snippetRepository,
                          VersionRepository versionRepository,
                          UserRepository userRepository) {
        this.snippetRepository = snippetRepository;
        this.versionRepository = versionRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create a new snippet AND its initial version (v1, parent=NULL) in a single
     * ACID transaction. This guarantees both inserts succeed or both roll back.
     */
    @Transactional
    public Snippet createSnippet(CreateSnippetRequest request) {
        // Validate user exists
        userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        // 1. Insert snippet
        Long snippetId = snippetRepository.insert(
                request.getUserId(),
                request.getTitle(),
                request.getProgrammingLanguage(),
                request.getDescription()
        );

        // 2. Insert root version (version_number=1, parent_version_id=NULL)
        String commitMessage = (request.getCommitMessage() != null && !request.getCommitMessage().isBlank())
                ? request.getCommitMessage()
                : "Initial commit";

        versionRepository.insert(
                snippetId,
                null,   // parent_version_id = NULL (root commit)
                1,      // version_number = 1
                request.getCodeContent(),
                commitMessage
        );

        return snippetRepository.findById(snippetId);
    }

    /**
     * Fetch a snippet by ID. Throws if not found.
     */
    @Transactional(readOnly = true)
    public Snippet getSnippetById(Long snippetId) {
        return snippetRepository.findById(snippetId);
    }

    /**
     * Fetch all snippets for a user.
     */
    @Transactional(readOnly = true)
    public List<Snippet> getSnippetsByUserId(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        return snippetRepository.findByUserId(userId);
    }

    /**
     * Delete a snippet (cascades to versions).
     */
    @Transactional
    public void deleteSnippet(Long snippetId) {
        snippetRepository.findById(snippetId);
        snippetRepository.deleteById(snippetId);
    }
}
