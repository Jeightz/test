const JINA_API_URL = "https://api.jina.ai/v1/embeddings";
const EMBEDDING_DIMENSIONS = 512; // keep this matching your pgvector column size

export async function getImageEmbedding(buffer, retries = 2) {
  const base64Image = buffer.toString("base64");

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    let response;

    try {
      response = await fetch(JINA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.JINA_API_KEY}`,
        },
        body: JSON.stringify({
          model: "jina-clip-v2",
          dimensions: EMBEDDING_DIMENSIONS,
          normalized: true,
          embedding_type: "float",
          input: [{ image: base64Image }],
        }),
      });
    } catch (networkError) {
      console.error(
        `Embedding network error (attempt ${attempt}):`,
        networkError.message
      );
      if (attempt <= retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw new Error("Could not reach the embedding service.");
    }

    if (response.status === 429) {
      console.log(`Rate limited by Jina, retrying (attempt ${attempt})`);
      if (attempt <= retries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw new Error("Embedding service is rate-limited. Please try again shortly.");
    }

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("Embedding request failed:", response.status, text);
      throw new Error(`Embedding request failed: ${response.status}`);
    }

    const data = await response.json();
    const vector = data?.data?.[0]?.embedding;

    if (!Array.isArray(vector) || vector.length !== EMBEDDING_DIMENSIONS) {
      console.error("Unexpected embedding shape:", vector?.length);
      throw new Error("Unexpected embedding format from Jina API");
    }

    return vector;
  }

  throw new Error("Embedding service unavailable after retries");
}

export function embeddingToVectorLiteral(embedding) {
  return `[${embedding.join(",")}]`;
}