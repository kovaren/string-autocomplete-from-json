/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { minimatch } from 'minimatch';
import { CompletionItemKind } from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// TODO handle double quotes
	/**
	 * Get text between the opening quote and the cursor inside a quoted piece of text 
	 * 
	 * @param text 
	 * @param position cursor position 
	 * @returns
	 * 	
	 * input: "The quick brown 'fox jumps over' the lazy dog", position just after "s" in "jumps"
	 * 
	 * output: fox jumps
	 */
	const insideQuotes = (text: string, position: vscode.Position) => {
		const left = text.substring(0, position.character);
		const right = text.substring(position.character, text.length);
		if (left.includes("'") && right.includes("'")) {
			const l = left.split("'");
			return l[l.length - 1];
		} else return null;
	};

	const isPathAbsolute = (path: string) => {
		return path.startsWith('/') || /^[A-Za-z]:[\\/]/.test(path);
	};

	let _provideCompletionItems = {
		async provideCompletionItems(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken,
			context: vscode.CompletionContext
		) {

			let { config } = vscode.workspace.getConfiguration('jsonCodeCompletion');

			// vscode.window.showInformationMessage(conf.get('paths')!);

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
				return getItems(completionSource, '', textInsideQuotes, foundSource);
			} else return [];
		},
	};

	const createItem = (key: string, sourceFileName: string, kind: CompletionItemKind) => {
		const item = new vscode.CompletionItem({ label: key, description: sourceFileName });
		item.insertText = key;
		item.sortText = ' ' + key;
		item.commitCharacters = ['.'];
		item.kind = kind;
		return item;
	};

	const isPrimitiveType = (value: unknown) => value === null || typeof value !== 'object';

	const getItems = (source: { [key: string]: any } | string, currentKey: string, text: string, fileName: string): vscode.CompletionItem[] => {
		if (isPrimitiveType(source)) {
			if (text.endsWith(currentKey + '.')) {
				return [createItem(source + '', fileName, CompletionItemKind.Constant)];
			} else {
				return [];
			}
		} else {
			const keys = Object.keys(source);
			const prefix = currentKey ? currentKey + '.' : '';
			const key = keys.find(key => text.startsWith(prefix + key + "."));
			if (key) {
				// FIXME remove any
				return getItems((source as any)[key], prefix + key, text, fileName);
			} else if (text === prefix) {
				// TODO only show description for currently selected item (see Emmet as an example)
				return keys.map(key => createItem(key, fileName, CompletionItemKind.EnumMember));
			} else {
				return [];
			}
		}
	};

	context.subscriptions.push(vscode.languages.registerCompletionItemProvider("*", _provideCompletionItems, '.'));

	// Open suggestions panel on press "."
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			const position = vscode.window.activeTextEditor?.selection.active;
			if (position) {
				const text = event.document.lineAt(position.line).text;
				const textInsideQuotes = insideQuotes(text, position!);
				if (!textInsideQuotes?.endsWith('.')) {
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
