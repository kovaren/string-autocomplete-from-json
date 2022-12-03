// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "i18n-code-completion" is now active!');

	let _provideCompletionItems = {
		async provideCompletionItems(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken,
			context: vscode.CompletionContext
		) {
			const fileName = 'C:\\projects\\i18n-code-completion\\index.json';
			const file = await vscode.workspace.openTextDocument(vscode.Uri.file(fileName));
			const completionSource = JSON.parse(file.getText());

			const text = document.lineAt(position.line).text;

			const findAllIndexes = (s: string, value: string) => {
				var indexes = [], i = -1;
				while ((i = s.indexOf(value, i + 1)) != -1) {
					indexes.push(i);
				}
				return indexes;
			}

			const keys = Object.keys(completionSource);

			const key = keys.find(key => text.includes('\'' + key + ".'") || text.includes('"' + key + '."'));
			if (key) {
				const keys1 = Object.keys((completionSource as any)[key]);
				const key1 = keys1.find(x1 => text.includes(key + "." + x1));
				if (key1) {
					console.log("been here");
					const result = Object.keys(Object.values((completionSource as any)[key1]) as any).map(x => new vscode.CompletionItem(x));
					console.log('result', result)
					return result;
				} else {
					console.log("been here");
					const result = keys1.map(x => new vscode.CompletionItem(x));
					console.log('result', result)
					return result;
				}
			} else {
				const indexes = findAllIndexes(text, "''").concat(findAllIndexes(text, '""'));
				if (indexes.includes(position.character - 1))
					return keys.map(x => new vscode.CompletionItem(x));
				else
					return [];
			}
		},
	};

	// let disp = vscode.languages.registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider<CompletionItem>, ...triggerCharacters: string[])
	let disposable = vscode.languages.registerCompletionItemProvider("html", _provideCompletionItems)

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
