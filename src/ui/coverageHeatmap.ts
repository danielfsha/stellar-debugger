import * as vscode from 'vscode';

export class CoverageHeatmap {
  private decorationType: vscode.TextEditorDecorationType;

  constructor() {
    this.decorationType = vscode.window.createTextEditorDecorationType({
      backgroundColor: 'rgba(255,0,0,0.3)',
    });
  }

  showCoverage(ranges: vscode.Range[]) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      editor.setDecorations(this.decorationType, ranges);
    }
  }
}
