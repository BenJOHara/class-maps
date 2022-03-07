import * as vscode from 'vscode';

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

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
	)
	{

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
