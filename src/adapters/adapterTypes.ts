// Interface for pluggable test adapters
export interface SorobanTestAdapter {
  readonly type: string;
  runTests(targetPath: string): Promise<SorobanTestResult[]>;
}

export interface SorobanTestResult {
  name: string;
  passed: boolean;
  message?: string;
  error?: Error;
}

// Example: Unit test adapter will implement this interface
