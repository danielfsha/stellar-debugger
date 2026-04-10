import * as vscode from "vscode";

export class AIInsightsPanel {
  private panel: vscode.WebviewPanel | undefined;

  show(insights: any) {
    if (!this.panel) {
      this.panel = vscode.window.createWebviewPanel(
        "aiInsights",
        "AI Insights",
        vscode.ViewColumn.Beside,
        {},
      );
    }
    this.panel.webview.html = `<html><body><pre>${JSON.stringify(insights, null, 2)}</pre></body></html>`;
  }
}
