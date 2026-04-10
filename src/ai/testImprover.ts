import { AIClient } from "./aiClient";
import { PromptBuilder } from "./promptBuilder";

export class TestImprover {
  constructor(private ai: AIClient) {}

  async improveTests(context: any) {
    const prompt = `Improve the following tests for better coverage and assertions:\n${context.tests}`;
    return this.ai.generate(prompt);
  }
}
