-- =============================================
-- SnipVCS - Database Schema (PostgreSQL)
-- Highly normalized PostgreSQL schema for a
-- Code Snippet Manager with Mini Git versioning.
--
-- Includes:
--   5 VIEWS  : analytical + convenience queries
--   5 TRIGGERS (with conditions): data integrity + business rules
-- =============================================

-- Clean slate (order matters for FK constraints)
DROP TABLE IF EXISTS comparisons CASCADE;
DROP TABLE IF EXISTS versions    CASCADE;
DROP TABLE IF EXISTS snippets    CASCADE;
DROP TABLE IF EXISTS users       CASCADE;

-- =============================================
-- TABLES
-- =============================================

-- -------------------------------------------
-- USERS
-- -------------------------------------------
CREATE TABLE users (
    user_id       BIGSERIAL      PRIMARY KEY,
    username      VARCHAR(50)    NOT NULL UNIQUE,
    email         VARCHAR(255)   NOT NULL UNIQUE,
    password_hash VARCHAR(255)   NOT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email    ON users (email);
CREATE INDEX idx_users_username ON users (username);

-- -------------------------------------------
-- SNIPPETS
-- -------------------------------------------
CREATE TABLE snippets (
    snippet_id           BIGSERIAL     PRIMARY KEY,
    user_id              BIGINT        NOT NULL
                           REFERENCES users (user_id) ON DELETE CASCADE,
    title                VARCHAR(200)  NOT NULL,
    programming_language VARCHAR(50)   NOT NULL,
    description          TEXT,
    created_at           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_snippets_user_id ON snippets (user_id);

-- -------------------------------------------
-- VERSIONS  (The Git Commit Engine)
-- -------------------------------------------
CREATE TABLE versions (
    version_id        BIGSERIAL   PRIMARY KEY,
    snippet_id        BIGINT      NOT NULL
                        REFERENCES snippets (snippet_id) ON DELETE CASCADE,
    parent_version_id BIGINT      NULL
                        REFERENCES versions (version_id) ON DELETE SET NULL,
    version_number    INT         NOT NULL,
    code_content      TEXT        NOT NULL,
    commit_message    VARCHAR(500),
    created_at        TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Each version number is unique per snippet
    CONSTRAINT uq_versions_snippet_version
        UNIQUE (snippet_id, version_number)
);

CREATE INDEX idx_versions_snippet_id ON versions (snippet_id);
CREATE INDEX idx_versions_parent     ON versions (parent_version_id);

-- -------------------------------------------
-- COMPARISONS
-- -------------------------------------------
CREATE TABLE comparisons (
    comparison_id   BIGSERIAL   PRIMARY KEY,
    old_version_id  BIGINT      NOT NULL
                      REFERENCES versions (version_id) ON DELETE CASCADE,
    new_version_id  BIGINT      NOT NULL
                      REFERENCES versions (version_id) ON DELETE CASCADE,
    comparison_date TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Prevent comparing a version with itself
    CONSTRAINT chk_different_versions
        CHECK (old_version_id <> new_version_id)
);

CREATE INDEX idx_comparisons_old ON comparisons (old_version_id);
CREATE INDEX idx_comparisons_new ON comparisons (new_version_id);


-- =============================================
-- TRIGGER FUNCTIONS
-- =============================================

-- -----------------------------------------------------------
-- TF-1: trg_fn_prevent_self_parent
--
-- CONDITION: NEW.parent_version_id IS NOT NULL
--            AND NEW.parent_version_id = NEW.version_id
--
-- PURPOSE: In Git every commit knows its parent.  Postgres
--   assigns the PK (version_id) BEFORE the BEFORE-trigger
--   runs on BIGSERIAL, so we block the insert if the caller
--   somehow passes its own future ID as the parent.
--   Also blocks cases where parent belongs to a DIFFERENT
--   snippet — cross-snippet parent links break the commit tree.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_prevent_self_parent()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- CONDITION 1: explicit self-reference
    IF NEW.parent_version_id IS NOT NULL
       AND NEW.parent_version_id = NEW.version_id THEN
        RAISE EXCEPTION
            '[SnipVCS] TRIGGER trg_prevent_self_parent: '
            'version_id % cannot reference itself as parent.',
            NEW.version_id;
    END IF;

    -- CONDITION 2: parent belongs to a different snippet
    IF NEW.parent_version_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM versions
            WHERE version_id = NEW.parent_version_id
              AND snippet_id  = NEW.snippet_id          -- must be same snippet
        ) THEN
            RAISE EXCEPTION
                '[SnipVCS] TRIGGER trg_prevent_self_parent: '
                'parent_version_id % does not belong to snippet %.',
                NEW.parent_version_id, NEW.snippet_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_self_parent
    BEFORE INSERT OR UPDATE ON versions
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_prevent_self_parent();

-- COMMENT for documentation
COMMENT ON TRIGGER trg_prevent_self_parent ON versions IS
'Blocks self-referencing parent_version_id and cross-snippet parent links.
CONDITION: fires on EVERY insert/update but only raises if parent_version_id
is non-null and violates either constraint.';


-- -----------------------------------------------------------
-- TF-2: trg_fn_enforce_sequential_version_number
--
-- CONDITION: NEW.version_number <> (max_existing_version + 1)
--            AND at least one version already exists for the snippet
--
-- PURPOSE: Mimic Git commit numbering — each new version must be
--   exactly max(version_number)+1 for its snippet.  For the very
--   first version (no rows yet) the number must be 1.
--   This prevents gaps (1,3,5) and out-of-order writes.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_enforce_sequential_version_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    max_ver INT;
    expected INT;
BEGIN
    SELECT COALESCE(MAX(version_number), 0)
      INTO max_ver
      FROM versions
     WHERE snippet_id = NEW.snippet_id;

    expected := max_ver + 1;

    -- CONDITION: version_number is not the expected next value
    IF NEW.version_number <> expected THEN
        RAISE EXCEPTION
            '[SnipVCS] TRIGGER trg_enforce_sequential_version_number: '
            'Expected version_number % for snippet %, got %.',
            expected, NEW.snippet_id, NEW.version_number;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_enforce_sequential_version_number
    BEFORE INSERT ON versions
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_enforce_sequential_version_number();

COMMENT ON TRIGGER trg_enforce_sequential_version_number ON versions IS
'Ensures version_number is always MAX+1 per snippet (no gaps, no skips).
CONDITION: raises if NEW.version_number != current_max + 1.';


-- -----------------------------------------------------------
-- TF-3: trg_fn_normalize_language
--
-- CONDITION: NEW.programming_language IS NOT NULL
--            AND NEW.programming_language <> LOWER(NEW.programming_language)
--            (i.e. only acts when casing would actually change)
--
-- PURPOSE: Store programming language in lowercase so queries
--   like WHERE programming_language = 'python' always work
--   regardless of whether the client sent 'Python', 'PYTHON',
--   or 'PyThOn'.  Trim leading/trailing whitespace too.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_normalize_language()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- CONDITION: only normalize when value needs to change
    IF NEW.programming_language IS NOT NULL
       AND NEW.programming_language <> LOWER(TRIM(NEW.programming_language)) THEN

        NEW.programming_language := LOWER(TRIM(NEW.programming_language));
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_normalize_language
    BEFORE INSERT OR UPDATE OF programming_language ON snippets
    FOR EACH ROW
    -- PostgreSQL WHEN clause = built-in trigger condition guard
    WHEN (NEW.programming_language IS NOT NULL
          AND NEW.programming_language <> LOWER(TRIM(NEW.programming_language)))
    EXECUTE FUNCTION trg_fn_normalize_language();

COMMENT ON TRIGGER trg_normalize_language ON snippets IS
'Normalises programming_language to lowercase + trimmed on INSERT and UPDATE.
CONDITION (WHEN clause): only fires rows where the value is not already normalised,
avoiding no-op executions.';


-- -----------------------------------------------------------
-- TF-4: trg_fn_prevent_duplicate_comparison
--
-- CONDITION: A row already exists in comparisons where
--   (old_version_id, new_version_id) OR
--   (new_version_id, old_version_id) already matches the NEW pair.
--   (duplicate regardless of direction)
--
-- PURPOSE: Comparing V1 vs V2 and then V2 vs V1 within the
--   same session is redundant and bloats the comparisons table.
--   This trigger blocks duplicate pairs in either direction.
--   Note: The DB-level CHECK only blocks self-compare; this
--   trigger adds the duplicate-pair guard.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_prevent_duplicate_comparison()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    dup_count INT;
BEGIN
    SELECT COUNT(*)
      INTO dup_count
      FROM comparisons
     WHERE (old_version_id = NEW.old_version_id AND new_version_id = NEW.new_version_id)
        OR (old_version_id = NEW.new_version_id AND new_version_id = NEW.old_version_id);

    -- CONDITION: at least one identical or mirrored pair found
    IF dup_count > 0 THEN
        RAISE EXCEPTION
            '[SnipVCS] TRIGGER trg_prevent_duplicate_comparison: '
            'Comparison between version % and version % already exists.',
            NEW.old_version_id, NEW.new_version_id
            USING HINT = 'Retrieve the existing comparison instead of creating a duplicate.';
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_duplicate_comparison
    BEFORE INSERT ON comparisons
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_prevent_duplicate_comparison();

COMMENT ON TRIGGER trg_prevent_duplicate_comparison ON comparisons IS
'Blocks duplicate comparison pairs (A vs B or B vs A).
CONDITION: raises if a matching or mirrored pair already exists in the table.';


-- -----------------------------------------------------------
-- TF-5: trg_fn_version_limit_guard
--
-- CONDITION: The snippet already has >= 100 versions
--            AND the incoming code_content is identical to the
--            latest version's code_content  (empty commit)
--
-- PURPOSE: Two-part guard —
--   (a) At 100+ versions, reject completely empty commits
--       (same code, no real change) to avoid version spam.
--   (b) This is intentionally lenient: real code changes are
--       always allowed regardless of version count so developers
--       never get blocked.  Only pointless duplicate commits at
--       high version counts are blocked.
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION trg_fn_version_limit_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    ver_count   INT;
    latest_code TEXT;
BEGIN
    SELECT COUNT(*)
      INTO ver_count
      FROM versions
     WHERE snippet_id = NEW.snippet_id;

    -- CONDITION: only check when snippet has reached the soft limit
    IF ver_count >= 100 THEN
        -- Fetch the latest version's code content
        SELECT code_content
          INTO latest_code
          FROM versions
         WHERE snippet_id = NEW.snippet_id
         ORDER BY version_number DESC
         LIMIT 1;

        -- CONDITION: block only if code is unchanged (empty/duplicate commit)
        IF NEW.code_content = latest_code THEN
            RAISE EXCEPTION
                '[SnipVCS] TRIGGER trg_version_limit_guard: '
                'Snippet % already has % versions. '
                'Empty commits (identical code) are not allowed at this scale. '
                'Make a real change or archive old versions first.',
                NEW.snippet_id, ver_count
                USING HINT = 'Change the code_content to commit a meaningful version.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_version_limit_guard
    BEFORE INSERT ON versions
    FOR EACH ROW
    EXECUTE FUNCTION trg_fn_version_limit_guard();

COMMENT ON TRIGGER trg_version_limit_guard ON versions IS
'At 100+ versions per snippet, blocks duplicate/empty commits (same code content).
CONDITION: fires only when COUNT(*) >= 100 AND new code = latest code.
Real code changes are always allowed.';


-- =============================================
-- VIEWS
-- =============================================

-- -----------------------------------------------------------
-- VIEW 1: vw_snippet_summary
--
-- PURPOSE: One-stop dashboard row per snippet showing:
--   - snippet metadata (owner, language, title)
--   - total number of committed versions
--   - latest version number and its commit message
--   - date of the very first commit (snippet age)
--
-- USED BY: DashboardPage.tsx — the snippet card list
--          GET /api/snippets/user/{userId}  (could replace
--          the plain SELECT with this view for richer data)
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_snippet_summary AS
SELECT
    s.snippet_id,
    s.title,
    s.programming_language,
    s.description,
    s.created_at                                        AS snippet_created_at,
    u.user_id,
    u.username,
    u.email,
    COUNT(v.version_id)                                 AS total_versions,
    MAX(v.version_number)                               AS latest_version_number,
    -- Subquery to get the commit message of the latest version
    (
        SELECT commit_message
          FROM versions v2
         WHERE v2.snippet_id = s.snippet_id
         ORDER BY v2.version_number DESC
         LIMIT 1
    )                                                   AS latest_commit_message,
    MIN(v.created_at)                                   AS first_commit_at,
    MAX(v.created_at)                                   AS last_commit_at
FROM snippets s
JOIN users    u ON u.user_id = s.user_id
LEFT JOIN versions v ON v.snippet_id = s.snippet_id
GROUP BY
    s.snippet_id, s.title, s.programming_language,
    s.description, s.created_at,
    u.user_id, u.username, u.email;

COMMENT ON VIEW vw_snippet_summary IS
'Per-snippet summary: owner info, version count, latest commit message,
first and last commit timestamps. Used for dashboard snippet cards.';


-- -----------------------------------------------------------
-- VIEW 2: vw_version_history
--
-- PURPOSE: Full denormalized version history combining:
--   - version metadata
--   - snippet title + language
--   - owner username
--   - parent version number (for visualising the commit chain)
--
-- USED BY: WorkbenchPage.tsx — the version timeline panel
--          GET /api/snippets/{snippetId}/versions  (enriched)
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_version_history AS
SELECT
    v.version_id,
    v.version_number,
    v.commit_message,
    v.created_at                                AS committed_at,
    v.snippet_id,
    s.title                                     AS snippet_title,
    s.programming_language,
    u.username                                  AS author,
    parent.version_number                       AS parent_version_number,
    v.parent_version_id,
    -- Depth in the commit chain (root = 1, each child +1)
    -- Useful for rendering a visual git graph
    (
        WITH RECURSIVE depth_cte AS (
            SELECT version_id, parent_version_id, 1 AS depth
            FROM versions
            WHERE snippet_id = v.snippet_id AND parent_version_id IS NULL
            UNION ALL
            SELECT ch.version_id, ch.parent_version_id, d.depth + 1
            FROM versions ch
            JOIN depth_cte d ON ch.parent_version_id = d.version_id
            WHERE ch.snippet_id = v.snippet_id
        )
        SELECT depth FROM depth_cte WHERE version_id = v.version_id
    )                                           AS commit_depth
FROM versions v
JOIN snippets  s      ON s.snippet_id = v.snippet_id
JOIN users     u      ON u.user_id    = s.user_id
LEFT JOIN versions parent ON parent.version_id = v.parent_version_id;

COMMENT ON VIEW vw_version_history IS
'Denormalized version history with author, snippet context, parent version number,
and recursive commit depth for git-graph visualisation.';


-- -----------------------------------------------------------
-- VIEW 3: vw_user_stats
--
-- PURPOSE: Activity dashboard per user:
--   - how many snippets they own
--   - total commits across all their snippets
--   - number of distinct programming languages used
--   - their most-used language
--   - how many comparisons they have triggered
--
-- USED BY: Could power a user profile / analytics panel
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_user_stats AS
SELECT
    u.user_id,
    u.username,
    u.email,
    u.created_at                                        AS member_since,
    COUNT(DISTINCT s.snippet_id)                        AS total_snippets,
    COUNT(DISTINCT v.version_id)                        AS total_commits,
    COUNT(DISTINCT s.programming_language)              AS distinct_languages,
    -- Most used language (mode)
    (
        SELECT programming_language
          FROM snippets s2
         WHERE s2.user_id = u.user_id
         GROUP BY programming_language
         ORDER BY COUNT(*) DESC
         LIMIT 1
    )                                                   AS favourite_language,
    -- Total comparisons involving their snippets' versions
    (
        SELECT COUNT(*)
          FROM comparisons c
          JOIN versions  vc_old ON vc_old.version_id = c.old_version_id
          JOIN snippets  sc_old ON sc_old.snippet_id = vc_old.snippet_id
         WHERE sc_old.user_id = u.user_id
    )                                                   AS total_comparisons
FROM users u
LEFT JOIN snippets s ON s.user_id = u.user_id
LEFT JOIN versions v ON v.snippet_id = s.snippet_id
GROUP BY u.user_id, u.username, u.email, u.created_at;

COMMENT ON VIEW vw_user_stats IS
'Aggregated user activity: snippet count, total commits, distinct languages,
favourite language, and total diff comparisons triggered.';


-- -----------------------------------------------------------
-- VIEW 4: vw_recent_comparisons
--
-- PURPOSE: Last 500 comparisons enriched with:
--   - both version numbers
--   - both commit messages
--   - snippet title and owner username
--   - comparison timestamp
--
-- USED BY: DiffPage.tsx — comparison history sidebar
--          GET /api/comparisons  (history feed)
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_recent_comparisons AS
SELECT
    c.comparison_id,
    c.comparison_date,
    -- Old version side
    c.old_version_id,
    v_old.version_number                        AS old_version_number,
    v_old.commit_message                        AS old_commit_message,
    -- New version side
    c.new_version_id,
    v_new.version_number                        AS new_version_number,
    v_new.commit_message                        AS new_commit_message,
    -- Snippet context
    s.snippet_id,
    s.title                                     AS snippet_title,
    s.programming_language,
    u.username                                  AS owner
FROM comparisons c
JOIN versions v_old ON v_old.version_id = c.old_version_id
JOIN versions v_new ON v_new.version_id = c.new_version_id
JOIN snippets s     ON s.snippet_id     = v_old.snippet_id
JOIN users    u     ON u.user_id        = s.user_id
ORDER BY c.comparison_date DESC;

COMMENT ON VIEW vw_recent_comparisons IS
'Comparison history enriched with version numbers, commit messages,
snippet title, and owner. Ordered newest-first.';


-- -----------------------------------------------------------
-- VIEW 5: vw_snippet_latest_code
--
-- PURPOSE: For each snippet, return ONLY the latest version's
--   code content and metadata.  Avoids the "fetch all versions,
--   pick the last" pattern in Java code.
--
-- USED BY: WorkbenchPage.tsx — code editor initial load
--          Any API endpoint that needs the HEAD state of a snippet
-- -----------------------------------------------------------
CREATE OR REPLACE VIEW vw_snippet_latest_code AS
SELECT DISTINCT ON (s.snippet_id)
    s.snippet_id,
    s.title,
    s.programming_language,
    s.description,
    u.username                                  AS owner,
    v.version_id                                AS latest_version_id,
    v.version_number                            AS latest_version_number,
    v.code_content                              AS latest_code,
    v.commit_message                            AS latest_commit_message,
    v.created_at                                AS latest_commit_at
FROM snippets s
JOIN users    u ON u.user_id    = s.user_id
JOIN versions v ON v.snippet_id = s.snippet_id
ORDER BY s.snippet_id, v.version_number DESC;

COMMENT ON VIEW vw_snippet_latest_code IS
'One row per snippet showing the HEAD (latest) version code content.
Uses DISTINCT ON + ORDER BY version_number DESC for efficiency.';
