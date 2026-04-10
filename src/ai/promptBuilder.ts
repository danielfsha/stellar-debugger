export class PromptBuilder {
  static buildTestGenerationPrompt(context: any): string {
    // Build a prompt for test generation using context
    return `Generate high-quality unit tests for the following function:\n${context.code}`;
  }
  static buildFixPrompt(context: any): string {
    return `Analyze the following test failure and suggest a fix:\n${context.failure}\nCode:\n${context.code}`;
  }
}
