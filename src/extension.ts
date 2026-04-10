// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerSorobanTestCommand } from "./registerSorobanTestCommand";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
  // Show activation message
  vscode.window.showInformationMessage(
    'Congratulations, your extension "stellar-debugger" is now active!'
  );

  // Register modular Soroban test command
  registerSorobanTestCommand(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
