use anyhow::Context;

pub fn hash_password(password: &str) -> anyhow::Result<String> {
    bcrypt::hash(password, bcrypt::DEFAULT_COST)
        .context("Failed to hash password")
}

pub fn verify_password(password: &str, hash: &str) -> anyhow::Result<bool> {
    bcrypt::verify(password, hash)
        .context("Failed to verify password")
}
