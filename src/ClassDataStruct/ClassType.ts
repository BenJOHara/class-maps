import * as vscode from 'vscode';

export class ClassType{
	name:string = '';

	nLines:number = 0;//number of lines of code that make up the class

    nTokens:number = 0;//number of tokens that the class has

	hiddenWidth = 0;

	uri:vscode.Uri;

	//inheritence
	parent:string = '';

	parentType: ClassType;

	//a part of the class is this class
	hasClasses:string[] = [];
	
	//this class is used in the class
	usesClasses:string[] = [];

	//for CSS
	x:number = 0;
	y:number = 0;

	height:number = 0;
	width:number = 0;

	//bottom middle = width + 1/2 * x,height + y

	scale:number = 1;

	external:boolean = false;

	constructor()
	{

	}

	public setParentType(c: ClassType){
		this.parentType = c;
	}
}