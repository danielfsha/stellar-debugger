import { generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createMistral } from '@ai-sdk/mistral';
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
    
    if (config.openaiApiKey) {
      const openai = createOpenAI({
        apiKey: config.openaiApiKey
      });
      this.model = openai(config.vercelAiModel || 'gpt-4');
    } else if (config.mistralApiKey) {
      const mistral = createMistral({
        apiKey: config.mistralApiKey
      });
      this.model = mistral('mistral-large-latest');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // Simple embedding generation using character codes
    // In production, use OpenAI embeddings API
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
      ? `\n\nSimilar past errors:\n${similarErrors.map(e => 
          `- ${e.metadata?.error || 'Unknown error'}`
        ).join('\n')}`
      : '';

    const prompt = `You are an expert Stellar/Soroban smart contract developer. Analyze this test failure and provide a fix.

Test Code:
\`\`\`
${testCode}
\`\`\`

Source Code:
\`\`\`
${sourceCode}
\`\`\`

Error Message:
${errorMessage}
${context}

Provide:
1. A clear explanation of what's wrong
2. The exact code fix needed
3. Your confidence level (0-100)

Format your response as JSON:
{
  "explanation": "...",
  "suggestedFix": "...",
  "confidence": 85
}`;

    try {
      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3
      });

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        explanation: text,
        suggestedFix: '',
        confidence: 50
      };
    } catch (error) {
      throw new Error(`AI analysis failed: ${error}`);
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

    const prompt = `Generate ${testType} tests for this Stellar/Soroban smart contract code.

Source Code:
\`\`\`
${sourceCode}
\`\`\`

${existingTests ? `Existing Tests:\n\`\`\`\n${existingTests}\n\`\`\`\n` : ''}

Generate comprehensive ${testType} tests following Soroban best practices.`;

    const { text } = await generateText({
      model: this.model,
      prompt,
      temperature: 0.5
    });

    return text;
  }
}
