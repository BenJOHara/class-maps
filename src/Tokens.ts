import * as vscode from 'vscode';


export class Tokens{
    t : string[];
    
    uri : vscode.Uri;

    constructor(tokens : string[], uri : vscode.Uri)
    {
        this.t = tokens;
        this.uri = uri;
    }
}