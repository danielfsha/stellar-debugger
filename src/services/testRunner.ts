 import * as vscode from 'vscode';
import * as cp from 'child_process';
import { promisify } from 'util';
import { AIService } from './aiService';
import { PineconeService } from './pineconeService';
import { StatusBarManager } from '../ui/statusBar';

const exec = promisify(cp.exec);

export interface TestExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}

export class TestRunner {
  private static instance: TestRunner;
  private aiService: AIService;
  private pineconeService: PineconeService;
  private outputChannel: vscode.OutputChannel;

  private constructor() {
    this.aiService = AIService.getInstance();
    this.pineconeService = PineconeService.getInstance();
    this.outputChannel = vscode.window.createOutputChannel('Stellar Debugger');
    StatusBarManager.getInstance();
  }

  static getInstance(): TestRunner {
    if (!TestRunner.instance) {
      TestRunner.instance = new TestRunner();
    }
    return TestRunner.instance;
  }

  async runSorobanTest(testFile: string): Promise<TestExecutionResult> {
    const startTime = Date.now();
    const statusBar = StatusBarManager.getInstance();
    statusBar.updateStatus('running');
    
    this.outputChannel.show();
    this.outputChannel.appendLine(`\n=== Running Soroban Test: ${testFile} ===\n`);

    try {
      const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
      if (!workspaceFolder) {
        throw new Error('No workspace folder found');
      }

      const { stdout, stderr } = await exec('cargo test', {
        cwd: workspaceFolder.uri.fsPath,
        timeout: 60000
      });

      const duration = Date.now() - startTime;
      const output = stdout + stderr;
      
      this.outputChannel.appendLine(output);
      this.outputChannel.appendLine(`\n✓ Test completed in ${duration}ms\n`);

      statusBar.updateStatus('success', `Tests passed in ${duration}ms`);
      await this.indexTestResult(testFile, 'soroban', true, output);

      return {
        success: true,
        output,
        duration
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const errorOutput = error.stdout + error.stderr;
      
      this.outputChannel.appendLine(errorOutput);
      this.outputChannel.appendLine(`\n✗ Test failed in ${duration}ms\n`);

      statusBar.updateStatus('error', error.message);
      await this.indexTestResult(testFile, 'soroban', false, errorOutput, error.message);

      return {
        success: false,
        output: errorOutput,
        error: error.message,
        duration
      };
    }
  }

  async runTestWithAIFix(testFile: string, testType: string): Promise<void> {
    const result = await this.runSorobanTest(testFile);

    if (!result.success && result.error) {
      this.outputChannel.appendLine('\n🤖 Analyzing error with AI...\n');

      try {
        const sourceCode = await this.readFile(testFile);
        const testCode = await this.readFile(testFile);
        
        const errorEmbedding = await this.aiService.generateEmbedding(result.error);
        const similarErrors = await this.pineconeService.querySimilarTests(errorEmbedding, 3);

        const suggestion = await this.aiService.analyzeTestError(
          result.error,
          testCode,
          sourceCode,
          similarErrors
        );

        this.outputChannel.appendLine(`📊 Confidence: ${suggestion.confidence}%\n`);
        this.outputChannel.appendLine(`💡 Explanation:\n${suggestion.explanation}\n`);
        
        if (suggestion.suggestedFix) {
          this.outputChannel.appendLine(`🔧 Suggested Fix:\n${suggestion.suggestedFix}\n`);
          
          const action = await vscode.window.showInformationMessage(
            `AI found a potential fix (${suggestion.confidence}% confidence)`,
            'Apply Fix',
            'Show Details',
            'Ignore'
          );

          if (action === 'Apply Fix') {
            await this.applyFix(testFile, suggestion.suggestedFix);
          } else if (action === 'Show Details') {
            this.outputChannel.show();
          }
        }
      } catch (aiError) {
        this.outputChannel.appendLine(`⚠️ AI analysis failed: ${aiError}\n`);
      }
    }
  }

  private async readFile(filePath: string): Promise<string> {
    const uri = vscode.Uri.file(filePath);
    const content = await vscode.workspace.fs.readFile(uri);
    return Buffer.from(content).toString('utf8');
  }

  private async applyFix(filePath: string, fix: string): Promise<void> {
    const document = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(document);
    
    await vscode.window.showInformationMessage(
      'Review the suggested fix in the output channel and apply manually',
      'OK'
    );
  }

  private async indexTestResult(
    fileName: string,
    testType: string,
    passed: boolean,
    output: string,
    error?: string
  ): Promise<void> {
    try {
      const embedding = await this.aiService.generateEmbedding(
        error || output
      );

      await this.pineconeService.indexTestResult(
        {
          id: `${fileName}-${Date.now()}`,
          testType,
          fileName,
          timestamp: Date.now(),
          passed,
          error,
          metadata: { output }
        },
        embedding
      );
    } catch (indexError) {
      console.error('Failed to index test result:', indexError);
    }
  }
}
