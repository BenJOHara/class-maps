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

    private populate(classes: ClassType[], topNode: ClassNode, keys: number[], level: number) {
        const addedClasses: ClassNode[] = [];
        for (let i = 0; i < classes.length; i++) {
            if (classes[i].parent === topNode.c.name && keys.indexOf(i) !== -1) {
                console.log("adding " + classes[i].name + " as child of " + topNode.c.name);
                addedClasses.push(topNode.addChild(classes[i], level));
                keys.splice(keys.indexOf(i), 1);
            }
        }
        for (let i = 0; i < addedClasses.length; i++) {
            this.populate(classes, addedClasses[i], keys, level + 1);
        }
    }

    //can be done normally but at the end all x and ys must be appended with limX and limY
    //return the limit
    //keep going down first child list
    //count depth = height of tallest sibling at level + depth
    //when no children this node will be at the far left of the graph/map
    //go back up 
    public setCoords() {
        console.log("set Coords");
        this.setY(this.root, 0);//start at y = 0
        this.setHiddenWidth(this.root, []);
        if (this.root.parent.length === 0){
            this.root.c.x = this.root.hiddenWidth / 2;
        }
        return this.setX(this.root);
    }


    //depth first traversal
    private setY(root: ClassNode, depth: number) {
        let p = root;
        p.c.y = depth;
        depth += p.c.height;
        for (let i = 0; i < p.children.length; i++) {
            this.setY(p.children[i], depth);
        }
    }


    private findZero(root : ClassNode)
    {
        let p : ClassNode = root;
        while (p.children.length !== 0)
        {
            p = p.children[0];
        }
        p.c.x = 0;//
        return p;
    }


    //node : node that we are calc x for
    //lastX the relative x that the last childnode of the parent had
    //pX: the x of the parent.
    // pX - 1/2 parent.hiddenwidth + lastX will = the x of the prev child
    

    private setHiddenWidth (root: ClassNode, levelSum: number[])
    {
        let p : ClassNode = root;
        if (p.children.length === 0)//no children
        {
            p.hiddenWidth = p.c.width;
        }
        else 
        {
            for (let i = 0; i < p.children.length; i++) 
            {
                this.setHiddenWidth(p.children[i], levelSum);
            }
            for (let i = 0; i < p.children.length; i++) 
            {
                p.hiddenWidth = p.hiddenWidth + p.children[i].hiddenWidth;
            }
        }
    }

    private findX(node : ClassNode, lastX : number)
    {
        node.c.x = lastX + node.hiddenWidth * 0.5;//set x as the middle of your hidden width
        return lastX + node.hiddenWidth; //return the edge of your hidden width for the next child
    }

    //need to start at the bottom and go up
    // x of parent = sum of x of children - 1/2 * dif between x of c0 and cn
    private setX(root: ClassNode) {
        let p = root;
        let x : number = p.c.x - p.hiddenWidth * 0.5;
        p = root;
        if (p.children.length !== 0)
        {
            for (let i = 0; i < p.children.length; i++) 
            {
                x = this.findX(p.children[i], x);
            }//
            for (let i = 0; i < p.children.length; i++) 
            {
                console.log(p.c.x - 0.5 * p.hiddenWidth);
                this.setX(p.children[i]);
            }
        }
    }
}