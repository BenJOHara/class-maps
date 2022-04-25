import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { ClassForest } from '../../../ClassDataStruct/ClassForest';
import { ClassType } from '../../../ClassDataStruct/ClassType';
//import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});


	test('Create Forest test', () => {
		const c1 : ClassType = new ClassType();
		const c2 : ClassType = new ClassType();
		const c3 : ClassType = new ClassType();

		c1.name = "class1";
		c2.name = "class2";
		c3.name = "class3";

		c1.nLines = 30;
		c2.nLines = 50;
		c3.nLines = 100;

		c1.parent = "";
		c2.parent = "class1";
		c3.parent = "class4";

		const classes : ClassType [] = [];
		classes.push(c1);
		classes.push(c2);
		classes.push(c3);		

		const forest : ClassForest = new ClassForest(classes);


	});
});
