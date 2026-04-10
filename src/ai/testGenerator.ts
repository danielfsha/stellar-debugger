import { AIClient } from "./aiClient";
import { PromptBuilder } from "./promptBuilder";

export class TestGenerator {
  constructor(private ai: AIClient) {}

  async generateTests(context: any) {
    const prompt = PromptBuilder.buildTestGenerationPrompt(context);
    return this.ai.generate(prompt);
  }
}
