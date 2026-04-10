import { generateText } from 'ai';
import { mistral } from '@ai-sdk/mistral';
import { EnvironmentManager } from '../config/environment';

export interface AIFixSuggestion {
  explanation: string;
  suggestedFix: string;
  confidence: number;
}

export class AIService {
  private static instance: AIService;
  private model: any;

  private constructor() {
    this.initializeModel();
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private initializeModel(): void {
    const config = EnvironmentManager.getInstance().getConfig();
    
    if (config.mistralApiKey) {
      this.model = mistral('mistral-large-latest');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const normalized = text.toLowerCase().replace(/\s+/g, ' ').trim();
    const embedding = new Array(1536).fill(0);
    
    for (let i = 0; i < normalized.length && i < 1536; i++) {
      embedding[i] = normalized.charCodeAt(i) / 255;
    }
    
    return embedding;
  }

  async analyzeTestError(
    errorMessage: string,
    testCode: string,
    sourceCode: string,
    similarErrors?: any[]
  ): Promise<AIFixSuggestion> {
    if (!this.model) {
      throw new Error('AI model not initialized');
    }

    const context = similarErrors && similarErrors.length > 0
      ? '\n\nSimilar past errors:\n' + similarErrors.map(e => '- ' + (e.metadata?.error || 'Unknown error')).join('\n')
      : '';

    const prompt = 'You are an expert Stellar/Soroban smart contract developer. Analyze this test failure and provide a fix.\n\nTest Code:\n```\n' + testCode + '\n```\n\nSource Code:\n```\n' + sourceCode + '\n```\n\nError Message:\n' + errorMessage + '\n' + context + '\n\nProvide:\n1. A clear explanation of what is wrong\n2. The exact code fix needed\n3. Your confidence level (0-100)\n\nFormat your response as JSON:\n{\n  "explanation": "...",\n  "suggestedFix": "...",\n  "confidence": 85\n}';

    try {
      const result = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3
      });

      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        explanation: result.text,
        suggestedFix: '',
        confidence: 50
      };
    } catch (error) {
      throw new Error('AI analysis failed: ' + error);
    }
  }

  async generateTestCode(
    sourceCode: string,
    testType: string,
    existingTests?: string
  ): Promise<string> {
    if (!this.model) {
      throw new Error('AI model not initialized');
    }

    const existingTestsSection = existingTests ? 'Existing Tests:\n```\n' + existingTests + '\n```\n' : '';
    const prompt = 'Generate ' + testType + ' tests for this Stellar/Soroban smart contract code.\n\nSource Code:\n```\n' + sourceCode + '\n```\n\n' + existingTestsSection + '\nGenerate comprehensive ' + testType + ' tests following Soroban best practices.';

    const result = await generateText({
      model: this.model,
      prompt,
      temperature: 0.5
    });

    return result.text;
  }
}
