import * as vscode from 'vscode';

export class ClassType{
	name:string = '';
	parent:string = '';
	uri:vscode.Uri;//uri of file class is stored in
	nLines:number = 0;//number of lines of code that make up the class
    nTokens:number = 0;//number of tokens that the class has
	hiddenWidth = 0;
	parentType: ClassType;
	hasClasses:string[] = [];
	usesClasses:string[] = [];
	dependsOn:string[] = [];
	external:boolean = false;

	//for CSS
	x:number = 0;
	y:number = 0;

	height:number = 0;
	width:number = 0;

	scale:number = 2;

	public setParentType(c: ClassType){
		this.parentType = c;
	}
}