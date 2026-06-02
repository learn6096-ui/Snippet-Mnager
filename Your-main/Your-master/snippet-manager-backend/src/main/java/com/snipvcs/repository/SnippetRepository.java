package com.snipvcs.repository;

import com.snipvcs.model.Snippet;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class SnippetRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<Snippet> SNIPPET_ROW_MAPPER = (rs, rowNum) -> {
        Snippet s = new Snippet();
        s.setSnippetId(rs.getLong("snippet_id"));
        s.setUserId(rs.getLong("user_id"));
        s.setTitle(rs.getString("title"));
        s.setProgrammingLanguage(rs.getString("programming_language"));
        s.setDescription(rs.getString("description"));
        s.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return s;
    };

    public SnippetRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Insert a new snippet. Returns the generated snippet_id.
     */
    public Long insert(Long userId, String title, String programmingLanguage, String description) {
        String sql = "INSERT INTO snippets (user_id, title, programming_language, description) VALUES (?, ?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, userId);
            ps.setString(2, title);
            ps.setString(3, programmingLanguage);
            ps.setString(4, description);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    /**
     * Fetch a single snippet by PK.
     */
    public Snippet findById(Long snippetId) {
        String sql = "SELECT snippet_id, user_id, title, programming_language, description, created_at "
                   + "FROM snippets WHERE snippet_id = ?";
        return jdbc.queryForObject(sql, SNIPPET_ROW_MAPPER, snippetId);
    }

    /**
     * Fetch all snippets belonging to a user, newest first.
     */
    public List<Snippet> findByUserId(Long userId) {
        String sql = "SELECT snippet_id, user_id, title, programming_language, description, created_at "
                   + "FROM snippets WHERE user_id = ? ORDER BY created_at DESC";
        return jdbc.query(sql, SNIPPET_ROW_MAPPER, userId);
    }

    /**
     * Delete a snippet (cascades to versions via FK).
     */
    public int deleteById(Long snippetId) {
        return jdbc.update("DELETE FROM snippets WHERE snippet_id = ?", snippetId);
    }
}
