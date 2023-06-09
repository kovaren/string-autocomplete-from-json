import * as vscode from 'vscode';
import { findCompletionSource, extractTextInQuotes, isCompletionSource } from '../utils/utils';
import JsonReferenceProvider from './jsonReferenceProvider';
import { ReferenceContext } from 'vscode';
import { CancellationToken } from 'vscode';
const jsonMap = require('json-source-map');

export default class JsonRenameProvider implements vscode.RenameProvider {
    async provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string, token: vscode.CancellationToken) {
        return document.languageId === 'json' ? this.renameFromSource(document, position, newName) : this.renameFromDestination(document, position, newName);
    }

    async renameFromSource(document: vscode.TextDocument, position: vscode.Position, newName: string) {
        const references = await this.findReferences(document, position);

        const edit = new vscode.WorkspaceEdit();
        for (const ref of references) {
            const refDocument = await vscode.workspace.openTextDocument(ref.uri);
            const range = refDocument.getWordRangeAtPosition(ref.range.start);
            edit.replace(refDocument.uri, range!, newName);
        }

        const range = document.getWordRangeAtPosition(position);
        if (range) {
            edit.replace(document.uri, range, newName);
        }
        return edit;
    }

    async renameFromDestination(document: vscode.TextDocument, position: vscode.Position, newName: string) {
        const source = findCompletionSource(document);
        if (!source) {
            return;
        }

        const sourceDocument = await vscode.workspace.openTextDocument(vscode.Uri.file(source.localPath));
        
        const mapping = jsonMap.parse(sourceDocument.getText());
        const text = document.lineAt(position.line).text;
        const textInQuotes = extractTextInQuotes(text, position, true);
        const withSlashes = '/' + textInQuotes?.replace(/\./g, '/');
        const map = mapping.pointers[withSlashes];
        if (!map) {
            return Promise.reject(`Renaming failed, no value for "${textInQuotes}" found in JSON completion source: ${sourceDocument.uri.path}`);
        }
        const { key } = map;
        const location = new vscode.Position(key.line, key.column + 1);
        const references = await this.findReferences(sourceDocument, location);

        const edit = new vscode.WorkspaceEdit();
        for (const ref of references) {
            const refDocument = await vscode.workspace.openTextDocument(ref.uri);
            const range = refDocument.getWordRangeAtPosition(ref.range.start);
            edit.replace(refDocument.uri, range!, newName);
        }

        const range = sourceDocument.getWordRangeAtPosition(location);
        if (range) {
            edit.replace(sourceDocument.uri, range, newName);
        }
        return edit;
    }

    prepareRename?(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Range | { range: vscode.Range; placeholder: string; }> {
        if (document.languageId === 'json' && isCompletionSource(document.uri) || findCompletionSource(document)) {
            return document.getWordRangeAtPosition(position);
        } else {
            throw new Error(`Renaming failed, no completion source found for ${document.fileName}`);
        }
    }

    private async findReferences(document: vscode.TextDocument, location: vscode.Position) {
        return await new JsonReferenceProvider().provideReferences(document, location, {} as ReferenceContext, {} as CancellationToken);
    }
}