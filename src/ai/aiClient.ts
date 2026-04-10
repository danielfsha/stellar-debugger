import { mistral } from "@ai-sdk/mistral";
import { generateText } from "ai";

export class AIClient {
  private model: any;
  constructor(modelName: string = "mistral-large-latest") {
    this.model = mistral(modelName);
  }

  async generate(prompt: string, options: any = {}) {
    const { text } = await generateText({
      model: this.model,
      prompt,
      ...options,
    });
    return text;
  }
}
