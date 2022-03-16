import { ClassNode } from "./ClassNode";
import { ClassType } from "./ClassType";

export class ClassTree{
    root : ClassNode;
    constructor(c:ClassType)
    {
        this.root = new ClassNode(c);
    }

    public createTree(classes : ClassType[])
    {
        let root = this.root;
        this.populate(classes, root);
    }

    private populate(classes: ClassType[], topNode : ClassNode)
    {
        const addedClasses : ClassNode[] = [];
        for (let i = 0; i < classes.length; i++)
        {
            if (classes[i].parent === topNode.c.name)
            {
                addedClasses.push(topNode.addChild(classes[i]));
                classes.splice(i, 1);
                i--;
            }
        }
        for (let i = 0; i < addedClasses.length; i++)
        {
            this.populate(classes, addedClasses[i]);
        }
    }

    //can be done normally but at the end all x and ys must be appended with limX and limY
    //return the limit
    public setCoords(limX:number)
    {
        
    }
}