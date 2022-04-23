import { ClassNode } from "./ClassNode";
import { ClassType } from "./ClassType";

export class ClassTree {
    root: ClassNode;
    constructor(c: ClassType) {
        this.root = new ClassNode(c, 0);
    }

    public createTree(classes: ClassType[], keys: number[]) {
        let root = this.root;
        return this.populate(classes, root, keys, 1);
    }

    //populate the parent node
    //then go though all children and call populate on them
    //recursivly populating all child nodes from the root
    private populate(classes: ClassType[], topNode: ClassNode, keys: number[], level: number) {
        const addedClasses: ClassNode[] = [];
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].parent === topNode.c.name && keys.indexOf(i) !== -1) {
                //console.log("adding " + classes[i].name + " as child of " + topNode.c.name);
                addedClasses.push(topNode.addChild(classes[i], level));
                keys.splice(keys.indexOf(i), 1);
            }
        }
        for (let i = 0; i < addedClasses.length; i++) {
            this.populate(classes, addedClasses[i], keys, level + 1);
        }
    }

    //if children 
    public setParentTypes(p : ClassNode)
    {
        if (p.children.length === 0)
        {
            return;//no children else
        }
        for (let i = 0; i < p.children.length; i++)
        {
            const c : ClassNode = p.children[i];
            c.parent.push(p);//sets parent node
            c.c.parentType = p.c;//sets parent type in child type
            this.setParentTypes(p.children[i]);//does it recursivly
        }
    }


    //can be done normally but at the end all x and ys must be appended with limX and limY
    //return the limit
    //keep going down first child list
    //count depth = height of tallest sibling at level + depth
    //when no children this node will be at the far left of the graph/map
    //go back up 
    public setCoords(leftHW : number) {
        //console.log("set Coords");
        this.setY(this.root, 0);//start at y = 0
        this.setHiddenWidth(this.root);
        if (this.root.parent.length === 0){
            this.root.c.x = this.root.hiddenWidth / 2 + leftHW;
        }
        return this.setX(this.root, leftHW);
    }


    //depth first traversal
    private setY(root: ClassNode, depth: number) {
        const buffer : number = 10;
        let p = root;
        p.c.y = depth;
        depth += p.c.height + buffer;
        for (let i = 0; i < p.children.length; i++) {
            this.setY(p.children[i], depth);
        }
    }


    //node : node that we are calc x for
    //lastX the relative x that the last childnode of the parent had
    //pX: the x of the parent.
    // pX - 1/2 parent.hiddenwidth + lastX will = the x of the prev child

    //from root
    //if no children then the hiddenwidth will just be the width of the root
    //if there are children then we first must know all their hiddenwidths so calclute them by calling yourself
    //then for all children set hiddenwidth to the sum of their hiddenwidths
    private setHiddenWidth (root: ClassNode)
    {
        let p : ClassNode = root;
        if (p.children.length === 0)//no children
        {
            p.hiddenWidth = p.c.width;
            p.c.hiddenWidth = p.c.width;
        }
        else 
        {
            for (let i = 0; i < p.children.length; i++) 
            {
                this.setHiddenWidth(p.children[i]);
            }
            for (let i = 0; i < p.children.length; i++) 
            {
                p.hiddenWidth = p.hiddenWidth + p.children[i].hiddenWidth;
                p.c.hiddenWidth = p.hiddenWidth + p.children[i].hiddenWidth;
            }
        }
    }

    
    //sets the x of the node based of the last x
    //returns the next place where a node can start
    private findX(node : ClassNode, lastX : number)
    {
        node.c.x = lastX + node.hiddenWidth * 0.5;//set x as the middle of your hidden width
        return lastX + node.hiddenWidth; //return the edge of your hidden width for the next child
    }

    //need to start at the bottom and go up
    // x of parent = sum of x of children - 1/2 * dif between x of c0 and cn

    //The root node already knows its x
    //Find the left most part of that x ie root.x - root.hiddenwidth/2 
    //This is where the first child will start
    //For every child place them based off the previous child
    //For every child call setX to set their childrens x
    private setX(root: ClassNode, zerodX : number) {
        let p : ClassNode = root;
        let x : number = p.c.x - p.hiddenWidth * 0.5;

        if (p.children.length !== 0)
        {
            for (let i = 0; i < p.children.length; i++) 
            {
                x = this.findX(p.children[i], x);
            }
            for (let i = 0; i < p.children.length; i++) 
            {
                this.setX(p.children[i], zerodX);
            }
        }
    }
}