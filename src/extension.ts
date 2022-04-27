import { performance } from 'perf_hooks';
import * as vscode from 'vscode';
import { ClassForest } from './ClassDataStruct/ClassForest';
import { ClassType } from './ClassDataStruct/ClassType';
import { Parser } from './Parser';
import { Tokenizer } from './TokensFiles/Tokenizer';
import { Tokens } from './TokensFiles/Tokens';


//registers webview
export function activate(context: vscode.ExtensionContext) {

	console.log('class-maps is now active');

	const provider = new ClassViewProvider(context.extensionUri);

	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(ClassViewProvider.viewType, provider));

	/*context.subscriptions.push(
		vscode.commands.registerCommand('class-maps.show-class-info', () => {

		}));*/
	console.log("end activate Start");
}

//sets webview settings
//recieves message from main.js
class ClassViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'class-maps.map-view';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		webviewView.webview.onDidReceiveMessage(async data => {
			switch (data.type) {
				case 'getClassInfo':
					{
						await this.showClassInfo();
						break;
					}
				case 'openWindow':
					{
						const page: vscode.TextDocument = await vscode.workspace.openTextDocument(data.content.fsPath);
						await vscode.window.showTextDocument(page);
					}
			}
		});
	}

	//gets all files from workspace
	private async getFiles() {
		const files: vscode.Uri[] = await vscode.workspace.findFiles('**/*.java');
		return files;
	}


	private async openFiles(uris : vscode.Uri[])
	{
		const files: vscode.TextDocument[] = [];
		for (const uri of uris) {
			const file = await vscode.workspace.openTextDocument(uri);
			files.push(file);
		}
		return files;
	}

	//checks if a name exists in an array of classtypes
	private doesParentExist(classes: ClassType[], parent: string) {
		for (let i = 0; i < classes.length; i++) {
			if (classes[i].name === parent) {
				return true;
			}
		}
		return false;
	}
	//gets all classes as ClassTypes in the workspace
	//
	private async getClasses() {
		let timeAtStart = performance.now();
		const basicType: string[] = ["boolean", "byte", "char", "double", "float", "int", "long", "short"];
		
		let getFilesStart = performance.now();

		const uris : vscode.Uri[]= await this.getFiles();

		const files: vscode.TextDocument[] = await this.openFiles(uris);

		let getFilesEnd = performance.now();

		let tokenizerStart = performance.now();
		const tokenizer: Tokenizer = new Tokenizer(files);
		const tokensAll: Tokens[] = tokenizer.getTokens();

		const parser = new Parser(tokensAll);
		const classes : ClassType [] = parser.getClassData();
		return classes;
	}
	

	//sets the height and width of all classes
	private setSize(classes: ClassType[]) {
		const maxWidth = 25;
		for (let i: number = 0; i < classes.length; i++) {
			classes[i].height = classes[i].nLines * classes[i].scale;
			classes[i].width = maxWidth;//default can change this in some ways idk yet
		}
		return classes;
	}

	//gets all the classes and then sets all the needed vars for classmapview
	//sends the classtype data to the main.js
	//
	public async showClassInfo() {
		let startTimeGet = performance.now();
		const content = await this.getClasses();//need to set height and width based of a scale 
		let endTimeGet = performance.now();
		console.log("Time taken for getClasses: " + (endTimeGet - startTimeGet));

		this.setSize(content);
		let startTimeCreateForest = performance.now();
		const forest = new ClassForest(content);
		let startTimeSortChildren = performance.now();
		//forest.sortIfChildren();
		forest.sortTreesByTotalChildren();
		let startTimeSetCoords = performance.now();
		forest.setCoords();
		let endTimeCreateForest = performance.now();

		console.log("Time taken for forest creation: " + (startTimeSortChildren - startTimeCreateForest) + " : " 
					+ (startTimeSetCoords - startTimeSortChildren) + " : " + (endTimeCreateForest - startTimeSetCoords));

		const jsonText = JSON.stringify(content);
		if (this._view) {
			this._view.webview.postMessage({ type: 'showClassInfo', content: jsonText });
		}
	}

	//
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
				<button class="show-class-info">Show classes and their sizes</button>
				<div class="svgDiv" style="border:3px solid green;width:100px;height:100px;overflow:scroll;">
					<svg class="svg1" width="0" height="0">
					</svg>
				</div>
				
				<ul class="class-list">
				</ul>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
export function deactivate() { }

//This comes with vscode webview extensions and is published by microsoft under the MIT licence
function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
