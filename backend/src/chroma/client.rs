use anyhow::Context;
use chroma::{ChromaClient, ChromaClientOptions, collection::ChromaCollection};
use std::sync::Arc;

pub struct ChromaStore {
    exercises_collection: Arc<ChromaCollection>,
}

impl ChromaStore {
    pub async fn new(url: &str) -> anyhow::Result<Self> {
        tracing::info!("Connecting to ChromaDB at {}", url);
        let client = ChromaClient::new(ChromaClientOptions {
            url: url.to_string(),
            ..Default::default()
        });

        let exercises_collection = client
            .get_or_create_collection("exercises", None)
            .await
            .context("Failed to get/create exercises collection")?;

        tracing::info!("ChromaDB ready — exercises collection initialized");
        Ok(Self {
            exercises_collection: Arc::new(exercises_collection),
        })
    }

    pub async fn heartbeat(&self) -> bool {
        // Simple probe: try to get collection count
        self.exercises_collection.count().await.is_ok()
    }

    pub async fn upsert_exercise(
        &self,
        id: &str,
        embedding: Vec<f32>,
        text: &str,
    ) -> anyhow::Result<()> {
        use chroma::collection::{CollectionEntries, GetOptions};

        let entries = CollectionEntries {
            ids: vec![id.to_string()],
            embeddings: Some(vec![embedding]),
            documents: Some(vec![Some(text.to_string())]),
            metadatas: None,
        };

        self.exercises_collection
            .upsert(entries, None)
            .await
            .context("ChromaDB upsert failed")
    }

    pub async fn delete_exercise(&self, id: &str) -> anyhow::Result<()> {
        use chroma::collection::GetOptions;
        self.exercises_collection
            .delete(Some(vec![id.to_string()]), None, None)
            .await
            .context("ChromaDB delete failed")
    }

    pub async fn query_exercises(
        &self,
        query_embedding: Vec<f32>,
        n_results: usize,
    ) -> anyhow::Result<Vec<(String, f32)>> {
        use chroma::collection::QueryOptions;

        let results = self.exercises_collection
            .query(
                QueryOptions {
                    query_embeddings: Some(vec![query_embedding]),
                    n_results: Some(n_results),
                    ..Default::default()
                },
                None,
            )
            .await
            .context("ChromaDB query failed")?;

        let ids = results.ids.into_iter().flatten().collect::<Vec<_>>();
        let distances = results
            .distances
            .unwrap_or_default()
            .into_iter()
            .flatten()
            .collect::<Vec<_>>();

        Ok(ids
            .into_iter()
            .zip(distances.into_iter())
            .map(|(id, dist)| {
                // Convert L2 distance to similarity score [0,1]
                let similarity = 1.0 / (1.0 + dist);
                (id, similarity as f32)
            })
            .collect())
    }
}
