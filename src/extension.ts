// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { TestCommands } from "./commands/testCommands";
import { PineconeService } from "./services/pineconeService";
import { RepositoryIndexer } from "./services/repositoryIndexer";
import { EnvironmentManager } from "./config/environment";
import { getAllFilesAndFolders } from "./utils/fileUtils";
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
export async function activate(context: vscode.ExtensionContext) {
  // Initialize Pinecone indexing on extension load
  await initializePineconeIndexing();

  // Show activation message
  vscode.window.showInformationMessage(
    'Stellar Debugger activated! Use "Stellar: Run Tests with AI Fix" to get started.',
  );

  // Initialize and register test commands
  const testCommands = new TestCommands();
  await testCommands.initialize();
  testCommands.registerCommands(context);

  // Register all modular commands here for scalability
  registerAllCommands(context);

  // Register CodeLens for test actions
  context.subscriptions.push(
    vscode.languages.registerCodeLensProvider(
      { scheme: "file", language: "rust" },
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
            const files = await getAllFilesAndFolders();
            if (files.length === 0) {
              vscode.window.showWarningMessage(
                `No files or folders found in workspace to generate ${name} tests.`,
              );
              return;
            }
            vscode.window.showInformationMessage(
              `Generate ${name} Tests command triggered for all files/folders in workspace (${files.length} items):\n${files.join("\n")}`,
            );
            // TODO: Loop through files, call mod.generateTests for each, show results
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
            const files = await getAllFilesAndFolders();
            if (files.length === 0) {
              vscode.window.showWarningMessage(
                `No files or folders found in workspace to run ${name} tests.`,
              );
              return;
            }
            vscode.window.showInformationMessage(
              `Run ${name} Tests command triggered for all files/folders in workspace (${files.length} items):\n${files.join("\n")}`,
            );
            // TODO: Loop through files, call mod.runTests for each, show results
            return;
          }
          vscode.window.showInformationMessage(
            `Run ${name} Tests command triggered for ${resolvedFileName}`,
          );
          // TODO: Load file, call mod.runTests, show results
        },
      ),
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
    // No Soroban test command needed
  }
}

// Initialize Pinecone indexing
async function initializePineconeIndexing(): Promise<void> {
  try {
    const envManager = EnvironmentManager.getInstance();
    const validation = await envManager.validateConfig();
    
    if (!validation.valid) {
      vscode.window.showWarningMessage(
        `Stellar Debugger: Missing configuration - ${validation.missing.join(', ')}. Configure in settings to enable AI features.`,
        'Configure'
      ).then(action => {
        if (action === 'Configure') {
          vscode.commands.executeCommand('workbench.action.openSettings', 'stellarDebugger');
        }
      });
      return;
    }

    const pineconeService = PineconeService.getInstance();
    const initialized = await pineconeService.initialize();
    
    if (initialized) {
      console.log('Stellar Debugger: Pinecone indexing initialized successfully');
      
      // Start repository indexing in background
      const repositoryIndexer = RepositoryIndexer.getInstance();
      
      // Ask user if they want to index the repository
      const action = await vscode.window.showInformationMessage(
        'Stellar Debugger: Index repository for AI-powered features?',
        'Index Now',
        'Later'
      );
      
      if (action === 'Index Now') {
        repositoryIndexer.indexRepository();
      }
    } else {
      vscode.window.showWarningMessage(
        'Stellar Debugger: Failed to initialize Pinecone. Check your API keys in settings.'
      );
    }
  } catch (error) {
    console.error('Stellar Debugger: Error initializing Pinecone:', error);
    vscode.window.showErrorMessage(
      `Stellar Debugger: Initialization error - ${error}`
    );
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
