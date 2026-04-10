import { SorobanTestAdapter, SorobanTestResult } from "./adapterTypes";

// Basic unit test adapter for Soroban contracts (stub implementation)
export class UnitTestAdapter implements SorobanTestAdapter {
  readonly type = "unit";

  async runTests(targetPath: string): Promise<SorobanTestResult[]> {
    // TODO: Implement actual test runner logic for Soroban unit tests
    // For now, return a dummy result
    return [
      {
        name: "Dummy Unit Test",
        passed: true,
        message: "Test passed successfully!",
      },
    ];
  }
}
