import * as vscode from "vscode";

export class TestCodeLensProvider implements vscode.CodeLensProvider {
  provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
    const lenses: vscode.CodeLens[] = [];
    // Add CodeLens for test generation, improvement, and fix
    lenses.push(
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "Generate Tests",
        command: "extension.generateTests",
        arguments: [document.fileName],
      }),
    );
    lenses.push(
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "Improve Tests",
        command: "extension.improveTests",
        arguments: [document.fileName],
      }),
    );
    lenses.push(
      new vscode.CodeLens(new vscode.Range(0, 0, 0, 0), {
        title: "Fix Failures",
        command: "extension.fixFailures",
        arguments: [document.fileName],
      }),
    );
    return lenses;
  }
}
