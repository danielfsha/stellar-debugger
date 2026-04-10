export interface TestingModule {
  name: string;
  activate(context: any): void;
  generateTests(file: any, context: any): Promise<any[]>;
  runTests(target: any): Promise<any[]>;
  analyze(results: any, context: any): any;
  improveTests?(file: any, context: any): Promise<any[]>;
  fixFailures?(failure: any, context: any): Promise<any>;
}
