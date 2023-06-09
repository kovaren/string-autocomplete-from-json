import * as vscode from 'vscode';
import { findCompletionSource, extractTextInQuotes, isPathAbsolute } from '../utils/utils';
const jsonMap = require('json-source-map');

export default class JsonDefinitionProvider implements vscode.DefinitionProvider {
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
    ) {
        // TODO Ctrl+mouseover show preview of object
        // TODO add typings to the json source map lib

        const source = findCompletionSource(document);
        if (!source) {
            return;
        }
        const file = await vscode.workspace.openTextDocument(vscode.Uri.file(source.localPath));
        const mapping = jsonMap.parse(file.getText());
        const text = document.lineAt(position.line).text;
        const textInQuotes = extractTextInQuotes(text, position, true)?.trim();
        const withSlashes = '/' + textInQuotes?.replace(/\./g, '/');

        // + 1 to move past the first " character
        const cursorDelta = textInQuotes?.includes('.') ? textInQuotes!.substring(textInQuotes!.lastIndexOf('.')).length : textInQuotes!.length + 1;

        const { key } = mapping.pointers[withSlashes];
        return key ? new vscode.Location(vscode.Uri.file(source.localPath), new vscode.Position(key.line, key.column + cursorDelta)) : null;
    }
}
