package com.snipvcs.repository;

import com.snipvcs.model.Comparison;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.List;

@Repository
public class ComparisonRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<Comparison> COMPARISON_ROW_MAPPER = (rs, rowNum) -> {
        Comparison c = new Comparison();
        c.setComparisonId(rs.getLong("comparison_id"));
        c.setOldVersionId(rs.getLong("old_version_id"));
        c.setNewVersionId(rs.getLong("new_version_id"));
        c.setComparisonDate(rs.getTimestamp("comparison_date").toLocalDateTime());
        return c;
    };

    public ComparisonRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Log a new comparison entry. Returns the generated comparison_id.
     */
    public Long insert(Long oldVersionId, Long newVersionId) {
        String sql = "INSERT INTO comparisons (old_version_id, new_version_id) VALUES (?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setLong(1, oldVersionId);
            ps.setLong(2, newVersionId);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    /**
     * Fetch all comparisons involving a specific snippet's versions.
     */
    public List<Comparison> findBySnippetId(Long snippetId) {
        String sql = """
            SELECT c.comparison_id, c.old_version_id, c.new_version_id, c.comparison_date
            FROM comparisons c
            INNER JOIN versions v_old ON c.old_version_id = v_old.version_id
            INNER JOIN versions v_new ON c.new_version_id = v_new.version_id
            WHERE v_old.snippet_id = ? OR v_new.snippet_id = ?
            ORDER BY c.comparison_date DESC
            """;
        return jdbc.query(sql, COMPARISON_ROW_MAPPER, snippetId, snippetId);
    }
}
