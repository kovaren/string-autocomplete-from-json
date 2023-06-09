/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import JsonCompletionProvider from './providers/jsonCompletionProvider';
import JsonDefinitionProvider from './providers/jsonDefinitionProvider';
import JsonReferenceProvider from './providers/jsonReferenceProvider';
import JsonRenameProvider from './providers/jsonRenameProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider("*", new JsonCompletionProvider(), '.'));
	context.subscriptions.push(vscode.languages.registerDefinitionProvider('*', new JsonDefinitionProvider()));
	context.subscriptions.push(vscode.languages.registerReferenceProvider('json', new JsonReferenceProvider()));
	context.subscriptions.push(vscode.languages.registerRenameProvider('*', new JsonRenameProvider()));
}

// This method is called when your extension is deactivated
export function deactivate() { }
