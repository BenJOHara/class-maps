import { SystemCNodeData } from "../SystemC/SystemCNode";

export class HierarchyNode {
    public readonly data: SystemCNodeData;
    public parent?: HierarchyNode;
    public children: HierarchyNode[] = [];

    constructor(data: SystemCNodeData) {
        this.data = data;
    }

    public addChild(child: HierarchyNode): void {
        child.parent = this;
        this.children.push(child);
    }

    public countNodes(): number {
        let count = 1;
        for (const child of this.children) {
            count += child.countNodes();
        }
        return count;
    }
}
