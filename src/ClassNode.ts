import { ClassType } from "./ClassType";

export class ClassNode{
    parent:ClassNode[] = [];//if length = 0 then no parents if = 1 then parent
    children:ClassNode[] = [];

    c : ClassType;

    constructor(_c: ClassType, parent? : ClassNode)
    {
        this.c = _c;
        if (parent !== undefined)
        {
            this.parent.push(parent);//if parent add
        }
    }

    //returns the node of the child
    public addChild(c : ClassType)
    {
        this.children.push(new ClassNode(c));
        console.log("added child", c.name, this.c.name);
        return this.children[this.children.length - 1];
    }
}