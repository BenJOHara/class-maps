import { HierarchyNode } from "./HierarchyNode";

export class HierarchyTree {
    public readonly root: HierarchyNode;

    private readonly siblingGap = 20;
    private readonly levelGap = 50;

    constructor(root: HierarchyNode) {
        this.root = root;
    }

    public countNodes(): number {
        return this.root.countNodes();
    }

    public layout(left: number): number {
        this.calculateHiddenWidth(this.root);
        this.layoutNode(this.root, left, 0);
        return this.root.data.hiddenWidth;
    }

    private calculateHiddenWidth(node: HierarchyNode): number {
        if (node.children.length === 0) {
            node.data.hiddenWidth = node.data.width;
            return node.data.hiddenWidth;
        }

        let childrenWidth = 0;

        for (let index = 0; index < node.children.length; index++) {
            childrenWidth += this.calculateHiddenWidth(node.children[index]);
            if (index + 1 < node.children.length) {
                childrenWidth += this.siblingGap;
            }
        }

        node.data.hiddenWidth = Math.max(node.data.width, childrenWidth);
        return node.data.hiddenWidth;
    }

    private layoutNode(node: HierarchyNode, left: number, depth: number): void {
        node.data.x = left + (node.data.hiddenWidth - node.data.width) / 2;
        node.data.y = depth * (node.data.height + this.levelGap);

        if (node.children.length === 0) {
            return;
        }

        const childrenWidth = node.children.reduce(
            (width, child) => width + child.data.hiddenWidth,
            0
        ) + this.siblingGap * (node.children.length - 1);

        let childLeft = left + (node.data.hiddenWidth - childrenWidth) / 2;

        for (const child of node.children) {
            this.layoutNode(child, childLeft, depth + 1);
            childLeft += child.data.hiddenWidth + this.siblingGap;
        }
    }
}
