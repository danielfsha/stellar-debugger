import * as vscode from "vscode";

export class TestCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];
    
    // Add CodeLens for Soroban test actions
    lenses.push(
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "▶ Run Tests",
        command: "stellar-debugger.runSorobanTests",
        tooltip: "Run Soroban tests for this file"
      }),
    );
    
    lenses.push(
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "🤖 Run with AI Fix",
        command: "stellar-debugger.runSorobanTestsWithAI",
        tooltip: "Run tests and automatically fix errors with AI"
      }),
    );
    
    lenses.push(
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "📊 View History",
        command: "stellar-debugger.viewTestHistory",
        tooltip: "View test execution history"
      }),
    );
    
    return lenses;
  }
}
