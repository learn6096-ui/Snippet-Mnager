package com.snipvcs.repository;

import com.snipvcs.model.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.util.Optional;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbc;

    private static final RowMapper<User> USER_ROW_MAPPER = (rs, rowNum) -> {
        User u = new User();
        u.setUserId(rs.getLong("user_id"));
        u.setUsername(rs.getString("username"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        u.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());
        return u;
    };

    public UserRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Insert a new user. Returns the generated user_id.
     */
    public Long insert(String username, String email, String passwordHash) {
        String sql = "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, username);
            ps.setString(2, email);
            ps.setString(3, passwordHash);
            return ps;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    /**
     * Find user by exact email address.
     */
    public Optional<User> findByEmail(String email) {
        String sql = "SELECT user_id, username, email, password_hash, created_at FROM users WHERE email = ?";
        try {
            return Optional.ofNullable(jdbc.queryForObject(sql, USER_ROW_MAPPER, email));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Find user by primary key.
     */
    public Optional<User> findById(Long userId) {
        String sql = "SELECT user_id, username, email, password_hash, created_at FROM users WHERE user_id = ?";
        try {
            return Optional.ofNullable(jdbc.queryForObject(sql, USER_ROW_MAPPER, userId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * Check if a user with the given email or username already exists.
     */
    public boolean existsByEmailOrUsername(String email, String username) {
        String sql = "SELECT COUNT(*) FROM users WHERE email = ? OR username = ?";
        Integer count = jdbc.queryForObject(sql, Integer.class, email, username);
        return count != null && count > 0;
    }
}
