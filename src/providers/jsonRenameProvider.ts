import * as vscode from 'vscode';
import { findCompletionSource, extractTextInQuotes } from '../utils/utils';
const jsonMap = require('json-source-map');

export default class JsonRenameProvider implements vscode.RenameProvider {
    async provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken) {

        const source = findCompletionSource(document);
        if (!source) {
            return;
        }
        const file = await vscode.workspace.openTextDocument(vscode.Uri.file(source.localPath));
        const mapping = jsonMap.parse(file.getText());
        const text = document.lineAt(position.line).text;
        const textInQuotes = extractTextInQuotes(text, position, true);
        const withSlashes = '/' + textInQuotes?.replace(/\./g, '/');
        const map = mapping.pointers[withSlashes];
        if (!map) {
            return Promise.reject(`Renaming failed, no value for "${textInQuotes}" found in JSON completion source: ${file.uri.path}`);
        }
        const { key } = map;
        // const location = key ? new vscode.Location(vscode.Uri.file(source.localPath), new vscode.Position(key.line, key.column)) : null;
        const location = key ? new vscode.Position(key.line, key.column + 1) : null;
        

        const range = file.getWordRangeAtPosition(location!);
        const localRange = document.getWordRangeAtPosition(position)!;
        if (range) {
            const edit = new vscode.WorkspaceEdit();
            edit.replace(file.uri, range, newName);
            edit.replace(document.uri, localRange, newName);
            return edit;
        }
    }

    prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string; }> {
        const source = findCompletionSource(document);
        if (!source) {
            throw new Error(`Renaming failed, no completion source found for ${document.fileName}`);
        }
        return document.getWordRangeAtPosition(position);
    }
}