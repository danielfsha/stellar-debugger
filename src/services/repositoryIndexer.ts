import * as vscode from 'vscode';
import * as path from 'path';
import { PineconeService } from './pineconeService';
import { AIService } from './aiService';

export interface IndexedFile {
  path: string;
  content: string;
  language: string;
  size: number;
  lastModified: number;
}

export class RepositoryIndexer {
  private static instance: RepositoryIndexer;
  private pineconeService: PineconeService;
  private aiService: AIService;
  private outputChannel: vscode.OutputChannel;
  private isIndexing: boolean = false;

  private constructor() {
    this.pineconeService = PineconeService.getInstance();
    this.aiService = AIService.getInstance();
    this.outputChannel = vscode.window.createOutputChannel('Stellar Indexer');
  }

  static getInstance(): RepositoryIndexer {
    if (!RepositoryIndexer.instance) {
      RepositoryIndexer.instance = new RepositoryIndexer();
    }
    return RepositoryIndexer.instance;
  }

  async indexRepository(): Promise<void> {
    if (this.isIndexing) {
      vscode.window.showWarningMessage('Repository indexing already in progress');
      return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
      vscode.window.showErrorMessage('No workspace folder found');
      return;
    }

    this.isIndexing = true;
    this.outputChannel.show();
    this.outputChannel.appendLine('\n=== Starting Repository Indexing ===\n');
    this.outputChannel.appendLine(`Workspace: ${workspaceFolder.uri.fsPath}\n`);

    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Indexing Repository',
          cancellable: false
        },
        async (progress) => {
          // Find all relevant files
          progress.report({ message: 'Discovering files...' });
          const files = await this.discoverFiles();
          this.outputChannel.appendLine(`Found ${files.length} files to index\n`);

          // Index files in batches
          const batchSize = 10;
          for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            const percentage = Math.round((i / files.length) * 100);
            
            progress.report({ 
              message: `Indexing files... ${percentage}%`,
              increment: (batchSize / files.length) * 100
            });

            await this.indexFileBatch(batch);
            this.outputChannel.appendLine(`Indexed ${Math.min(i + batchSize, files.length)}/${files.length} files`);
          }

          this.outputChannel.appendLine('\n✓ Repository indexing completed successfully\n');
          vscode.window.showInformationMessage(
            `Successfully indexed ${files.length} files from repository`
          );
        }
      );
    } catch (error) {
      this.outputChannel.appendLine(`\n✗ Indexing failed: ${error}\n`);
      vscode.window.showErrorMessage(`Repository indexing failed: ${error}`);
    } finally {
      this.isIndexing = false;
    }
  }

  private async discoverFiles(): Promise<vscode.Uri[]> {
    const includePatterns = [
      '**/*.rs',      // Rust files
      '**/*.toml',    // Cargo/config files
      '**/*.md',      // Documentation
      '**/*.json',    // Config files
      '**/*.ts',      // TypeScript
      '**/*.js',      // JavaScript
      '**/*.sol',     // Solidity (if any)
    ];

    const excludePatterns = [
      '**/node_modules/**',
      '**/target/**',
      '**/.git/**',
      '**/dist/**',
      '**/out/**',
      '**/build/**',
      '**/*.lock',
      '**/pnpm-lock.yaml',
      '**/package-lock.json',
    ];

    const files: vscode.Uri[] = [];

    for (const pattern of includePatterns) {
      const foundFiles = await vscode.workspace.findFiles(
        pattern,
        `{${excludePatterns.join(',')}}`
      );
      files.push(...foundFiles);
    }

    return files;
  }

  private async indexFileBatch(files: vscode.Uri[]): Promise<void> {
    const indexPromises = files.map(file => this.indexFile(file));
    await Promise.allSettled(indexPromises);
  }

  private async indexFile(fileUri: vscode.Uri): Promise<void> {
    try {
      const content = await vscode.workspace.fs.readFile(fileUri);
      const contentStr = Buffer.from(content).toString('utf8');
      
      // Skip very large files (> 1MB)
      if (contentStr.length > 1024 * 1024) {
        this.outputChannel.appendLine(`Skipping large file: ${fileUri.fsPath}`);
        return;
      }

      const stat = await vscode.workspace.fs.stat(fileUri);
      const relativePath = vscode.workspace.asRelativePath(fileUri);
      const language = this.detectLanguage(fileUri.fsPath);

      // Generate embedding for file content
      const embedding = await this.aiService.generateEmbedding(
        `${relativePath}\n${contentStr.substring(0, 5000)}` // First 5000 chars
      );

      // Index in Pinecone
      await this.pineconeService.indexTestResult(
        {
          id: `file-${relativePath}-${Date.now()}`,
          testType: 'repository-file',
          fileName: relativePath,
          timestamp: Date.now(),
          passed: true,
          metadata: {
            language,
            size: contentStr.length,
            lastModified: stat.mtime,
            contentPreview: contentStr.substring(0, 500)
          }
        },
        embedding
      );

      this.outputChannel.appendLine(`✓ Indexed: ${relativePath}`);
    } catch (error) {
      this.outputChannel.appendLine(`✗ Failed to index ${fileUri.fsPath}: ${error}`);
    }
  }

  private detectLanguage(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.rs': 'rust',
      '.toml': 'toml',
      '.md': 'markdown',
      '.json': 'json',
      '.ts': 'typescript',
      '.js': 'javascript',
      '.sol': 'solidity',
      '.py': 'python',
      '.go': 'go',
    };
    return languageMap[ext] || 'unknown';
  }

  async reindexFile(fileUri: vscode.Uri): Promise<void> {
    this.outputChannel.appendLine(`\nRe-indexing file: ${fileUri.fsPath}`);
    await this.indexFile(fileUri);
  }
}
