FROM rust:latest as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
WORKDIR /app
COPY --from=builder /app/target/release/rustdb-backend .
EXPOSE 8080
CMD ["./rustdb-backend"]
