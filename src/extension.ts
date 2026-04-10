// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerSorobanTestCommand } from "./registerSorobanTestCommand";
import { TestCodeLensProvider } from './editor/codeLensProvider';
import { AIInsightsPanel } from './ui/aiInsightsPanel';
import { CoverageHeatmap } from './ui/coverageHeatmap';
import { UnitTestModule } from './modules/unitTestModule';
import { PropertyTestModule } from './modules/propertyTestModule';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Show activation message
  vscode.window.showInformationMessage(
    'Congratulations, your extension "stellar-debugger" is now active!',
  );

  // Register all modular commands here for scalability
  registerAllCommands(context);

  // Register CodeLens for test actions
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider({ scheme: 'file', language: 'typescript' }, new TestCodeLensProvider())
  );

  // Register test-related commands
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.generateTests', async (fileName: string) => {
      vscode.window.showInformationMessage('Generate Tests command triggered for ' + fileName);
      // TODO: Load file, call UnitTestModule.generateTests, show results
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.improveTests', async (fileName: string) => {
      vscode.window.showInformationMessage('Improve Tests command triggered for ' + fileName);
      // TODO: Load file, call UnitTestModule.improveTests, show results
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('extension.fixFailures', async (fileName: string) => {
      vscode.window.showInformationMessage('Fix Failures command triggered for ' + fileName);
      // TODO: Load file, call UnitTestModule.fixFailures, show results
    })
  );

  // Register panels and heatmap (to be used in command handlers)
  const aiPanel = new AIInsightsPanel();
  const heatmap = new CoverageHeatmap();
  // Example usage:
  // aiPanel.show({ why: 'Test failed', suggestion: 'Fix assertion' });
  // heatmap.showCoverage([new vscode.Range(0, 0, 0, 10)]);
}

// Modular command loader for future extensibility
function registerAllCommands(context: vscode.ExtensionContext) {
  // Register Soroban test command (add more commands here as needed)
  registerSorobanTestCommand(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
