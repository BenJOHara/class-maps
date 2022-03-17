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
    //keep going down first child list
    //count depth = height of tallest sibling at level + depth
    //when no children this node will be at the far left of the graph/map
    //go back up 
    public setCoords(limX:number)
    {
        const buffer = 10;
        let parent = this.root;
        parent.c.y = 0;//root is at the top
        let depth = parent.c.height;/// THIS DOESNT WORK CUS HEIGHT = 0
        while (parent.children.length !== 0)//while children exist
        {
            console.log(depth, "hello");
            parent.c.y = depth + buffer;
            depth = depth + parent.calcTallestChild();
            parent = parent.children[0];
        }
    }
}