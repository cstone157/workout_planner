# ===== Stage 1: Dependency caching with cargo-chef =====
FROM rust:1.80-slim AS chef
RUN cargo install cargo-chef
WORKDIR /app

FROM chef AS planner
COPY . .
RUN cargo chef prepare --recipe-path recipe.json

# ===== Stage 2: Build =====
FROM chef AS builder

# Install system deps for sqlx + fastembed (openssl, pkg-config)
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

COPY --from=planner /app/recipe.json recipe.json
# Build dependencies only (cached layer)
RUN cargo chef cook --release --recipe-path recipe.json

# Build application
COPY . .
RUN cargo build --release --bin workout-planner-backend

# ===== Stage 3: Runtime =====
FROM debian:bookworm-slim AS runtime

RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/target/release/workout-planner-backend /app/workout-planner-backend

# Create non-root user
RUN useradd -ms /bin/bash appuser
USER appuser

EXPOSE 3000

ENV RUST_LOG=info
ENV PORT=3000

ENTRYPOINT ["/app/workout-planner-backend"]
