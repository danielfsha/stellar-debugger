import * as vscode from "vscode";
import { UnitTestAdapter } from "./adapters/unitTestAdapter";
import { SorobanTestResult } from "./adapters/adapterTypes";

export function registerSorobanTestCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "stellar-debugger.runSorobanTests",
    async () => {
      // For now, just use the UnitTestAdapter
      const adapter = new UnitTestAdapter();
      // TODO: Let user pick target path; for now, use workspace root
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }
      const targetPath = folders[0].uri.fsPath;
      const results: SorobanTestResult[] = await adapter.runTests(targetPath);
      // Show results in a simple info message for now
      const summary = results
        .map((r) => `${r.passed ? "✅" : "❌"} ${r.name}: ${r.message || ""}`)
        .join("\n");
      vscode.window.showInformationMessage(
        `Soroban Test Results:\n${summary}`,
        { modal: true },
      );
    },
  );
  context.subscriptions.push(disposable);
}
