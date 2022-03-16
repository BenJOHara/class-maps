import * as vscode from 'vscode';

export class ClassType{
	name:string = '';

	nLines:number = 0;//number of lines of code that make up the class

    nTokens:number = 0;//number of tokens that the class has


	uri:vscode.Uri;

	//inheritence
	parent:string = '';

	//a part of the class is this class
	hasClasses:string[] = [];
	
	//this class is used in the class
	usesClasses:string[] = [];

	//for CSS
	x:number = 0;
	y:number = 0;

	height:number = 0;
	width:number = 0;


	constructor()
	{

	}
}