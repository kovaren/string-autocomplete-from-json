/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { minimatch } from 'minimatch';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Get text between single quotes
	// TODO handle double quotes
	const insideQuotes = (text: string, position: vscode.Position) => {
		const left = text.substring(0, position.character);
		const right = text.substring(position.character, text.length);
		if (left.includes("'") && right.includes("'")) {
			const l = left.split("'");
			const r = right.split("'");
			return l[l.length - 1] + r[0];
		} else return null;
	};

	let _provideCompletionItems = {
		async provideCompletionItems(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken,
			context: vscode.CompletionContext
		) {

			let conf = vscode.workspace.getConfiguration('jsonCodeCompletion');

			// vscode.window.showInformationMessage(conf.get('paths')!);

			const workspacePath = vscode.workspace.workspaceFolders![0].uri.fsPath;

			// TODO add comprehensive description in package.json for pattern, source, it will show up in settings.json
			// TODO handle case when source file is outside workspace ?

			// TODO
			// Ctrl+mouseover show preview of object and Ctrl+click => jump to source like in CreateTenantEndpoint
			// why Constant is intellisensed in CreateTenantEndpoint but not CommonConstant is not?
			// make this extension work with exported JS object like in CommonConstant ? maybe works already
			let foundSource = null;
			for (const { pattern, source } of conf.sourcePaths) {
				let relativeFileName = document.fileName.replace(workspacePath + '\\', '').replace(/\\/g, '/');
				if (pattern.startsWith('./')) {
					relativeFileName = './' + relativeFileName;
				}
				if (minimatch(relativeFileName, pattern, { dot: true })) {
					foundSource = source;
					break;
				}
			}

			if (!foundSource) {
				return;
			}
			const file = await vscode.workspace.openTextDocument(vscode.Uri.file(workspacePath + '/' + foundSource));
			const completionSource = JSON.parse(file.getText());

			const text = document.lineAt(position.line).text;

			const textInsideQuotes = insideQuotes(text, position);
			if (textInsideQuotes !== null) {
				return getTokens(completionSource, textInsideQuotes, foundSource);
			} else return [];
		},
	};

	const getTokens = (source: { [key: string]: any }, text: string, fileName: string): vscode.CompletionItem[] => {
		if (typeof source === 'string') {
			if (text.endsWith(source + '.')) {
				return [];
			} else {
				return [new vscode.CompletionItem({ label: source, description: 'Completion from ' + fileName })];
			}
		} else {
			const keys = Object.keys(source);
			const key = keys.find(key => text.startsWith(key + "."));
			// console.log('keys', keys);

			// TODO handle lower case
			// const key = keys.map(x => x.toLowerCase()).find(key => text.toLowerCase().includes(key + "."));
			// console.log("================ BEGIN =================");
			// console.log('source', source)
			// console.log('text', text)
			// console.log('key', key)
			// console.log("================= END ==================");
			if (key) {
				return getTokens(source[key], text.substring(text.indexOf('.') + 1), fileName);
			} else if (text === '') {
				// TODO only show description for currently selected item (see Emmet as an example)
				return keys.map(x => new vscode.CompletionItem({ label: x, description: 'Completion from ' + fileName }));
			} else {
				return [];
			}
		}
	};

	// let disp = vscode.languages.registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider<CompletionItem>, ...triggerCharacters: string[])
	const disposable = [
		vscode.languages.registerCompletionItemProvider("html", _provideCompletionItems),
		vscode.languages.registerCompletionItemProvider("javascript", _provideCompletionItems),
		vscode.languages.registerCompletionItemProvider("typescript", _provideCompletionItems)
	];

	disposable.forEach(d => context.subscriptions.push(d));

	// Open suggestions panel on press "."
	context.subscriptions.push(
		vscode.workspace.onDidChangeTextDocument(async (event) => {
			const position = vscode.window.activeTextEditor?.selection.active;
			if (position) {
				const text = event.document.lineAt(position.line).text;
				const textInsideQuotes = insideQuotes(text, position!);
				if (!textInsideQuotes?.endsWith('.')) {
					// TODO handle "." that is not at the end of the text?
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
