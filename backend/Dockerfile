# Build Stage
FROM rust:1.96.0 AS builder

WORKDIR /usr/src/backend

# Copy the Cargo files
COPY Cargo.toml Cargo.lock ./

# Copy the source code and sqlx offline data
COPY src ./src
COPY .sqlx ./.sqlx

# We tell sqlx to use the offline cache instead of connecting to a DB
ENV SQLX_OFFLINE=true

# Build the application for release
RUN cargo build --release

# Final Stage - Create a smaller image for running the binary
FROM debian:bookworm-slim

# Install OpenSSL for any HTTPS/TLS needs, plus CA certificates
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /usr/src/backend/target/release/backend /usr/local/bin/backend

# Create a non-root user to run the app
RUN useradd -m appuser
USER appuser

# Expose port 3000
EXPOSE 3000

# Run the binary
CMD ["backend"]
