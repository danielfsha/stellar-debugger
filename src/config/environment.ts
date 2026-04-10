import * as vscode from 'vscode';

export interface EnvironmentConfig {
  openaiApiKey?: string;
  mistralApiKey?: string;
  pineconeApiKey?: string;
  pineconeEnvironment?: string;
  pineconeIndex?: string;
  vercelAiModel?: string;
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig = {};

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  private loadConfig(): void {
    const vsConfig = vscode.workspace.getConfiguration('stellarDebugger');
    
    this.config = {
      openaiApiKey: vsConfig.get('openaiApiKey') || process.env.OPENAI_API_KEY,
      mistralApiKey: vsConfig.get('mistralApiKey') || process.env.MISTRAL_API_KEY,
      pineconeApiKey: vsConfig.get('pineconeApiKey') || process.env.PINECONE_API_KEY,
      pineconeEnvironment: vsConfig.get('pineconeEnvironment') || process.env.PINECONE_ENVIRONMENT,
      pineconeIndex: vsConfig.get('pineconeIndex') || process.env.PINECONE_INDEX,
      vercelAiModel: vsConfig.get('vercelAiModel') || 'gpt-4'
    };
  }

  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  async validateConfig(): Promise<{ valid: boolean; missing: string[] }> {
    const missing: string[] = [];
    
    if (!this.config.openaiApiKey && !this.config.mistralApiKey) {
      missing.push('AI API Key (OpenAI or Mistral)');
    }
    
    if (!this.config.pineconeApiKey) {
      missing.push('Pinecone API Key');
    }
    
    if (!this.config.pineconeEnvironment) {
      missing.push('Pinecone Environment');
    }
    
    if (!this.config.pineconeIndex) {
      missing.push('Pinecone Index');
    }
    
    return {
      valid: missing.length === 0,
      missing
    };
  }

  async promptForMissingConfig(): Promise<boolean> {
    const validation = await this.validateConfig();
    
    if (validation.valid) {
      return true;
    }
    
    const message = `Missing configuration: ${validation.missing.join(', ')}. Would you like to configure now?`;
    const action = await vscode.window.showWarningMessage(message, 'Configure', 'Cancel');
    
    if (action === 'Configure') {
      await vscode.commands.executeCommand('workbench.action.openSettings', 'stellarDebugger');
      return false;
    }
    
    return false;
  }
}
