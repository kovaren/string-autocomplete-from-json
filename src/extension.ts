/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import JsonCompletionProvider from './jsonCompletionProvider';
import { extractTextInQuotes } from './utils';
import JsonDefinitionProvider from './jsonDefinitionProvider';
import JsonReferenceProvider from './jsonReferenceProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider("*", new JsonCompletionProvider(), '.'));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider('*', new JsonDefinitionProvider()));

	// { language: 'json', pattern: '**​/package.json' }
    context.subscriptions.push(vscode.languages.registerReferenceProvider('json', new JsonReferenceProvider()));

	// TODO
	// vscode.languages.registerRenameProvider

	// Open suggestions panel on press "."
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			const position = vscode.window.activeTextEditor?.selection.active;
			if (position) {
				const text = event.document.lineAt(position.line).text;
				const textInQuotes = extractTextInQuotes(text, position!);
				if (!textInQuotes?.endsWith('.')) {
					return;
				}
			}

			await vscode.commands.executeCommand(
				'editor.action.triggerSuggest',
				{
					'triggerCharacter': '',
					'triggerKind': vscode.CompletionTriggerKind.Invoke,
					'position': position
				}
			);
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
