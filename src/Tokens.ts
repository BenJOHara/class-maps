import * as vscode from 'vscode';
import { Token } from './Token';


export class Tokens{
    public t : string[];
    
    public tokens : Token[];

    public uri : vscode.Uri;

    public lines : number;

    constructor(tokens : string[], uri : vscode.Uri, lines: number, tokensProper:Token[])
    {
        this.t = tokens;
        this.uri = uri;
        this.lines = lines;
        this.tokens = tokensProper;
    }
}