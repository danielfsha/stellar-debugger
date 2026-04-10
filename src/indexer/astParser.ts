import ts from "typescript";
import { SymbolInfo } from "../types";

export class ASTParser {
  public parseFile(filePath: string, fileContent: string): SymbolInfo[] {
    const sourceFile = ts.createSourceFile(
      filePath,
      fileContent,
      ts.ScriptTarget.Latest,
      true,
    );
    const symbols: SymbolInfo[] = [];

    function visit(node: ts.Node) {
      if (ts.isFunctionDeclaration(node) && node.name) {
        symbols.push({
          name: node.name.text,
          kind: "function",
          file: filePath,
          location: {
            line:
              sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
              1,
            character:
              sourceFile.getLineAndCharacterOfPosition(node.getStart())
                .character + 1,
          },
          signature: node.getText(),
        });
      }
      if (ts.isClassDeclaration(node) && node.name) {
        symbols.push({
          name: node.name.text,
          kind: "class",
          file: filePath,
          location: {
            line:
              sourceFile.getLineAndCharacterOfPosition(node.getStart()).line +
              1,
            character:
              sourceFile.getLineAndCharacterOfPosition(node.getStart())
                .character + 1,
          },
          signature: node.getText(),
        });
      }
      ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return symbols;
  }
}
