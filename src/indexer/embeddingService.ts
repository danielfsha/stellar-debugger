import { mistral } from "@ai-sdk/mistral";
import { embed } from "ai";

export class EmbeddingService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async embed(text: string): Promise<number[]> {
    const { embedding } = await embed({
      model: mistral.embedding("mistral-embed", {
        apiKey: this.apiKey,
      }),
      value: text,
    });
    return embedding;
  }
}
