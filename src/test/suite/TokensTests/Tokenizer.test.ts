import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { Tokenizer } from '../../../TokensFiles/Tokenizer';
import { Tokens } from '../../../TokensFiles/Tokens';
//import * as myExtension from '../../extension';


suite('Tokenizer Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    

    test('Test isEscaped', async () => {
        const uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.java');
        const files: vscode.TextDocument[] = [];
        for (const uri of uris) {
            const file = await vscode.workspace.openTextDocument(uri);
            files.push(file);
        }
        const t: Tokenizer = new Tokenizer(files);
        const test1: string = "\\\\";//false 
        const test2: string = "\\";//true
        const test3: string = "\\\\\\";//true
        // @ts-ignore
        assert.strictEqual(t.isEscaped(test1), false);
        // @ts-ignore
        assert.strictEqual(t.isEscaped(test2), true);
        // @ts-ignore
        assert.strictEqual(t.isEscaped(test3), true);
        // @ts-ignore
        assert.strictEqual(t.isEscaped(test3 + test1 + test2), false);
    });

    test('Test for things found', async () => {
        const uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.java');

        const files: vscode.TextDocument[] = [];
        for (const uri of uris) {
            const file = await vscode.workspace.openTextDocument(uri);
            files.push(file);
        }
        const t: Tokenizer = new Tokenizer(files);
        // @ts-ignore
        const done = t.tokenize(" Office Shop Bike Vehicle Building ");
        const token = new Tokens(done.tokens, done.lineCount, done.tokenProper);
        // @ts-ignore
        t.tokens.push(token);

        const tokensThatShouldExist: string[] = ["Office", "Shop", "Bike", "Vehicle", "Building"];
        const flagArray: boolean[] = [false, false, false, false, false];
        const tokensThatShouldNotExist: string[] = ["0ffice", "Sh0p", "Bik3", "V3hicl3", "Bu1ld1ng"];

        tokensThatShouldNotExist.forEach(token => {
            const tokens: Tokens[] = t.getTokens();
            tokens.forEach(file => {
                assert.strictEqual(file.t.indexOf(token), -1);
            });
        });

        tokensThatShouldExist.forEach(token => {
            const tokens: Tokens[] = t.getTokens();
            tokens.forEach(file => {
                if (file.t.indexOf(token) !== -1) {
                    flagArray[tokensThatShouldExist.indexOf(token)] = true;
                }
            });
        });

        flagArray.forEach(flag => {
            assert.strictEqual(flag, true);
        });
    });

});
