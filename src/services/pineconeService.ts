import { Pinecone } from '@pinecone-database/pinecone';
import { EnvironmentManager } from '../config/environment';

export interface TestResult {
  id: string;
  testType: string;
  fileName: string;
  timestamp: number;
  passed: boolean;
  error?: string;
  metadata?: Record<string, any>;
}

export class PineconeService {
  private static instance: PineconeService;
  private client: Pinecone | null = null;
  private indexName: string = '';

  private constructor() {}

  static getInstance(): PineconeService {
    if (!PineconeService.instance) {
      PineconeService.instance = new PineconeService();
    }
    return PineconeService.instance;
  }

  async initialize(): Promise<boolean> {
    try {
      const config = EnvironmentManager.getInstance().getConfig();
      
      if (!config.pineconeApiKey || !config.pineconeIndex) {
        return false;
      }

      this.client = new Pinecone({
        apiKey: config.pineconeApiKey
      });

      this.indexName = config.pineconeIndex;
      return true;
    } catch (error) {
      console.error('Failed to initialize Pinecone:', error);
      return false;
    }
  }

  async indexTestResult(result: TestResult, embedding: number[]): Promise<void> {
    if (!this.client) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.client.index(this.indexName);
    
    await index.upsert({
      records: [{
        id: result.id,
        values: embedding,
        metadata: {
          testType: result.testType,
          fileName: result.fileName,
          timestamp: result.timestamp,
          passed: result.passed,
          error: result.error || '',
          ...result.metadata
        }
      }]
    });
  }

  async querySimilarTests(embedding: number[], topK: number = 5): Promise<any[]> {
    if (!this.client) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.client.index(this.indexName);
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true
    });

    return queryResponse.matches || [];
  }

  async getTestHistory(fileName: string, testType?: string): Promise<any[]> {
    if (!this.client) {
      throw new Error('Pinecone client not initialized');
    }

    const index = this.client.index(this.indexName);
    const filter: Record<string, any> = { fileName };
    
    if (testType) {
      filter.testType = testType;
    }

    const queryResponse = await index.query({
      vector: new Array(1536).fill(0),
      topK: 100,
      filter,
      includeMetadata: true
    });

    return queryResponse.matches || [];
  }
}
