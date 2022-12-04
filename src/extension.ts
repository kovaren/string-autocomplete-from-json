/* eslint-disable curly */
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

			const insideQuotes = (() => {
				const left = text.substring(0, position.character);
				const right = text.substring(position.character, text.length);
				if (left.includes("'") && right.includes("'")) {
					const l = left.split("'");
					const r = right.split("'");
					return l[l.length - 1] + r[0];
				} else return null;
			})();

			if (insideQuotes !== null) {
				return getTokens(completionSource, insideQuotes);
			} else return [];
		},
	};

	const getTokens = (source: { [key: string]: any }, text: string): vscode.CompletionItem[] => {
		const keys = Object.keys(source);
		const key = keys.find(key => text.includes(key + "."));
		// TODO handle lower case
		// const key = keys.map(x => x.toLowerCase()).find(key => text.toLowerCase().includes(key + "."));
		// console.log("================ BEGIN =================");
		// console.log('source', source)
		// console.log('text', text)
		// console.log('key', key)
		// console.log("================= END ==================");
		if (key) {
			return getTokens(source[key], text);
		} else {
			return keys.map(x => new vscode.CompletionItem(x));
		}
	}

	// let disp = vscode.languages.registerCompletionItemProvider(selector: DocumentSelector, provider: CompletionItemProvider<CompletionItem>, ...triggerCharacters: string[])
	let disposable = vscode.languages.registerCompletionItemProvider("html", _provideCompletionItems);

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() { }
