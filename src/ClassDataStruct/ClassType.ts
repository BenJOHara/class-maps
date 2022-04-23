import * as vscode from 'vscode';

export class ClassType{
	name:string = '';
	parent:string = '';
	uri:vscode.Uri;

	nLines:number = 0;//number of lines of code that make up the class
    nTokens:number = 0;//number of tokens that the class has

	hiddenWidth = 0;


	//inheritence
	parentType: ClassType;

	//a part of the class is this class
	hasClasses:string[] = [];
	
	//this class is used in the class
	usesClasses:string[] = [];
	
	dependsOn:string[] = [];

	//for CSS
	x:number = 0;
	y:number = 0;

	height:number = 0;
	width:number = 0;

	//bottom middle = width + 1/2 * x,height + y

	scale:number = 2;

	external:boolean = false;

	public setParentType(c: ClassType){
		this.parentType = c;
	}
}