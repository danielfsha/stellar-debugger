import * as vscode from 'vscode';

export class StatusBarManager {
  private static instance: StatusBarManager;
  private statusBarItem: vscode.StatusBarItem;

  private constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      100
    );
    this.statusBarItem.command = 'stellar-debugger.runSorobanTestsWithAI';
    this.updateStatus('ready');
    this.statusBarItem.show();
  }

  static getInstance(): StatusBarManager {
    if (!StatusBarManager.instance) {
      StatusBarManager.instance = new StatusBarManager();
    }
    return StatusBarManager.instance;
  }

  updateStatus(status: 'ready' | 'running' | 'success' | 'error', message?: string): void {
    switch (status) {
      case 'ready':
        this.statusBarItem.text = '$(beaker) Stellar Tests';
        this.statusBarItem.tooltip = 'Click to run tests with AI';
        this.statusBarItem.backgroundColor = undefined;
        break;
      case 'running':
        this.statusBarItem.text = '$(sync~spin) Running Tests...';
        this.statusBarItem.tooltip = 'Tests in progress';
        this.statusBarItem.backgroundColor = undefined;
        break;
      case 'success':
        this.statusBarItem.text = `$(check) Tests Passed`;
        this.statusBarItem.tooltip = message || 'All tests passed';
        this.statusBarItem.backgroundColor = undefined;
        break;
      case 'error':
        this.statusBarItem.text = '$(x) Tests Failed';
        this.statusBarItem.tooltip = message || 'Tests failed - click for AI fix';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
    }
  }

  dispose(): void {
    this.statusBarItem.dispose();
  }
}
