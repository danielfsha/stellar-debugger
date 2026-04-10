import * as vscode from "vscode";
import { UnitTestAdapter } from "./adapters/unitTestAdapter";
import { SorobanTestResult } from "./adapters/adapterTypes";

import { exec } from "child_process";

export function registerSorobanTestCommand(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand(
    "stellar-debugger.runSorobanTests",
    async () => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }
      const targetPath = folders[0].uri.fsPath;
      const adapter = new UnitTestAdapter();
      const results: SorobanTestResult[] = await adapter.runTests(targetPath);
      const summary = results
        .map((r) => `${r.passed ? "✅" : "❌"} ${r.name}: ${r.message || ""}`)
        .join("\n");
      vscode.window.showInformationMessage(
        `Soroban Test Results:\n${summary}`,
        { modal: true },
      );
    },
  );

  const disposableCmd = vscode.commands.registerCommand(
    "stellar-debugger.runSorobanTestsCmd",
    async () => {
      const folders = vscode.workspace.workspaceFolders;
      if (!folders || folders.length === 0) {
        vscode.window.showErrorMessage("No workspace folder found.");
        return;
      }
      const targetPath = folders[0].uri.fsPath;
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Running Soroban tests via command line...",
          cancellable: false,
        },
        async () => {
          return new Promise<void>((resolve) => {
            exec(
              "soroban test",
              { cwd: targetPath },
                  (error: Error | null, stdout: string, stderr: string) => {
                if (error) {
                  vscode.window.showErrorMessage(
                    `Test run failed: ${stderr || error.message}`,
                  );
                  resolve();
                  return;
                }
                vscode.window.showInformationMessage(
                  `Soroban Test Results (cmd):\n${stdout}`,
                );
                resolve();
              },
            );
          });
        },
      );
    },
  );

  context.subscriptions.push(disposable, disposableCmd);
}
