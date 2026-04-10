# Stellar Debugger - AI-Powered Soroban Test Extension

A modular VS Code extension for running and debugging Stellar/Soroban smart contract tests with AI-powered error fixing.

## Features

- 🚀 Run Soroban tests directly from VS Code
- 🤖 AI-powered error analysis and automatic fix suggestions
- 📊 Test result indexing with Pinecone for historical analysis
- 🔍 CodeLens integration for quick test actions
- 📈 Test history tracking and visualization
- 🎯 Support for multiple test types (Unit, Property, Fuzz, E2E, etc.)

## Setup

### Prerequisites

1. Rust and Cargo installed
2. Stellar/Soroban CLI tools
3. Node.js 16+ and pnpm

### Installation

1. Clone and install dependencies:
```bash
pnpm install
```

2. Configure API keys in VS Code settings:
   - Open Settings (Ctrl+,)
   - Search for "Stellar Debugger"
   - Add your API keys:
     - Mistral API Key
     - Pinecone API Key
     - Pinecone Environment
     - Pinecone Index name

3. Compile the extension:
```bash
pnpm run compile
```

4. Press F5 to launch the extension in debug mode

## Usage

### Quick Start

1. Open a Rust file with Soroban tests
2. Use CodeLens actions at the top of the file:
   - **▶ Run Tests** - Execute tests normally
   - **🤖 Run with AI Fix** - Run tests and get AI-powered fix suggestions
   - **📊 View History** - See past test results

### Command Palette

Press `Ctrl+Shift+P` and search for:
- `Stellar: Run Soroban Tests`
- `Stellar: Run Tests with AI Fix`
- `Stellar: View Test History`
- `Stellar: Configure Extension`

## Configuration

Add to your VS Code `settings.json`:

```json
{
  "stellarDebugger.mistralApiKey": "your-mistral-key",
  "stellarDebugger.pineconeApiKey": "...",
  "stellarDebugger.pineconeEnvironment": "us-east-1-aws",
  "stellarDebugger.pineconeIndex": "stellar-tests"
}
```

## Architecture

```
src/
├── commands/          # Command handlers
├── config/            # Configuration management
├── services/          # Core services (AI, Pinecone, TestRunner)
├── modules/           # Test type modules
├── editor/            # CodeLens and editor integrations
└── ui/                # UI components
```

## Development

```bash
# Watch mode
pnpm run watch

# Lint
pnpm run lint

# Test
pnpm run test
```

## Contributing

This extension follows conventional commits. Make frequent, small commits during development.

## License

MIT
