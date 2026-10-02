import { SystemCNodeData } from "../SystemC/SystemCNode";
import { HierarchyNode } from "./HierarchyNode";
import { HierarchyTree } from "./HierarchyTree";

export class HierarchyForest {
    public trees: HierarchyTree[] = [];

    private readonly treeGap = 40;

    constructor(nodes: SystemCNodeData[]) {
        this.build(nodes);
    }

    public sortTreesBySize(): void {
        this.trees.sort((left, right) => right.countNodes() - left.countNodes());
    }

    public layout(): void {
        this.sortTreesBySize();

        let left = 0;
        for (const tree of this.trees) {
            const width = tree.layout(left);
            left += width + this.treeGap;
        }
    }

    private build(nodes: SystemCNodeData[]): void {
        const hierarchyNodes = new Map<string, HierarchyNode>();

        for (const node of nodes) {
            hierarchyNodes.set(node.id, new HierarchyNode(node));
        }

        for (const node of nodes) {
            const hierarchyNode = hierarchyNodes.get(node.id);
            if (hierarchyNode === undefined) {
                throw new Error("Unable to create hierarchy node for " + node.id);
            }

            if (node.parentId === null) {
                this.trees.push(new HierarchyTree(hierarchyNode));
                continue;
            }

            const parent = hierarchyNodes.get(node.parentId);
            if (parent === undefined) {
                throw new Error("Missing hierarchy parent " + node.parentId);
            }

            parent.addChild(hierarchyNode);
        }
    }
}
