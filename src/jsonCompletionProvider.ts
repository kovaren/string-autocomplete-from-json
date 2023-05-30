import { minimatch } from 'minimatch';
import * as vscode from 'vscode';
import { findCompletionSource, extractTextInQuotes, isPathAbsolute } from './utils';
import { CompletionItemKind } from 'vscode';

export default class JsonCompletionProvider implements vscode.CompletionItemProvider {
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ) {
        const source = findCompletionSource(document);
        if (!source) {
            return null;
        }
        const file = await vscode.workspace.openTextDocument(vscode.Uri.file(source.localPath));
        const completionSource = JSON.parse(file.getText());
        const text = document.lineAt(position.line).text;
        
        const textInQuotes = extractTextInQuotes(text, position);
        if (textInQuotes !== null) {
            return this.getItems(completionSource, '', textInQuotes, source.originalPath);
        } else {
            return [];
        }
    }

    private getItems(source: { [key: string]: any } | string, currentKey: string, text: string, fileName: string): vscode.CompletionItem[] {
        if (this.isPrimitiveType(source)) {
            if (text.endsWith(currentKey + '.')) {
                return [this.createItem(source + '', fileName, CompletionItemKind.Constant)];
            } else {
                return [];
            }
        } else {
            const keys = Object.keys(source);
            const prefix = currentKey ? currentKey + '.' : '';
            const key = keys.find(key => text.startsWith(prefix + key + "."));
            if (key) {
                // FIXME remove any
                return this.getItems((source as any)[key], prefix + key, text, fileName);
            } else if (text === prefix) {
                // TODO only show description for currently selected item (see Emmet as an example)
                return keys.map(key => this.createItem(key, fileName, CompletionItemKind.EnumMember));
            } else {
                return [];
            }
        }
    };

    private createItem(key: string, sourceFileName: string, kind: CompletionItemKind) {
        const item = new vscode.CompletionItem({ label: key, description: sourceFileName });
        item.insertText = key;
        item.sortText = ' ' + key;
        item.commitCharacters = ['.'];
        item.kind = kind;
        return item;
    };

    private isPrimitiveType(value: unknown) {
        return value === null || typeof value !== 'object';
    }
}