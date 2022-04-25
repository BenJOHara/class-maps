import { ClassTree } from "./ClassTree";
import { ClassType } from "./ClassType";


export class ClassForest{
    trees : ClassTree [] = [];

    constructor(classes :ClassType[])
    {
        this.createForest(classes);
    }

    //adds tree to the array of trees
    public addTree(c : ClassType)
    {
        this.trees.push(new ClassTree(c));
    }

    //creates the forest
    //goes through array of classes
    //if there is no parent then add this class to the tree and remove it from the keys array
    //then ones all parents are created go though and initialize all parents // might be able to add this to the original loop
    private createForest(classes : ClassType [])
    {
        const keys : number [] = [...classes.keys()];
        for (let i = 0; i < classes.length; i++)
        {
            if (classes[i].parent === '' && keys.indexOf(i) !== -1)//if no parent then the root of a tree
            {
                this.addTree(classes[i]);
                keys.splice(keys.indexOf(i), 1);//remove parent from classes array
            }
            //else if ()//need to work out if external class
        }

        for (let i = 0; i < this.trees.length; i++)
        {
            this.trees[i].createTree(classes, keys);
            this.trees[i].setParentTypes(this.trees[i].root);
        }
    }


    

    //moves all root nodes with children to the front of the trees array
    public sortIfChildren()
    {
        const sortedTrees : ClassTree[] = [];
        for (let i = 0; i < this.trees.length; i++)
        {
            if (this.trees[i].root.children.length > 0)
            {
                sortedTrees.unshift(this.trees[i]);
            }
            else 
            {
                sortedTrees.push (this.trees[i]);
            }
        }
        this.trees = sortedTrees;
    }

    //Tells the tree the top right corner that it can be in
    public setCoords()
    {
        //first tree start at 0, dont care about y not that is for the tree
        const buffer : number = 5;

        for (let i = 0; i < this.trees.length; i++)
        {
            const tree = this.trees[i];
            if (i !== 0)
            {
                //prev tress x + the other half of its hiddenwidth to find where it ends at its widest point + buffer
                tree.setCoords(this.trees[i - 1].root.c.x + this.trees[i - 1].root.c.hiddenWidth * 0.5 + buffer);
            }
            else {
                //first tree so starts at 0
                tree.setCoords(0);
            }
        }
    }


    public sortTreesByTotalChildren()
    {
        this.trees =  this.sortClassesArray(this.trees);
    }

    //sorts an array of classes by the compareClasses function
	private sortClassesArray(trees : ClassTree[]): ClassTree[] {
		const a1: ClassTree[] = [];
		const a2: ClassTree[] = [];

		if (trees.length === 1) {
			return trees;
		}
		else if (trees.length === 0) {
			return [];
		}
		else {
			const pivot = trees[0];
			for (let i = 1; i < trees.length; i++) {
				if (this.compareClasses(pivot, trees[i]))//true if pivot smaller
				{
					a1.push(trees[i]);
				}
				else {
					a2.push(trees[i]);
				}
			}
			return this.sortClassesArray(a1).concat(trees[0]).concat(this.sortClassesArray(a2));
		}

	}

    //true if b has more lines then a
	//else false
	private compareClasses(a: ClassTree, b: ClassTree) {
		if (a.countNodesInTree() < b.countNodesInTree()) {
			return true;
		}
		else {
			return false;
		}
	}

}