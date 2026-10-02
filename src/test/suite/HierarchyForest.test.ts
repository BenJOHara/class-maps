import * as assert from "assert";
import { HierarchyForest } from "../../Hierarchy/HierarchyForest";
import { SystemCNodeData } from "../../SystemC/SystemCNode";

suite("HierarchyForest Test Suite", () => {
    test("keeps repeated local names distinct by hierarchical id", () => {
        const nodes = [
            new SystemCNodeData("top", "top", "sc_module", null),
            new SystemCNodeData("top.left", "left", "sc_module", "top"),
            new SystemCNodeData("top.right", "right", "sc_module", "top"),
            new SystemCNodeData("top.left.worker", "worker", "sc_module", "top.left"),
            new SystemCNodeData("top.right.worker", "worker", "sc_module", "top.right")
        ];

        const forest = new HierarchyForest(nodes);
        forest.layout();

        assert.strictEqual(forest.trees.length, 1);

        const leftWorker = nodes.find(node => node.id === "top.left.worker");
        const rightWorker = nodes.find(node => node.id === "top.right.worker");

        assert.ok(leftWorker !== undefined);
        assert.ok(rightWorker !== undefined);
        assert.notStrictEqual(leftWorker.x, rightWorker.x);
    });

    test("lays separate trees out without overlap", () => {
        const left = new SystemCNodeData("left", "left", "sc_module", null);
        const right = new SystemCNodeData("right", "right", "sc_module", null);

        const forest = new HierarchyForest([left, right]);
        forest.layout();

        const leftEnd = left.x + left.width;
        const rightEnd = right.x + right.width;

        assert.ok(leftEnd <= right.x || rightEnd <= left.x);
        assert.ok(Number.isFinite(left.x));
        assert.ok(Number.isFinite(right.x));
    });
});
