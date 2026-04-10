import { TestingModule } from "../types/testingModule";
import { TestGenerator } from "../ai/testGenerator";
import { TestImprover } from "../ai/testImprover";
import { FixEngine } from "../ai/fixEngine";

export const UnitTestModule: TestingModule = {
  name: "UnitTest",
  description:
    "Unit tests validate individual functions or classes in isolation. Use this to quickly check correctness of small code units. Configuration: Set your model and API keys in the .env file (e.g., OPENAI_API_KEY, MISTRAL_API_KEY, PINECONE_API_KEY).",
  activate(context: any) {},
  async generateTests(file: any, context: any) {
    const generator = new TestGenerator(context.ai);
    const result = await generator.generateTests({ code: file.content });
    if (Array.isArray(result)) return result;
    if (typeof result === "string") return [result];
    return [];
  },
  async runTests(target: any) {
    // Implement test runner integration (e.g., Jest, Mocha)
    return [];
  },
  analyze(results: any, context: any) {
    // Analyze test results and return insights
    if (!Array.isArray(results)) return { error: "No results" };
    const summary = {
      total: results.length,
      passed: results.filter((r: any) => r.status === "passed").length,
      failed: results.filter((r: any) => r.status === "failed").length,
      flaky: results.filter((r: any) => r.flaky).length,
      failures: results.filter((r: any) => r.status === "failed"),
    };
    return summary;
  },
  async improveTests(file: any, context: any) {
    const improver = new TestImprover(context.ai);
    const result = await improver.improveTests({ tests: file.tests });
    if (Array.isArray(result)) return result;
    if (typeof result === "string") return [result];
    return [];
  },
  async fixFailures(failure: any, context: any) {
    const fixer = new FixEngine(context.ai);
    return fixer.suggestFix({ failure, code: context.code });
  },
};
