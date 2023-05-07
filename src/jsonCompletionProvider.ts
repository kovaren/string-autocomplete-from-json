import { minimatch } from 'minimatch';
import * as vscode from 'vscode';
import { insideQuotes, isPathAbsolute } from './utils';
import { CompletionItemKind } from 'vscode';

export default class JsonCompletionProvider implements vscode.CompletionItemProvider {
    async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
    ) {
        let { config } = vscode.workspace.getConfiguration('jsonCodeCompletion');

        const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;

        // TODO add comprehensive description in package.json for pattern, source, it will show up in settings.json

        // TODO
        // Ctrl+mouseover show preview of object and Ctrl+click => jump to source like in CreateTenantEndpoint
        // why Constant is intellisensed in CreateTenantEndpoint but not CommonConstant is not?
        // make this extension work with exported JS object like in CommonConstant ? maybe works already

        // FIXME
        // completion inside json file not working

        // TODO
        // rename to autocomplete ?

        let foundSource = null;
        for (const { destinationPattern, sourcePath } of config) {
            let relativeFileName = document.fileName.replace(workspacePath + '\\', '').replace(/\\/g, '/');
            if (destinationPattern.startsWith('./')) {
                relativeFileName = './' + relativeFileName;
            }
            if (minimatch(relativeFileName, destinationPattern, { dot: true })) {
                foundSource = sourcePath;
                break;
            }
        }
        if (!foundSource) {
            return;
        }

        const source = isPathAbsolute(foundSource) ? foundSource : workspacePath.replace(/\\/g, '/') + '/' + foundSource;

        const file = await vscode.workspace.openTextDocument(vscode.Uri.file(source));
        const completionSource = JSON.parse(file.getText());

        const text = document.lineAt(position.line).text;

        const textInsideQuotes = insideQuotes(text, position);
        if (textInsideQuotes !== null) {
            return this.getItems(completionSource, '', textInsideQuotes, foundSource);
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