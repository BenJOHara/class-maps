import { count } from 'console';
import * as vscode from 'vscode';



class ClassType{
	name:string;
	size:number;//number of lines of code that make up the class
	uri:vscode.Uri;

	//inheritence
	parent:string;

	//a part of the class is this class
	hasClasses:string[]; 
	
	//this class is used in the class
	usesClasses:string[];

	constructor(_name:string, _size:number, _uri:vscode.Uri, _parent:string, _hasClasses:string[], _usesClasses:string[])
	{
		this.name = _name;
		this.size = _size;
		this.uri = _uri;

		this.parent = _parent;

		this.hasClasses = _hasClasses;
		this.usesClasses = _usesClasses;
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


	private tokenizer(text:string)
	{
		let lineCount : number = 0;
		let tokens :string [] = [];
		const chars = [...text];
		//last space/; 
		let indexOfLastSpace = 0;
		let c :string [] = [];
		//collapes spaces

		for (let i : number = 0; i < text.length; i++){
			if ( chars[i] === '/')
			{
				if ( chars[i+1] ==='/')
				{
					while (chars[i] !== '\n')
					{
						//console.log("comment 1");
						i++;
					}
				}
				else if ( chars[i+1] === '*')
				{
					while (chars[i] !== '*' && chars[i+1] !== '/')
					{
						i++;
						//console.log("comment 2", chars[i]);
					}
					i++; // leaves on the / so next loop over it is changed to the next
				}
			}
			else if (chars[i] === '"')//strings '' or ""
			{
				let s :string = chars[i];
				i++;
				while (chars[i] !== '"')
				{
					s = s + chars[i];
					//console.log("string 1", chars[i]);
					i++;
				}
				s = s + chars[i];
				tokens.push(s);
			}
			else if (chars[i] === '\'')
			{
				let s :string = chars[i];
				i++;
				while (chars[i] !== '\'')
				{
					s = s + chars[i];
					//console.log("char  1");
					i++;
				}
				s = s + chars[i];
				tokens.push(s);
			}
			else if ((/[a-zA-Z_$]/).test(chars[i]))
			{
				let s :string = chars[i];
				i++;
				const keywords :string [] = [ "abstract", "assert", "boolean",
                "break", "byte", "case", "catch", "char", "class", "const",
                "continue", "default", "do", "double", "else", "extends", "false",
                "final", "finally", "float", "for", "goto", "if", "implements",
                "import", "instanceof", "int", "interface", "long", "native",
                "new", "null", "package", "private", "protected", "public",
                "return", "short", "static", "strictfp", "super", "switch",
                "synchronized", "this", "throw", "throws", "transient", "true",
                "try", "void", "volatile", "while" ];
				
				while ((/[a-zA-Z0-9_$]/).test(chars[i]))
				{
					s = s+ chars[i];
					i++;
					
					//console.log("id 1");
				}
				i--;
				tokens.push(s);//may need to add here to check if is keyword from above
			}
			else if ((/[0-9]/).test(chars[i]))
			{
				let s :string = chars[i];
				i++;
				while ((/[0-9]/).test(chars[i])){
					s = s + chars[i];
					i++;
					//console.log("number 1");
				}
				i--;
				tokens.push(s);
			}
			else if (chars[i] === '\n')
			{
				lineCount++;
			}
			else//i dont care about anything else
			{
				let s : string = '';
				if (chars[i] !== ' ' && chars[i] !== '	' && chars[i] !== '\n' && chars[i] !== ';')
				{
					s = s + chars[i];
					//console.log("symbol 1", chars[i]);
				}
				if ( s === '')
				{

				}
				else 
				{
					tokens.push(s);
				}
			}
		}		
		console.log("tokens found");
		return tokens;
	}

	private parseClassFile(text:string, uri : vscode.Uri)
	{
		//find number of classes
		const tokens : string[] = this.tokenizer(text);
		const classes : ClassType[] = [];
		for (let i : number = 0; i < tokens.length; i++)
		{
			if (tokens[i] === "class")//class found
			{
				let length : number = 0;
				const className : string = tokens[i+1];
				if (tokens.indexOf("class", i + 1) === -1)
				{
					
				}
				else
				{
					length = tokens.indexOf("class", i + 1);
				}
				let parent : string = '';
				if (tokens.indexOf("extends", i + 1) < tokens.indexOf("class", i + 1)){
					parent = tokens[tokens.indexOf("extends", i + 1) + 1];// extends 
				}

				const hasClasses : string [] = [];
				const usesClasses : string [] = [];

				const _uri : vscode.Uri = uri;

				let _class : ClassType = new ClassType(className, length, _uri, parent, hasClasses, usesClasses);
				classes.push(_class);
			}
		}
		return classes;
	}

	private async getNamesAndSize() {
		const uris = await this.getFiles();
		const fileNames : ClassType[] = [];
		for (const uri of uris)
		{
			const file = await vscode.workspace.openTextDocument(uri);
			const text = file.getText();
			fileNames.concat(this.parseClassFile(text, uri));
		}
		return fileNames;
	}

	public async showClassInfo(){
		const content = await this.getNamesAndSize();
		const jsonText = JSON.stringify(content);
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
