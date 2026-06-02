package com.snipvcs.repository;

import com.snipvcs.model.Version;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;
import java.util.Optional;

@Repository
public class VersionRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<Version> VERSION_ROW_MAPPER = (rs, rowNum) -> {
        Version v = new Version();
        v.setVersionId(rs.getLong("version_id"));
        v.setSnippetId(rs.getLong("snippet_id"));
        v.setParentVersionId(rs.getLong("parent_version_id"));
        if (rs.wasNull()) v.setParentVersionId(null);
        v.setVersionNumber(rs.getInt("version_number"));
        v.setCodeContent(rs.getString("code_content"));
        v.setCommitMessage(rs.getString("commit_message"));
        v.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return v;
    };

    public VersionRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Insert a new version record. For the root commit, parentVersionId should be NULL.
     * Returns the generated version_id.
     */
    public Long insert(Long snippetId, Long parentVersionId, int versionNumber,
                       String codeContent, String commitMessage) {
        String sql = "INSERT INTO versions (snippet_id, parent_version_id, version_number, code_content, commit_message) "
                   + "VALUES (?, ?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, snippetId);
            if (parentVersionId != null) {
                ps.setLong(2, parentVersionId);
            } else {
                ps.setNull(2, java.sql.Types.BIGINT);
            }
            ps.setInt(3, versionNumber);
            ps.setString(4, codeContent);
            ps.setString(5, commitMessage);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    /**
     * Fetch a single version by PK.
     */
    public Version findById(Long versionId) {
        String sql = "SELECT version_id, snippet_id, parent_version_id, version_number, "
                   + "code_content, commit_message, created_at FROM versions WHERE version_id = ?";
        return jdbc.queryForObject(sql, VERSION_ROW_MAPPER, versionId);
    }

    /**
     * Get all versions for a snippet ordered by version_number ASC (oldest first).
     */
    public List<Version> findBySnippetId(Long snippetId) {
        String sql = "SELECT version_id, snippet_id, parent_version_id, version_number, "
                   + "code_content, commit_message, created_at "
                   + "FROM versions WHERE snippet_id = ? ORDER BY version_number ASC";
        return jdbc.query(sql, VERSION_ROW_MAPPER, snippetId);
    }

    /**
     * Get the latest (highest version_number) version for a snippet.
     */
    public Optional<Version> findLatestBySnippetId(Long snippetId) {
        String sql = "SELECT version_id, snippet_id, parent_version_id, version_number, "
                   + "code_content, commit_message, created_at "
                   + "FROM versions WHERE snippet_id = ? ORDER BY version_number DESC LIMIT 1";
        try {
            return Optional.ofNullable(jdbc.queryForObject(sql, VERSION_ROW_MAPPER, snippetId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Count versions for a snippet (used to calculate next version_number).
     */
    public int countBySnippetId(Long snippetId) {
        String sql = "SELECT COUNT(*) FROM versions WHERE snippet_id = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, snippetId);
        return count != null ? count : 0;
    }

    /**
     * Verify that a version belongs to a given snippet.
     */
    public boolean versionBelongsToSnippet(Long versionId, Long snippetId) {
        String sql = "SELECT COUNT(*) FROM versions WHERE version_id = ? AND snippet_id = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, versionId, snippetId);
        return count != null && count > 0;
    }

    /**
     * Reconstruct the commit history tree for a snippet using a recursive CTE.
     * Walks from the root (parent_version_id IS NULL) down through the chain.
     * Returns versions in chronological order (root first).
     */
    public List<Version> findVersionTree(Long snippetId) {
        String sql = """
            WITH RECURSIVE commit_tree AS (
                -- Anchor: root commits (no parent)
                SELECT version_id, snippet_id, parent_version_id, version_number,
                       code_content, commit_message, created_at
                FROM versions
                WHERE snippet_id = ? AND parent_version_id IS NULL

                UNION ALL

                -- Recursive: children
                SELECT v.version_id, v.snippet_id, v.parent_version_id, v.version_number,
                       v.code_content, v.commit_message, v.created_at
                FROM versions v
                INNER JOIN commit_tree ct ON v.parent_version_id = ct.version_id
                WHERE v.snippet_id = ?
            )
            SELECT * FROM commit_tree ORDER BY version_number ASC
            """;
        return jdbc.query(sql, VERSION_ROW_MAPPER, snippetId, snippetId);
    }
}
