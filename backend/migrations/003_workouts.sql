CREATE TABLE IF NOT EXISTS workouts (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    workout_id    UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id   UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    sets          INT,
    reps          INT,
    rest_seconds  INT,
    position      INT NOT NULL DEFAULT 0,
    PRIMARY KEY (workout_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_workouts_user ON workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_we_workout   ON workout_exercises(workout_id);
