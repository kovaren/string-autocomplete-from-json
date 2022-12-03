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

			console.log('text', text)
			const insideQuotes = (() => {
				const left = text.substring(0, position.character);
				const right = text.substring(position.character, text.length);
				if (left.includes("'") && right.includes("'")) {
					const l = left.split("'");
					const r = right.split("'");
					return l[l.length - 1] + r[0];
				} else return null;
			})();
			console.log('insideQuotes', insideQuotes)

			if (insideQuotes !== null) {
				const keys = Object.keys(completionSource);

				const key = keys.find(key => insideQuotes.includes('\'' + key + ".'") || insideQuotes.includes('"' + key + '."'));
				if (key) {
					const keys1 = Object.keys((completionSource as any)[key]);
					const key1 = keys1.find(x1 => insideQuotes.includes(key + "." + x1));
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
					return keys.map(x => new vscode.CompletionItem(x));
				}
			} else return [];
		},
	};

	// function getTokens(source: object, text: string) {
	// 	const keys = Object.keys(source);

	// 	const key = keys.find(key => text.includes('\'' + key + ".'") || text.includes('"' + key + '."'));
	// 	if (key) {
	// 		const keys1 = Object.keys((completionSource as any)[key]);
	// 		const key1 = keys1.find(x1 => text.includes(key + "." + x1));
	// 		if (key1) {
	// 			console.log("been here");
	// 			const result = Object.keys(Object.values((completionSource as any)[key1]) as any).map(x => new vscode.CompletionItem(x));
	// 			console.log('result', result)
	// 			return result;
	// 		} else {
	// 			console.log("been here");
	// 			const result = keys1.map(x => new vscode.CompletionItem(x));
	// 			console.log('result', result)
	// 			return result;
	// 		}
	// 	}
	// }

	// let disp = vscode.languages.registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider<CompletionItem>, ...triggerCharacters: string[])
	let disposable = vscode.languages.registerCompletionItemProvider("html", _provideCompletionItems)

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
