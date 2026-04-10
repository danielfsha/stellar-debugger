import * as vscode from "vscode";
import * as path from "path";

/**
 * Recursively get all files and folders in the workspace, excluding node_modules, .git, .vscode, dist, out, .DS_Store, and hidden files/folders.
 * Platform-agnostic (works on Windows, Mac, Linux).
 */
export async function getAllFilesAndFolders(): Promise<string[]> {
  const exclude = [
    "**/node_modules/**",
    "**/.git/**",
    "**/.vscode/**",
    "**/dist/**",
    "**/out/**",
    "**/.DS_Store",
    "**/Thumbs.db",
    "**/.*", // hidden files/folders
  ];
  const files = await vscode.workspace.findFiles("**/*", `{${exclude.join(",")}}`);
  // Normalize paths for platform-agnostic output
  return files.map(f => path.normalize(f.fsPath));
}