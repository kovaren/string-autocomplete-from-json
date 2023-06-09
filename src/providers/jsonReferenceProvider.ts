import * as vscode from 'vscode';
import { findDestinationPattern } from '../utils/utils';
const jsonMap = require('json-source-map');

export default class JsonReferenceProvider implements vscode.ReferenceProvider {
    async provideReferences(document: vscode.TextDocument, position: vscode.Position) {
        const destination = await findDestinationPattern(document);
        if (!destination) {
            return [];
        }
        
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return [];
        }

        const mapping = jsonMap.parse(document.getText());
        // find the full key that corresponds to the currently selected word in JSON file
        const entry = Object.entries(mapping.pointers).find(([key, value]: [any, any]) => {
            const sameLine = value.key?.line === wordRange.start.line;
            const sameStart = value.key?.column === wordRange.start.character - 1;
            const sameEnd = value.keyEnd?.column === wordRange.end.character + 1;
            return sameLine && sameStart && sameEnd;
        });
        if (!entry) {
            return [];
        }

        const word = entry[0].substring(1).replace(/\//g, '.');
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(vscode.workspace.workspaceFolders![0], destination.destinationPattern), '**/node_modules/**');
        const references: vscode.Location[] = [];
        for (const file of files) {
            const document = await vscode.workspace.openTextDocument(file);
            const text = document.getText();
            let match: RegExpExecArray | null;
            const regex = new RegExp(`\\b${word}\\b`, 'g');
            while ((match = regex.exec(text)) !== null) {
                const referencePosition = document.positionAt(match.index + word.length);
                const referenceLocation = new vscode.Location(document.uri, referencePosition);
                references.push(referenceLocation);
            }
        }
        return references;
    }
}