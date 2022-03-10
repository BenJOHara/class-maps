import * as vscode from 'vscode';
import { Z_PARTIAL_FLUSH } from 'zlib';
import { ClassType } from './ClassType';
import { Tokens } from './Tokens';

//take all workspace files
//collate table of all file IDs
//collate array of all ClassTypes
//will give ClassTypes array to extension
export class Tokenizer {

    private tokens: Tokens[] = [];

    constructor(files : vscode.TextDocument []) 
    {
        for (let i = 0; i < files.length; i++)
        {
            const token = new Tokens(this.tokenize(files[i].getText()), files[i].uri);
            this.tokens.push(token);
        }
    }
    
    public getTokens()
    {
        return this.tokens;
    }

    private tokenize(text:string) {
        let lineCount: number = 0;
        let tokens: string[] = [];
        const chars = [...text];
        //last space/;
        //collapes spaces

        for (let i: number = 0; i < text.length; i++) {
            if (chars[i] === '/') {
                if (chars[i + 1] === '/') {
                    while (chars[i] !== '\n') {
                        i++;
                    }
                }
                else if (chars[i + 1] === '*') {
                    while (chars[i] !== '*' && chars[i + 1] !== '/') {
                        i++;
                    }
                    i++; // leaves on the / so next loop over it is changed to the next
                }
            }
            else if (chars[i] === '"')//strings '' or ""
            {
                let s: string = chars[i];
                i++;
                while (chars[i] !== '"') {
                    s = s + chars[i];
                    i++;
                }
                s = s + chars[i];
                tokens.push(s);
            }
            else if (chars[i] === '\'') {
                let s: string = chars[i];
                i++;
                while (chars[i] !== '\'') {
                    s = s + chars[i];
                    i++;
                }
                s = s + chars[i];
                tokens.push(s);
            }
            else if ((/[a-zA-Z_$]/).test(chars[i])) {
                let s: string = chars[i];
                i++;
                const keywords: string[] = ["abstract", "assert", "boolean",
                    "break", "byte", "case", "catch", "char", "class", "const",
                    "continue", "default", "do", "double", "else", "extends", "false",
                    "final", "finally", "float", "for", "goto", "if", "implements",
                    "import", "instanceof", "int", "interface", "long", "native",
                    "new", "null", "package", "private", "protected", "public",
                    "return", "short", "static", "strictfp", "super", "switch",
                    "synchronized", "this", "throw", "throws", "transient", "true",
                    "try", "void", "volatile", "while"];

                while ((/[a-zA-Z0-9_$]/).test(chars[i])) {
                    s = s + chars[i];
                    i++;
                }
                i--;
                tokens.push(s);//may need to add here to check if is keyword from above
            }
            else if ((/[0-9]/).test(chars[i])) {
                let s: string = chars[i];
                i++;
                while ((/[0-9]/).test(chars[i])) {
                    s = s + chars[i];
                    i++;
                }
                i--;
                tokens.push(s);
            }
            else if (chars[i] === '\n') {
                lineCount++;
            }
            else//i dont care about anything else
            {
                let s: string = '';
                if (chars[i] !== ' ' && chars[i] !== '	' && chars[i] !== '\n' && chars[i] !== ';') {
                    s = s + chars[i];
                }
                if (s === '') {

                }
                else {
                    tokens.push(s);
                }
            }
        }
        console.log("tokens found");
        return tokens;
    }
}