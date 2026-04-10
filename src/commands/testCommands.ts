import * as vscode from 'vscode';
import { TestRunner } from '../services/testRunner';
import { EnvironmentManager } from '../config/environment';
import { PineconeService } from '../services/pineconeService';

export class TestCommands {
  private testRunner: TestRunner;
  private envManager: EnvironmentManager;
  private pineconeService: PineconeService;

  constructor() {
    this.testRunner = TestRunner.getInstance();
    this.envManager = EnvironmentManager.getInstance();
    this.pineconeService = PineconeService.getInstance();
  }

  async initialize(): Promise<void> {
    const configValid = await this.envManager.promptForMissingConfig();
    if (configValid) {
      await this.pineconeService.initialize();
    }
  }

  registerCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        'stellar-debugger.runSorobanTests',
        () => this.runSorobanTests()
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'stellar-debugger.runSorobanTestsWithAI',
        () => this.runSorobanTestsWithAI()
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'stellar-debugger.configureExtension',
        () => this.configureExtension()
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        'stellar-debugger.viewTestHistory',
        () => this.viewTestHistory()
      )
    );
  }

  private async runSorobanTests(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active file');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Running Soroban Tests',
        cancellable: false
      },
      async () => {
        const result = await this.testRunner.runSorobanTest(
          editor.document.fileName
        );

        if (result.success) {
          vscode.window.showInformationMessage(
            `✓ Tests passed in ${result.duration}ms`
          );
        } else {
          vscode.window.showErrorMessage(
            `✗ Tests failed in ${result.duration}ms`
          );
        }
      }
    );
  }

  private async runSorobanTestsWithAI(): Promise<void> {
    const validation = await this.envManager.validateConfig();
    if (!validation.valid) {
      const configured = await this.envManager.promptForMissingConfig();
      if (!configured) {
        return;
      }
    }

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active file');
      return;
    }

    await vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Running Tests with AI Analysis',
        cancellable: false
      },
      async () => {
        await this.testRunner.runTestWithAIFix(
          editor.document.fileName,
          'soroban'
        );
      }
    );
  }

  private async configureExtension(): Promise<void> {
    await vscode.commands.executeCommand(
      'workbench.action.openSettings',
      'stellarDebugger'
    );
  }

  private async viewTestHistory(): Promise<void> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active file');
      return;
    }

    try {
      const history = await this.pineconeService.getTestHistory(
        editor.document.fileName
      );

      if (history.length === 0) {
        vscode.window.showInformationMessage('No test history found');
        return;
      }

      const items = history.map(h => ({
        label: h.metadata?.passed ? '✓ Passed' : '✗ Failed',
        description: new Date(h.metadata?.timestamp).toLocaleString(),
        detail: h.metadata?.error || 'No errors'
      }));

      await vscode.window.showQuickPick(items, {
        placeHolder: 'Test History'
      });
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to load history: ${error}`);
    }
  }
}
