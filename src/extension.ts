import * as vscode from 'vscode';
import { ClassForest } from './ClassForest';
import { ClassType } from './ClassType';
import { Tokenizer } from './Tokenizer';
import { Tokens } from './Tokens';

export function activate(context: vscode.ExtensionContext) {
	
	console.log('class-maps is now active');

	const provider = new ClassViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClassViewProvider.viewType, provider));

	context.subscriptions.push(
		vscode.commands.registerCommand('class-maps.show-names', () => {
			
		}));

	context.subscriptions.push(
		vscode.commands.registerCommand('class-maps.show-number', () => {
			
		}));
	
	context.subscriptions.push(
		vscode.commands.registerCommand('class-maps.show-class-info', () =>{
			
		}));
	console.log("end activate Start");
}

class ClassViewProvider implements vscode.WebviewViewProvider{

	public static readonly viewType = 'class-maps.map-view';
	
	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(		
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	)
	{
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async data=>{
			switch (data.type)
			{
				case 'getNames':
					{
						//webviewView.webview.postMessage({ type: 'showNames', content: ['Hello from showNames', 'element from button'] });
						await this.showNames();
						break;
					}
				case 'getNumber':
					{
						//webviewView.webview.postMessage({ type: 'showNumber', content: ['Hello from showNumber', 'element from button'] });
						await this.showNumber();
						break;
					}
				case 'getClassInfo':
					{
						await this.showClassInfo();
						break;
					}
				case 'openWindow':
					{
						//console.log(data.content);
						const page : vscode.TextDocument = await vscode.workspace.openTextDocument(data.content.fsPath);
						await vscode.window.showTextDocument(page);
					}
			}
		});
	}


	private async getNumberOfFiles()
	{
		const files: vscode.Uri[] = await vscode.workspace.findFiles('**/*.java');
		return files.length;
	}

	private async getFiles()
	{
		const files : vscode.Uri[]= await vscode.workspace.findFiles('**/*.java');
		return files;
	}

	private async getNames()
	{
		const uris : vscode.Uri[] = await this.getFiles();
		const fileNames : string[] = [];
		for (const uri of uris)
		{
			const file = await vscode.workspace.openTextDocument(uri);
			const text = file.getText();
			const indexOfClassId = text.indexOf('class ') + 6;
			fileNames.push(text.substring(indexOfClassId).substring(0, text.substring(indexOfClassId).indexOf('{'))); 
		}
		return fileNames;
	}

	private async getNamesAndSize() {
		const uris = await this.getFiles();
		const classes : ClassType[] = [];
		const files : vscode.TextDocument[] = [];
		for (const uri of uris)
		{
			const file = await vscode.workspace.openTextDocument(uri);
			files.push(file);
		}

		const tokenizer : Tokenizer = new Tokenizer(files);
		const tokens : Tokens [] = tokenizer.getTokens();
		let numberOfClasses = 0;
		let classFound : boolean = false;
		let braceFound : boolean = false;
		let braceTally : number = 0;
		let lineCount : number = 0;
		let startOfClass : number = 0;
		//TODO: assign -/name, -/length, -/width, -/uri, -/parent, this second --> hasClasses, usesClasses
		tokens.forEach( (token, i) => token.t.forEach( (t, j) => {
			if (t === 'class')
			{
				startOfClass = j;
				numberOfClasses++;
				classFound = true;
				classes[numberOfClasses - 1] = new ClassType();
				classes[numberOfClasses - 1].uri = token.uri;
				classes[numberOfClasses - 1].name = token.t[j + 1];
				
			}
			else if (t === 'extends') 
			{
				//has parent
				classes[numberOfClasses - 1].parent = token.t[j + 1];// -1 as zero index and j+ 1 cus class name is next token
			}
			else if (t === '{')
			{
				braceFound = true;
				braceTally++;
			}
			else if (t === '}')
			{
				braceTally = braceTally - 1;
			}
			else if (t === '\n')
			{
				lineCount++;
			}
			if (braceTally === 0 && braceFound && classFound)
			{
				classes[numberOfClasses - 1].nLines = lineCount;
				classes[numberOfClasses - 1].nTokens = j - startOfClass;
				console.log(classes[numberOfClasses - 1].name, lineCount, j - startOfClass);
				//end of a class should have all info
				classFound = false;
				braceFound = false;
				lineCount = 0;
			}

		}));
		//console.log(classes);
		return classes;
	}


	private sortClassesArray(classes : ClassType []) : ClassType[]
	{
		const a1 : ClassType[] = [];
		const a2 : ClassType[] = [];

		if (classes.length === 1)
		{
			return classes;
		}
		else if (classes.length === 0)
		{
			return [];
		}
		else 
		{
			const pivot = classes[0];
			for (let i = 1; i < classes.length; i++)
			{
				if (this.compareClasses(pivot, classes[i]))//true if pivot smaller
				{
					a1.push(classes[i]);
				}
				else
				{
					a2.push(classes[i]);
				}
			}
			return this.sortClassesArray(a1).concat(classes[0]).concat(this.sortClassesArray(a2));
		}

	}

	private compareClasses(a : ClassType, b : ClassType)
    {
        if (a.nLines < b.nLines)
        {
            return true;
        }
        else 
        {
            return false;
        }
    }

	private setCoords(classes: ClassType[])
	{	
		const forest = new ClassForest();
		forest.createForest(classes);//ahaha this worked first time nice :)
		console.log(forest.trees);
	}

	public async showClassInfo(){
		const content = await this.getNamesAndSize();
		const sorted = this.sortClassesArray(content);
		const arraigned = this.setCoords(sorted);
		const jsonText = JSON.stringify(sorted);
		if (this._view) {
			this._view.webview.postMessage({ type: 'showClassInfo', content: jsonText });
		}
	}

	//dont need this cus will be done by button in ui instead of command
	public async showNames() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'showNames', content: await this.getNames() });
		}
	}
	//dont need this ||
	public async showNumber() {
		if (this._view) {
			this._view.webview.postMessage({ type: 'showNumber', content: [ await this.getNumberOfFiles()] });
		}
	}
	private _getHtmlForWebview(webview: vscode.Webview) {
		// Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));

		// Do the same for the stylesheet.
		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
		const styleMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.css'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
				<link href="${styleMainUri}" rel="stylesheet">
				
				<title>Class Map</title>
			</head>
			<body>
				<button class="show-names">Show class names</button>
				<button class="show-number">Show number of classes</button>
				<button class="show-class-info">Show classes and their sizes</button>
				<svg class="svg1" width="0" height="0">
				</svg>

				<ul class="class-list">
				</ul>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
export function deactivate() {}


function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
