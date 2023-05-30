import { minimatch } from 'minimatch';
import * as vscode from 'vscode';
import { findCompletionSource, extractTextInQuotes, isPathAbsolute } from './utils';
const jsonMap = require('json-source-map');

export default class JsonDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ) {
        // TODO Ctrl+mouseover show preview of object
        // TODO add typings to the json source map lib
        // TODO handle jump to last value definition, not handled by lib

        const source = findCompletionSource(document);
        if (!source) {
            return;
        }
        const file = await vscode.workspace.openTextDocument(vscode.Uri.file(source.localPath));
        const mapping = jsonMap.parse(file.getText());
        const text = document.lineAt(position.line).text;
        const textInQuotes = extractTextInQuotes(text, position, true);
        const withSlashes = '/' + textInQuotes?.replace(/\./g, '/');

        const { key } = mapping.pointers[withSlashes];
        return key ? new vscode.Location(vscode.Uri.file(source.localPath), new vscode.Position(key.line, key.column)) : null;
    }
}
