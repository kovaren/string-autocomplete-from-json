import * as vscode from 'vscode';
import JsonReferenceProvider from './jsonReferenceProvider';
import JsonDefinitionProvider from './jsonDefinitionProvider';

export default class JsonRenameProvider implements vscode.RenameProvider {
    async provideRenameEdits(document: vscode.TextDocument, position: vscode.Position, newName: string) {
        const { sourceDocument, location } = await this.findSource(document, position);
        const references = await new JsonReferenceProvider().provideReferences(sourceDocument, location);

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

    async findSource(document: vscode.TextDocument, position: vscode.Position) {
        if (document.languageId === 'json') {
            return { sourceDocument: document, location: position };
        }
        const definition = await new JsonDefinitionProvider().provideDefinition(document, position);
        if (!definition) {
            throw new Error(`Renaming failed, no completion source found for ${document.fileName}`);
        }

        const location = definition.range.start;
        const sourceDocument = await vscode.workspace.openTextDocument(definition.uri);
        return { sourceDocument, location };
    }

    prepareRename?(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Range> {
        return document.getWordRangeAtPosition(position);
    }
}