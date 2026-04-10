// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerSorobanTestCommand } from "./registerSorobanTestCommand";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Show activation message
  vscode.window.showInformationMessage(
    'Congratulations, your extension "stellar-debugger" is now active!',
  );

  // Register all modular commands here for scalability
  registerAllCommands(context);
}

// Modular command loader for future extensibility
function registerAllCommands(context: vscode.ExtensionContext) {
  // Register Soroban test command (add more commands here as needed)
  registerSorobanTestCommand(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
