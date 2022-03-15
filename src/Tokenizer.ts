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
            const done = this.tokenize(files[i].getText());
            const token = new Tokens(done.tokens, files[i].uri, done.lineCount);
            //console.log( files[i].fileName, "tokens found", token.lines, token.t.length);
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
            if (chars[i] === '/') {//comments
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
                if (chars[i] === '"'){//need to catch \"
                    //console.log(i);
                }
                while (chars[i] !== '"' || (chars[i] === '"' && chars[i - 1] === '\\')) {
                    s = s + chars[i];
                    i++;
                }
                s = s + chars[i];
                tokens.push(s);
            }
            else if (chars[i] === '\'') {//strings
                let s: string = chars[i];
                i++;
                while (chars[i] !== '\'') {
                    s = s + chars[i];
                    i++;
                }
                s = s + chars[i];
                tokens.push(s);
            }
            else if ((/[a-zA-Z_$]/).test(chars[i])) {//ids 
                let s: string = chars[i];
                i++;

                while ((/[a-zA-Z0-9_$.]/).test(chars[i])) {
                    s = s + chars[i];
                    i++;
                }
                i--;
                tokens.push(s);//may need to add here to check if is keyword from above
            }
            else if ((/[0-9]/).test(chars[i])) {//numbers
                let s: string = chars[i];
                i++;
                while ((/[0-9]/).test(chars[i])) {
                    s = s + chars[i];
                    i++;
                }
                i--;
                tokens.push(s);
            }
            else if (chars[i] === '\n') {//newlines
                tokens.push(chars[i]);
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
        return {tokens, lineCount};
    }
}