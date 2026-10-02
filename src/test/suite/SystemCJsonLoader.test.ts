import * as assert from "assert";
import { SystemCJsonLoader } from "../../SystemC/SystemCJsonLoader";

suite("SystemCJsonLoader Test Suite", () => {
    test("loads a valid hierarchy", () => {
        const graph = SystemCJsonLoader.parse(JSON.stringify({
            nodes: [
                { id: "top", name: "top", kind: "sc_module", parentId: null },
                { id: "top.child", name: "child", kind: "sc_module", parentId: "top" }
            ],
            edges: []
        }));

        assert.strictEqual(graph.nodes.length, 2);
        assert.strictEqual(graph.nodes[1].parentId, "top");
    });

    test("rejects duplicate ids", () => {
        const input = JSON.stringify({
            nodes: [
                { id: "top", name: "top", kind: "sc_module", parentId: null },
                { id: "top", name: "other", kind: "sc_module", parentId: null }
            ]
        });

        assert.throws(() => SystemCJsonLoader.parse(input), /Duplicate SystemC node id/);
    });

    test("rejects missing parents", () => {
        const input = JSON.stringify({
            nodes: [
                { id: "top.child", name: "child", kind: "sc_module", parentId: "top" }
            ]
        });

        assert.throws(() => SystemCJsonLoader.parse(input), /references missing parent/);
    });

    test("rejects hierarchy cycles", () => {
        const input = JSON.stringify({
            nodes: [
                { id: "a", name: "a", kind: "sc_module", parentId: "b" },
                { id: "b", name: "b", kind: "sc_module", parentId: "a" }
            ]
        });

        assert.throws(() => SystemCJsonLoader.parse(input), /Hierarchy cycle detected/);
    });
});
