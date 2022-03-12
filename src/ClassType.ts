
import * as vscode from 'vscode';

export class ClassType{
	name:string = '';
	length:number = 0;//number of lines of code that make up the class
    width:number = 0;//number of tokens that the class has
	uri:vscode.Uri;

	//inheritence
	parent:string = '';

	//a part of the class is this class
	hasClasses:string[] = [];
	
	//this class is used in the class
	usesClasses:string[] = [];

	constructor()
	{

	}
}