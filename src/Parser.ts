import { ClassType } from "./ClassDataStruct/ClassType";
import { Tokens } from "./TokensFiles/Tokens";

export class Parser{

    private classes : ClassType[] = [];
    private tokensAll : Tokens[];
    constructor(tokens : Tokens[])
    {
        this.tokensAll = tokens;
        this.parse();
    }

    public getClasses()
    {
        return this.classes;
    }

    private parse ()
    {
        const basicType: string[] = ["boolean", "byte", "char", "double", "float", "int", "long", "short"];
        let numberOfClasses = 0;
		let classFound: boolean = false;
		let braceFound: boolean = false;
		let braceTally: number = 0;
		let lineCount: number = 0;
		let startOfClass: number = 0;

		this.tokensAll.forEach((tokens, i) => {
			const dependsOn: string[] = [];
			const classesUsed: string[] = [];
			const accourances: number[] = [];
			tokens.t.forEach((t, j) => {//iterate through all tokens in order
				if (t === 'class' && tokens.t[j - 1] !== '.' && !classFound) //this !classfound means i dont care about nested classes i could change this to make them a different colour but idk if i want to
				{
					startOfClass = j;
					numberOfClasses++;
					classFound = true;
					this.classes[numberOfClasses - 1] = new ClassType();
					this.classes[numberOfClasses - 1].uri = tokens.uri;
					this.classes[numberOfClasses - 1].name = tokens.t[j + 1];
					if (tokens.t[j + 1] === 'Point')
					{
						console.log();
					}
				}
				else if (t === 'import')//if this then all classes in this file depend on token.t[j + 1]
				{
					if (tokens.t[j + 1] === 'static') {
						//console.log(tokens.t[j + 2]);
						dependsOn.push(tokens.t[j + 2]);

					}
					else {
						//console.log(tokens.t[j + 1]);
						dependsOn.push(tokens.t[j + 1]);
					}
				}
				else if (t === 'new') {
					let index = classesUsed.indexOf(tokens.t[j + 1]);
					if (index !== -1) {
						accourances[index]++;
					}
					else {
						classesUsed.push(tokens.t[j + 1]);
						accourances.push(1);
					}
				}
				else if (t === 'extends') {
					//has parent
					if (this.classes[numberOfClasses - 1] === undefined) {
						console.log();
					}
					else {
						this.classes[numberOfClasses - 1].parent = tokens.t[j + 1];// -1 as zero index and j+ 1 cus class name is next token
						console.log(this.classes[numberOfClasses - 1].parent);
					}

				}
				else if (t === '{') {
					braceFound = true;
					braceTally++;
				}
				else if (t === '}') {
					braceTally = braceTally - 1;
				}
				else if (t === '\n') {
					lineCount++;
				}
				else {
					if (basicType.indexOf(t) === -1) {
						let index = classesUsed.indexOf(tokens.t[j + 1]);
						if (index !== -1) {
							accourances[index]++;
						}
						else {
							classesUsed.push(tokens.t[j + 1]);
							accourances.push(1);
						}
					}
				}
				if (braceTally === 0 && braceFound && classFound) {//
					this.classes[numberOfClasses - 1].nLines = lineCount;
					this.classes[numberOfClasses - 1].nTokens = j - startOfClass;
					this.classes[numberOfClasses - 1].dependsOn = dependsOn;
					//console.log(classes[numberOfClasses - 1].name, lineCount, j - startOfClass);
					//end of a class should have all info
					classFound = false;
					braceFound = false;
					lineCount = 0;
					if (this.classes[numberOfClasses - 1].name === 'Point')
					{
						console.log();
					}
				}
			});
		});
		//console.log(classes);

		for (let i = 0; i < this.classes.length; i++) {
			if (!this.doesParentExist(this.classes, this.classes[i].parent) && this.classes[i].parent !== "") {
				// we must create this parent 
				const c = new ClassType();
				c.name = this.classes[i].parent;
				c.nTokens = 50;
				c.nLines = 55;
				c.external = true;
				this.classes.push(c);
			}
        }
    }

    //checks if a name exists in an array of classtypes
    private doesParentExist(classes: ClassType[], parent: string) {
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].name === parent) {
                return true;
            }
        }
        return false;
    }

}