import { AIClient } from "./aiClient";
import { PromptBuilder } from "./promptBuilder";

export class FixEngine {
  constructor(private ai: AIClient) {}

  async suggestFix(context: any) {
    const prompt = PromptBuilder.buildFixPrompt(context);
    return this.ai.generate(prompt);
  }
}
