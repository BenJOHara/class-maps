import { ClassTree } from "./ClassTree";
import { ClassType } from "./ClassType";

export class ClassForest{
    trees : ClassTree [] = [];

    constructor()
    {

    }
    public addTree(c : ClassType)
    {
        this.trees.push(new ClassTree(c));
    }

    public createForest(classes : ClassType [])
    {
        const keys : number [] = [...classes.keys()];
        for (let i = 0; i < classes.length; i++)
        {
            if (classes[i].parent === '' && keys.indexOf(i) !== -1)//if no parent then the root of a tree
            {
                this.addTree(classes[i]);
                keys.splice(keys.indexOf(i), 1);//remove parent from classes array
            }
        }
        //now go per parent recursivly
        for (let i = 0; i < this.trees.length; i++)
        {
            this.trees[i].createTree(classes, keys);
        }
    }


    //Tells the tree the top right corner that it can be in
    public setCoords()
    {
        //first tree start at 0, dont care about y not that is for the tree
        let x = 0;
        for (let i = 0; i < this.trees.length; i++)
        {
            const tree = this.trees[i];
            tree.setCoords();
            //need to find the width

        }
    }
}