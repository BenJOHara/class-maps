import * as vscode from 'vscode';


export class Tokens{
    public t : string[];
    
    public uri : vscode.Uri;

    public lines : number;

    constructor(tokens : string[], uri : vscode.Uri, lines: number)
    {
        this.t = tokens;
        this.uri = uri;
        this.lines = lines;
    }
}