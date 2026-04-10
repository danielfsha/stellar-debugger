import { Configuration, OpenAIApi } from 'openai';

export class EmbeddingService {
  private openai: OpenAIApi;

  constructor(apiKey: string) {
    const config = new Configuration({ apiKey });
    this.openai = new OpenAIApi(config);
  }

  async embed(text: string): Promise<number[]> {
    const resp = await this.openai.createEmbedding({
      model: 'text-embedding-ada-002',
      input: text,
    });
    return resp.data.data[0].embedding;
  }
}
