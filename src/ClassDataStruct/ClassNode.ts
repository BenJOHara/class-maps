import { ClassType } from "./ClassType";

export class ClassNode{
    parent:ClassNode[] = [];//if length = 0 then no parents if = 1 then parent
    children:ClassNode[] = [];

    level:number;

    c : ClassType;

    hiddenWidth : number = 0; // this is the sum of the hiddenwidth of the nodes children

    constructor(_c: ClassType, _level:number , parent? : ClassNode)
    {
        this.c = _c;
        this.level = _level;
        if (parent !== undefined)
        {
            this.parent.push(parent);//if parent add
        }
    }

    //returns the node of the child
    public addChild(c : ClassType, level:number)
    {
        this.children.push(new ClassNode(c, level, this));
        //console.log("added child", c.name, this.c.name);
        return this.children[this.children.length - 1];
    }

    public calcTallestChild()
    {
        let tallest = this.children[0].c.height;
        for (let i = 1; i < this.children.length; i++)
        {
            if (tallest < this.children[i].c.height)
            {
                tallest = this.children[i].c.height;
            }
        }
        return tallest;
    }

    public setCoords(x:number, y:number)
    {
        this.c.x = x;
        this.c.y = y;
    }
}