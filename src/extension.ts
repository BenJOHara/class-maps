import * as vscode from 'vscode';

class ClassType{
	name:string;
	length:number;
	constructor(_name:string, _length:number)
	{
		this.name = _name;
		this.length = _length;
	}
}

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
			}
		});
	}
	private async getNumberOfFiles()
	{
		const files = await vscode.workspace.findFiles('**/*.java');
		return files.length;
	}

	private async getFiles()
	{
		const files = await vscode.workspace.findFiles('**/*.java');
		return files;
	}

	private async getNames()
	{
		const uris = await this.getFiles();
		const fileNames : string[] = [];
		for (const uri of uris)
		{
			const file = await vscode.workspace.openTextDocument(uri);
			const text = file.getText();
			const indexOfClassId = text.indexOf('class') + 6;
			fileNames.push(text.substring(indexOfClassId).substring(0, text.substring(indexOfClassId).indexOf('{'))); 
		}
		return fileNames;
	}


	private async getNamesAndSize() {
		const uris = await this.getFiles();
		const fileNames : ClassType[] = [];
		for (const uri of uris)
		{
			const file = await vscode.workspace.openTextDocument(uri);
			const text = file.getText();
			const indexOfClassId = text.indexOf('class') + 6;
			fileNames.push(new ClassType(text.substring(indexOfClassId).substring(0, text.substring(indexOfClassId).indexOf('{')), file.lineCount)); 
		}
		return fileNames;
	}

	public async showClassInfo(){
		const content = await this.getNamesAndSize();
		const JSONtext = JSON.stringify(content);
		if (this._view) {
			this._view.webview.postMessage({ type: 'showClassInfo', content: JSONtext });
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
