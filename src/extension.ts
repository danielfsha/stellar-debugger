// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerSorobanTestCommand } from "./registerSorobanTestCommand";
import { TestCodeLensProvider } from "./editor/codeLensProvider";
import { AIInsightsPanel } from "./ui/aiInsightsPanel";
import { CoverageHeatmap } from "./ui/coverageHeatmap";
import { UnitTestModule } from "./modules/unitTestModule";
import { PropertyTestModule } from "./modules/propertyTestModule";
import { EndToEndTestModule } from "./modules/endToEndTestModule";
import { FuzzTestModule } from "./modules/fuzzTestModule";
import { SnapshotTestModule } from "./modules/snapshotTestModule";
import { AssertionInvariantModule } from "./modules/assertionInvariantModule";
import { RuntimeCheckModule } from "./modules/runtimeCheckModule";
import { DifferentialTestModule } from "./modules/differentialTestModule";
import { FormalVerificationModule } from "./modules/formalVerificationModule";
import { TestDataManagementModule } from "./modules/testDataManagementModule";
import { MockIsolationModule } from "./modules/mockIsolationModule";

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
    vscode.languages.registerCodeLensProvider(
      { scheme: "file", language: "typescript" },
      new TestCodeLensProvider(),
    ),
  );

  // Register test-related commands for all modules
  // Define a type for test modules to allow optional description
  type TestingModule = {
    description?: string;
    [key: string]: any;
  };
  const modules: { name: string; mod: TestingModule }[] = [
    { name: "Unit", mod: UnitTestModule },
    { name: "Property", mod: PropertyTestModule },
    { name: "EndToEnd", mod: EndToEndTestModule },
    { name: "Fuzz", mod: FuzzTestModule },
    { name: "Snapshot", mod: SnapshotTestModule },
    { name: "AssertionInvariant", mod: AssertionInvariantModule },
    { name: "RuntimeCheck", mod: RuntimeCheckModule },
    { name: "Differential", mod: DifferentialTestModule },
    { name: "FormalVerification", mod: FormalVerificationModule },
    { name: "TestDataManagement", mod: TestDataManagementModule },
    { name: "MockIsolation", mod: MockIsolationModule },
  ];

  // Register a top-level command for test options (all test modules, with label and description)
  context.subscriptions.push(
    vscode.commands.registerCommand("extension.runTestOptions", async () => {
      const options = [
        ...modules.map(({ name, mod }) => ({
          label: `${name.replace(/([A-Z])/g, " $1").trim()} Tests`,
          description:
            typeof mod === "object" &&
            "description" in mod &&
            typeof mod.description === "string"
              ? mod.description
              : `Run ${name} tests`,
          command: `extension.run${name}Tests`,
        })),
        {
          label: "All Tests",
          description: "Run all available test modules",
          command: "extension.runAllTests",
        },
      ];
      const selection = await vscode.window.showQuickPick(options, {
        placeHolder: "Select a test option",
        matchOnDescription: true,
      });
      const fileName = vscode.window.activeTextEditor?.document.fileName;
      if (selection) {
        if (selection.command === "extension.runAllTests") {
          for (const { name } of modules) {
            await vscode.commands.executeCommand(
              `extension.run${name}Tests`,
              fileName,
            );
          }
        } else {
          await vscode.commands.executeCommand(selection.command, fileName);
        }
      }
    }),
  );

  for (const { name, mod } of modules) {
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `extension.generate${name}Tests`,
        async (fileName?: string) => {
          let resolvedFileName =
            fileName || vscode.window.activeTextEditor?.document.fileName;
          if (!resolvedFileName) {
            vscode.window.showWarningMessage(
              `No file selected or open. Please open a file to generate ${name} tests.`,
            );
            return;
          }
          vscode.window.showInformationMessage(
            `Generate ${name} Tests command triggered for ${resolvedFileName}`,
          );
          // TODO: Load file, call mod.generateTests, show results
        },
      ),
    );
    context.subscriptions.push(
      vscode.commands.registerCommand(
        `extension.run${name}Tests`,
        async (fileName?: string) => {
          let resolvedFileName =
            fileName || vscode.window.activeTextEditor?.document.fileName;
          if (!resolvedFileName) {
            vscode.window.showWarningMessage(
              `No file selected or open. Please open a file to run ${name} tests.`,
            );
            return;
          }
          vscode.window.showInformationMessage(
            `Run ${name} Tests command triggered for ${resolvedFileName}`,
          );
          // TODO: Load file, call mod.runTests, show results
        },
      ),
    );
  }

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
