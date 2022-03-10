
import * as vscode from 'vscode';

export class ClassType{
	name:string;
	length:number;//number of lines of code that make up the class
    width:number;//number of tokens that the class has
	uri:vscode.Uri;

	//inheritence
	parent:string;

	//a part of the class is this class
	hasClasses:string[];
	
	//this class is used in the class
	usesClasses:string[];

	constructor(_name:string, _length:number, _width:number, _uri:vscode.Uri, _parent:string, _hasClasses:string[], _usesClasses:string[])
	{
		this.name = _name;
		this.length = _length;
        this.width = _width;
		this.uri = _uri;

		this.parent = _parent;

		this.hasClasses = _hasClasses;
		this.usesClasses = _usesClasses;
	}
}