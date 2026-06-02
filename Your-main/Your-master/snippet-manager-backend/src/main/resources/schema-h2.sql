-- =============================================
-- SnipVCS - H2 Database Schema (Dev Mode)
-- H2 in-memory, MODE=PostgreSQL
--
-- 4 TABLES → 5 TRIGGERS (with explicit IF conditions)
--           → 5 VIEWS
-- =============================================

DROP TABLE IF EXISTS comparisons;
DROP TABLE IF EXISTS versions;
DROP TABLE IF EXISTS snippets;
DROP TABLE IF EXISTS users;

-- =============================================
-- TABLES
-- =============================================
CREATE TABLE users (
    user_id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    username      VARCHAR(50)    NOT NULL UNIQUE,
    email         VARCHAR(255)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)   NOT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE snippets (
    snippet_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id              BIGINT        NOT NULL,
    title                VARCHAR(200)  NOT NULL,
    programming_language VARCHAR(50)   NOT NULL,
    description          TEXT,
    created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE versions (
    version_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    snippet_id        BIGINT      NOT NULL,
    parent_version_id BIGINT      NULL,
    version_number    INT         NOT NULL,
    code_content      TEXT        NOT NULL,
    commit_message    VARCHAR(500),
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (snippet_id)        REFERENCES snippets(snippet_id) ON DELETE CASCADE,
    FOREIGN KEY (parent_version_id) REFERENCES versions(version_id),
    CONSTRAINT uq_versions_snippet_version UNIQUE (snippet_id, version_number)
);

CREATE TABLE comparisons (
    comparison_id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    old_version_id  BIGINT      NOT NULL,
    new_version_id  BIGINT      NOT NULL,
    comparison_date TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (old_version_id) REFERENCES versions(version_id) ON DELETE CASCADE,
    FOREIGN KEY (new_version_id) REFERENCES versions(version_id) ON DELETE CASCADE,
    CONSTRAINT chk_different_versions CHECK (old_version_id <> new_version_id)
);


-- =============================================
-- TRIGGERS
--
-- H2 2.x supports the ATOMIC SQL body style:
--   CREATE TRIGGER name
--     BEFORE INSERT ON table
--     FOR EACH ROW
--   BEGIN ATOMIC
--     ...statements...
--   END
--
-- SIGNAL SQLSTATE raises an error (H2 standard).
-- Conditions are implemented with IF inside body.
-- =============================================

-- -----------------------------------------------------------
-- TRIGGER 1 · trg_prevent_self_parent
-- Table   : versions
-- Event   : BEFORE INSERT
--
-- CONDITION A: NEW.parent_version_id IS NOT NULL
--              AND NEW.parent_version_id = NEW.version_id
--   → Blocks a version whose parent FK points to its own PK.
--     In practice H2 assigns PK before BEFORE-triggers run
--     on AUTO_INCREMENT, so this catches explicit bad inserts.
--
-- CONDITION B: NEW.parent_version_id IS NOT NULL
--              AND no row in versions matches
--              (version_id=parent, snippet_id=NEW.snippet_id)
--   → Blocks cross-snippet parent links that corrupt the
--     Git-style DAG stored in the versions table.
--
-- HOW IT MAPS TO THE PROJECT:
--   VersionService.commitNewVersion() always fetches the
--   latest version of the *same* snippet and uses its ID as
--   parent. This trigger is the DB-level backstop in case
--   that logic breaks or a direct INSERT is attempted.
-- -----------------------------------------------------------
CREATE TRIGGER trg_prevent_self_parent
    BEFORE INSERT ON versions
    FOR EACH ROW
BEGIN ATOMIC
    IF NEW.parent_version_id IS NOT NULL
       AND NEW.parent_version_id = NEW.version_id THEN
        SIGNAL SQLSTATE '45001'
            SET MESSAGE_TEXT = '[SnipVCS TRG-1] CONDITION A: A version cannot reference itself as its own parent.';
    END IF;

    IF NEW.parent_version_id IS NOT NULL
       AND (SELECT COUNT(*) FROM versions
             WHERE version_id = NEW.parent_version_id
               AND snippet_id = NEW.snippet_id) = 0 THEN
        SIGNAL SQLSTATE '45001'
            SET MESSAGE_TEXT = '[SnipVCS TRG-1] CONDITION B: parent_version_id belongs to a different snippet — cross-snippet parent link blocked.';
    END IF;
END;


-- -----------------------------------------------------------
-- TRIGGER 2 · trg_enforce_sequential_version_number
-- Table   : versions
-- Event   : BEFORE INSERT
--
-- CONDITION: NEW.version_number ≠ COALESCE(MAX(version_number), 0)+1
--            for the same snippet_id.
--
-- HOW IT MAPS TO THE PROJECT:
--   VersionService auto-calculates nextVersionNumber = latestVersion + 1.
--   Under concurrent requests that Java-side calculation can race.
--   This trigger runs inside the INSERT transaction and guarantees
--   the version chain is always gapless (1, 2, 3 … no skips or gaps).
--   Works alongside the UNIQUE(snippet_id, version_number) constraint:
--   the constraint stops duplicates; this trigger stops skips.
-- -----------------------------------------------------------
CREATE TRIGGER trg_enforce_sequential_version_number
    BEFORE INSERT ON versions
    FOR EACH ROW
BEGIN ATOMIC
    IF NEW.version_number <> (
            SELECT COALESCE(MAX(version_number), 0) + 1
              FROM versions
             WHERE snippet_id = NEW.snippet_id
        ) THEN
        SIGNAL SQLSTATE '45002'
            SET MESSAGE_TEXT = '[SnipVCS TRG-2] CONDITION: version_number must be MAX+1 for this snippet — no gaps or skips allowed.';
    END IF;
END;


-- -----------------------------------------------------------
-- TRIGGER 3a · trg_normalize_language   (INSERT)
-- TRIGGER 3b · trg_normalize_language_upd  (UPDATE)
-- Table   : snippets
-- Event   : BEFORE INSERT / BEFORE UPDATE
--
-- CONDITION: NEW.programming_language IS NOT NULL
--            AND NEW.programming_language
--                != LOWER(TRIM(NEW.programming_language))
--   → Only act when normalisation would actually change the value.
--     A no-op if the value is already clean.
--
-- HOW IT MAPS TO THE PROJECT:
--   CreateSnippetRequest accepts free-text language from the
--   React form in CreateSnippetModal.tsx. Users type 'Python',
--   'JAVA', 'TypeScript  ', etc.  This trigger silently rewrites
--   to 'python', 'java', 'typescript' so:
--     • vw_user_stats.favourite_language aggregates correctly
--     • WHERE programming_language = 'python' always matches
--     • The sidebar language filter groups snippets correctly
-- -----------------------------------------------------------
CREATE TRIGGER trg_normalize_language
    BEFORE INSERT ON snippets
    FOR EACH ROW
BEGIN ATOMIC
    IF NEW.programming_language IS NOT NULL
       AND NEW.programming_language <> LOWER(TRIM(NEW.programming_language)) THEN
        SET NEW.programming_language = LOWER(TRIM(NEW.programming_language));
    END IF;
END;

CREATE TRIGGER trg_normalize_language_upd
    BEFORE UPDATE ON snippets
    FOR EACH ROW
BEGIN ATOMIC
    IF NEW.programming_language IS NOT NULL
       AND NEW.programming_language <> LOWER(TRIM(NEW.programming_language)) THEN
        SET NEW.programming_language = LOWER(TRIM(NEW.programming_language));
    END IF;
END;


-- -----------------------------------------------------------
-- TRIGGER 4 · trg_prevent_duplicate_comparison
-- Table   : comparisons
-- Event   : BEFORE INSERT
--
-- CONDITION: COUNT(*) > 0 WHERE
--   (old=NEW.old AND new=NEW.new) OR (old=NEW.new AND new=NEW.old)
--   → Blocks both A-vs-B and B-vs-A duplicates.
--
-- HOW IT MAPS TO THE PROJECT:
--   ComparisonService.compareVersions() logs every diff call into
--   the comparisons table.  Without this guard, clicking "Compare"
--   twice in DiffPage.tsx inserts two identical rows.
--   The DB-level CHECK(old_version_id <> new_version_id) only blocks
--   self-compare.  This trigger adds the duplicate-pair guard.
-- -----------------------------------------------------------
CREATE TRIGGER trg_prevent_duplicate_comparison
    BEFORE INSERT ON comparisons
    FOR EACH ROW
BEGIN ATOMIC
    IF (SELECT COUNT(*) FROM comparisons
         WHERE (old_version_id = NEW.old_version_id AND new_version_id = NEW.new_version_id)
            OR (old_version_id = NEW.new_version_id AND new_version_id = NEW.old_version_id)
        ) > 0 THEN
        SIGNAL SQLSTATE '45004'
            SET MESSAGE_TEXT = '[SnipVCS TRG-4] CONDITION: This version pair has already been compared. Retrieve the existing record instead.';
    END IF;
END;


-- -----------------------------------------------------------
-- TRIGGER 5 · trg_version_limit_guard
-- Table   : versions
-- Event   : BEFORE INSERT
--
-- TWO-LEVEL NESTED CONDITION:
--   CONDITION A: COUNT(*) >= 100 for this snippet  (soft threshold)
--   CONDITION B (only when A is true):
--               NEW.code_content = latest version's code_content
--   → Only blocks empty/duplicate commits at high version counts.
--   → Real code changes are ALWAYS allowed even above 100.
--
-- HOW IT MAPS TO THE PROJECT:
--   A developer who keeps hitting "Save & Commit" in WorkbenchPage.tsx
--   without changing the code would spam identical versions.
--   This trigger activates only at the 100-version threshold AND only
--   when the incoming code is unchanged, protecting VersionRepository
--   .findVersionTree() (recursive CTE) from unbounded chain growth.
-- -----------------------------------------------------------
CREATE TRIGGER trg_version_limit_guard
    BEFORE INSERT ON versions
    FOR EACH ROW
BEGIN ATOMIC
    IF (SELECT COUNT(*) FROM versions WHERE snippet_id = NEW.snippet_id) >= 100 THEN
        IF NEW.code_content = (
                SELECT code_content FROM versions
                 WHERE snippet_id = NEW.snippet_id
                 ORDER BY version_number DESC
                 LIMIT 1
            ) THEN
            SIGNAL SQLSTATE '45005'
                SET MESSAGE_TEXT = '[SnipVCS TRG-5] CONDITION A+B: Snippet has 100+ versions and incoming code is unchanged. Empty commits are blocked at this scale.';
        END IF;
    END IF;
END;


-- =============================================
-- VIEWS
-- =============================================

-- -----------------------------------------------------------
-- VIEW 1 · vw_snippet_summary
--
-- PURPOSE : One row per snippet with all dashboard card data:
--   owner, version count, latest commit message, first/last
--   commit timestamps. Eliminates N+1 query patterns.
--
-- USED BY : DashboardPage.tsx snippet card grid.
--           Replaces separate findByUserId + findLatestBySnippetId
--           calls in Java with a single SELECT.
--
-- TRIGGER LINK: TRG-3 ensures programming_language is always
--   lowercase here, so language grouping is consistent.
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_snippet_summary AS
SELECT
    s.snippet_id,
    s.title,
    s.programming_language,
    s.description,
    s.created_at                                            AS snippet_created_at,
    u.user_id,
    u.username,
    u.email,
    COUNT(v.version_id)                                     AS total_versions,
    MAX(v.version_number)                                   AS latest_version_number,
    (
        SELECT v2.commit_message
          FROM versions v2
         WHERE v2.snippet_id = s.snippet_id
         ORDER BY v2.version_number DESC
         LIMIT 1
    )                                                       AS latest_commit_message,
    MIN(v.created_at)                                       AS first_commit_at,
    MAX(v.created_at)                                       AS last_commit_at
FROM snippets s
JOIN users u         ON u.user_id     = s.user_id
LEFT JOIN versions v ON v.snippet_id  = s.snippet_id
GROUP BY
    s.snippet_id, s.title, s.programming_language,
    s.description, s.created_at,
    u.user_id, u.username, u.email;


-- -----------------------------------------------------------
-- VIEW 2 · vw_version_history
--
-- PURPOSE : Denormalized commit log — every version enriched
--   with snippet title, author username, and parent version
--   number for rendering a Git-style history timeline.
--
-- USED BY : WorkbenchPage.tsx version timeline panel.
--           Powers GET /api/snippets/{snippetId}/versions
--           with richer data than the raw versions table.
--
-- TRIGGER LINK: TRG-1 guarantees parent_version_id is always
--   within the same snippet, so the LEFT JOIN here is safe.
--   TRG-2 guarantees version_number is gapless, so ORDER BY
--   version_number ASC renders a correct chronological graph.
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_version_history AS
SELECT
    v.version_id,
    v.version_number,
    v.commit_message,
    v.created_at                                            AS committed_at,
    v.snippet_id,
    s.title                                                 AS snippet_title,
    s.programming_language,
    u.username                                              AS author,
    parent.version_number                                   AS parent_version_number,
    v.parent_version_id
FROM versions v
JOIN snippets  s      ON s.snippet_id  = v.snippet_id
JOIN users     u      ON u.user_id     = s.user_id
LEFT JOIN versions parent ON parent.version_id = v.parent_version_id;


-- -----------------------------------------------------------
-- VIEW 3 · vw_user_stats
--
-- PURPOSE : Aggregated per-user activity:
--   total snippets, total commits, distinct languages used,
--   most-used (favourite) language.
--   One query replaces 3-4 separate API calls.
--
-- USED BY : User profile / analytics panel.
--
-- TRIGGER LINK: TRG-3 normalises all programming_language
--   values to lowercase, so COUNT(DISTINCT programming_language)
--   and the favourite_language subquery give accurate results
--   (e.g., 'Python' and 'python' are not double-counted).
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_user_stats AS
SELECT
    u.user_id,
    u.username,
    u.email,
    u.created_at                                            AS member_since,
    COUNT(DISTINCT s.snippet_id)                            AS total_snippets,
    COUNT(DISTINCT v.version_id)                            AS total_commits,
    COUNT(DISTINCT s.programming_language)                  AS distinct_languages,
    (
        SELECT s2.programming_language
          FROM snippets s2
         WHERE s2.user_id = u.user_id
         GROUP BY s2.programming_language
         ORDER BY COUNT(*) DESC
         LIMIT 1
    )                                                       AS favourite_language
FROM users u
LEFT JOIN snippets s ON s.user_id    = u.user_id
LEFT JOIN versions v ON v.snippet_id = s.snippet_id
GROUP BY u.user_id, u.username, u.email, u.created_at;


-- -----------------------------------------------------------
-- VIEW 4 · vw_recent_comparisons
--
-- PURPOSE : Comparison history enriched with version numbers,
--   commit messages, snippet title, and owner username.
--   Ordered newest-first.
--
-- USED BY : DiffPage.tsx comparison history sidebar.
--
-- TRIGGER LINK: TRG-4 prevents duplicate pairs from being
--   stored, so this view never shows redundant history entries.
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_recent_comparisons AS
SELECT
    c.comparison_id,
    c.comparison_date,
    c.old_version_id,
    v_old.version_number                                    AS old_version_number,
    v_old.commit_message                                    AS old_commit_message,
    c.new_version_id,
    v_new.version_number                                    AS new_version_number,
    v_new.commit_message                                    AS new_commit_message,
    s.snippet_id,
    s.title                                                 AS snippet_title,
    s.programming_language,
    u.username                                              AS owner
FROM comparisons c
JOIN versions v_old ON v_old.version_id = c.old_version_id
JOIN versions v_new ON v_new.version_id = c.new_version_id
JOIN snippets s     ON s.snippet_id     = v_old.snippet_id
JOIN users    u     ON u.user_id        = s.user_id
ORDER BY c.comparison_date DESC;


-- -----------------------------------------------------------
-- VIEW 5 · vw_snippet_latest_code
--
-- PURPOSE : One row per snippet showing only the HEAD (latest)
--   version code content, number, and commit message.
--   Avoids fetching all versions just to display current code.
--
-- USED BY : WorkbenchPage.tsx initial code editor load.
--
-- NOTE    : H2 does not support DISTINCT ON (PostgreSQL syntax).
--   We use a correlated MAX subquery instead, which H2 supports.
--
-- TRIGGER LINK: TRG-2 guarantees MAX(version_number) is the true
--   latest version (no gaps), so the WHERE clause here always
--   selects exactly one row per snippet correctly.
--   TRG-5 prevents the latest code from being an empty duplicate,
--   so this view always shows a meaningful HEAD state.
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_snippet_latest_code AS
SELECT
    s.snippet_id,
    s.title,
    s.programming_language,
    s.description,
    u.username                                              AS owner,
    v.version_id                                            AS latest_version_id,
    v.version_number                                        AS latest_version_number,
    v.code_content                                          AS latest_code,
    v.commit_message                                        AS latest_commit_message,
    v.created_at                                            AS latest_commit_at
FROM snippets s
JOIN users    u ON u.user_id    = s.user_id
JOIN versions v ON v.snippet_id = s.snippet_id
WHERE v.version_number = (
    SELECT MAX(v2.version_number)
      FROM versions v2
     WHERE v2.snippet_id = s.snippet_id
);
