use anyhow::Context;
use fastembed::{TextEmbedding, InitOptions, EmbeddingModel};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct Embedder {
    inner: Arc<Mutex<TextEmbedding>>,
}

impl Embedder {
    pub async fn new() -> anyhow::Result<Self> {
        tracing::info!("Initializing fastembed model (all-MiniLM-L6-v2)…");
        let model = tokio::task::spawn_blocking(|| {
            TextEmbedding::try_new(
                InitOptions::new(EmbeddingModel::AllMiniLML6V2)
                    .with_show_download_progress(true),
            )
        })
        .await
        .context("spawn_blocking panicked")?
        .context("Failed to init fastembed model")?;

        tracing::info!("Embedding model ready");
        Ok(Self {
            inner: Arc::new(Mutex::new(model)),
        })
    }

    pub async fn embed(&self, texts: Vec<String>) -> anyhow::Result<Vec<Vec<f32>>> {
        let inner = Arc::clone(&self.inner);
        tokio::task::spawn_blocking(move || {
            let model = inner.blocking_lock();
            model.embed(texts, None)
                .context("Embedding generation failed")
        })
        .await
        .context("spawn_blocking panicked")?
    }

    pub async fn embed_one(&self, text: String) -> anyhow::Result<Vec<f32>> {
        let mut embeddings = self.embed(vec![text]).await?;
        embeddings
            .pop()
            .ok_or_else(|| anyhow::anyhow!("No embeddings returned"))
    }
}
