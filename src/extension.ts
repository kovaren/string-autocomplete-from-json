/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import JsonCompletionProvider from './providers/jsonCompletionProvider';
import JsonDefinitionProvider from './providers/jsonDefinitionProvider';
import JsonReferenceProvider from './providers/jsonReferenceProvider';
import JsonRenameProvider from './providers/jsonRenameProvider';
import { extractTextInQuotes } from './utils/utils';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// TODO finish rename provider, test in a big repo

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider("*", new JsonCompletionProvider(), '.'));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider('*', new JsonDefinitionProvider()));

	// { language: 'json', pattern: '**​/package.json' }
	context.subscriptions.push(vscode.languages.registerReferenceProvider('json', new JsonReferenceProvider()));
	context.subscriptions.push(vscode.languages.registerRenameProvider('html', new JsonRenameProvider()));

	// Open suggestions panel on text change inside quotes
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			const position = vscode.window.activeTextEditor?.selection.active;
			if (position) {
				const text = event.document.lineAt(position.line).text;
				const textInQuotes = extractTextInQuotes(text, position!);

				if (textInQuotes !== null) {
					await vscode.commands.executeCommand(
						'editor.action.triggerSuggest',
						{
							'triggerCharacter': '',
							'triggerKind': vscode.CompletionTriggerKind.Invoke,
							'position': position
						}
					);
				}
			}
		})
	);
}

// This method is called when your extension is deactivated
export function deactivate() { }
