import * as vscode from 'vscode';
import { Token } from './Token';
import { Tokens } from './Tokens';

//take all workspace files
//collate table of all file IDs
//collate array of all ClassTypes
//will give ClassTypes array to extension
export class Tokenizer {

    private tokens: Tokens[] = [];

    //takes array of files and iterates through them adding them all to an array of Tokens
    constructor(files : vscode.TextDocument []) 
    {
        for (let i = 0; i < files.length; i++)
        {
            const done = this.tokenize(files[i].getText());
            const token = new Tokens(done.tokens,  done.lineCount, done.tokenProper, files[i].uri,);
            this.tokens.push(token);
        }
    }

    public getTokens()
    {
        return this.tokens;
    }


    //checks if the char that would appear after the string is escaped
    // if text = '\' then true if text = '\\' false
    //recursive 
    //just realised like a month later that i probs just could have counted if it was even or not.
    private isEscaped(text:string) : boolean
    {
        if (text.length === 1)
        {
            if (text === '\\')
            {
                return true;
            }
            else{
                return false;
            }
        }
        else 
        {
            if (text.charAt(text.length - 1) !== '\\')
            {
                return false;
            }
            else 
            {
                return !this.isEscaped(text.substring(0, text.length - 1));
            }
        }
    }

    //from the text of a file, split into tokens, keep \n
    private tokenize(text:string) {
        
        let lineCount: number = 0;
        let tokens: string[] = [];
        let tokenProper : Token[] = [];
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
                    while (!(chars[i] === '*' && chars[i + 1] === '/')) {
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
                while (chars[i] !== '"' || (chars[i] === '"' && this.isEscaped(s))) {
                    s = s + chars[i];
                    i++;
                }
                s = s + chars[i];
                tokens.push(s);
                tokenProper.push(new Token(s, 0));
            }
            else if (chars[i] === '\'') {//strings
                let s: string = chars[i];
                i++;
                while (chars[i] !== '\'' || (chars[i] === '\'' && this.isEscaped(s))) {
                    s = s + chars[i];
                    i++;
                }
                s = s + chars[i];
                tokens.push(s);
                tokenProper.push(new Token(s, 0));
            }
            else if ((/[a-zA-Z_$]/).test(chars[i])) {//ids 
                let s: string = chars[i];
                i++;

                while ((/[a-zA-Z0-9_$.<>]/).test(chars[i])) {
                    s = s + chars[i];
                    i++;
                }
                i--;
                tokens.push(s);
                tokenProper.push(new Token(s, 1));//may need to add here to check if is keyword from above
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
                tokenProper.push(new Token(s, 2));
            }
            else if (chars[i] === '\n') {//newlines
                tokens.push(chars[i]);
                tokenProper.push(new Token(chars[i], 3));
                lineCount++;
            }
            /*else if (chars[i] === '<' && chars[i - 1] !== '=' && chars[i + 1] !== '=')//breaks cus maths
            {
                let s: string = chars[i];
                i++;
                while (chars[i] !== '>') {
                    s = s + chars[i];
                    i++;
                    if (i + 10 > text.length)
                    {
                        console.log("EEORR");
                    }
                }
                s = s + chars[i];
                tokens.push(s);
                tokenProper.push(new Token(s, -1));
            }*/
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
                    tokenProper.push(new Token(s, -1));
                }
            }
        }
        return {tokens, lineCount, tokenProper};
    }
}