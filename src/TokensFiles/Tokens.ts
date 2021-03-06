import * as vscode from 'vscode';
import { Token } from './Token';


export class Tokens{
    public t : string[];
    
    public tokens : Token[];

    public uri : vscode.Uri;

    public lines : number;

    
    constructor(tokens : string[],  lines: number, tokensProper:Token[], uri ? : vscode.Uri,)
    {
        this.t = tokens;
        if (uri !== undefined)
        {
            this.uri = uri;
        }
        this.lines = lines;
        this.tokens = tokensProper;
    }
}