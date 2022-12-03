// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "i18n-code-completion" is now active!');

	let globalJson = {};
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('i18n-code-completion.helloWorld', async () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from i18n-code-completion!');
		// console.log("yo yo yo");

		// vscode.workspace.openTextDocument(vscode.Uri.file("./index.json")).then((document) => {
		// const files = await vscode.workspace.findFiles('**/*.*');
		// console.log(files);

		const fileName = 'C:\\projects\\i18n-code-completion\\index.json';
		vscode.workspace.openTextDocument(vscode.Uri.file(fileName)).then((document) => {
			let text = document.getText();
			const json = JSON.parse(text)
			console.log(json);

			globalJson = json;
		});



		// const res = await vscode.workspace.fs.readFile(vscode.Uri.file("index.json"));
		// const jsonString = Buffer.from(res).toString('utf8')
		// console.log(jsonString)
		// const parsedData = JSON.parse(jsonString)
		// console.log(parsedData)
	});

	let _provideCompletionItems = {
		provideCompletionItems(
			document: vscode.TextDocument,
			position: vscode.Position,
			token: vscode.CancellationToken,
			context: vscode.CompletionContext
		) {
			
		const fileName = 'C:\\projects\\i18n-code-completion\\index.json';
		vscode.workspace.openTextDocument(vscode.Uri.file(fileName)).then((document) => {
			let text = document.getText();
			const json = JSON.parse(text)
			console.log(json);

			globalJson = json;
		});


			console.log('document', document);
			console.log('position', position);
			console.log('token', token);
			console.log('documentText', document.lineAt(position.line));
			const completion = {
				hello: {
					world: 'end',
					yo: "lol"
				}
			};

			const text = document.lineAt(position.line).text;
			console.log('Object.keys(completion)[0]', Object.keys(globalJson)[0])
			console.log('text', text)
			console.log(Object.keys(globalJson)[0] === text);

			const findAllIndexes = (s: string, value: string) => {
				var indexes = [], i = -1;
				while ((i = s.indexOf(value, i+1)) != -1){
					indexes.push(i);
				}
				return indexes;
			}
			
			const keys = Object.keys(globalJson);
			const key = keys.find(key => text.includes('\'' + key + ".'") || text.includes('"' + key + '."'));
			if (key) {
				const keys1 = Object.keys((globalJson as any)[key]);
				const key1 = keys1.find(x1 => text.includes(key + "." + x1));
				if (key1) {
					console.log("been here");
					const result = Object.keys(Object.values((globalJson as any)[key1]) as any).map(x => new vscode.CompletionItem(x));
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
	let disp = vscode.languages.registerCompletionItemProvider("html", _provideCompletionItems)

	context.subscriptions.push(disposable);
	context.subscriptions.push(disp);
}

// This method is called when your extension is deactivated
export function deactivate() { }
