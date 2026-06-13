CREATE TABLE IF NOT EXISTS sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workout_id    UUID REFERENCES workouts(id) ON DELETE SET NULL,
    performed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes         TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_sets (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id   UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    set_number    INT NOT NULL,
    reps_done     INT NOT NULL DEFAULT 0,
    weight_kg     NUMERIC(6, 2)
);

CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_workout ON sessions(workout_id);
CREATE INDEX IF NOT EXISTS idx_sets_session     ON session_sets(session_id);
