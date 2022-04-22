import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { ClassType } from '../../../ClassDataStruct/ClassType';

suite('ClassType Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Test setParentType', () => {
        const c1 : ClassType = new ClassType();
        const c2 : ClassType = new ClassType();
        c1.name = "c1";

        c2.name = "c2";
        
        c1.setParentType(c2);

        assert.strictEqual(c1.parentType, c2);
	});
});
