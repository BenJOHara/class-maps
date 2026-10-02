import { SystemCEdge, SystemCEdgeType } from "./SystemCEdge";
import { SystemCGraph } from "./SystemCGraph";
import { SystemCNodeData } from "./SystemCNode";

type JsonObject = { [key: string]: unknown };

export class SystemCJsonLoader {
    public static parse(text: string): SystemCGraph {
        let value: unknown;

        try {
            value = JSON.parse(text);
        } catch (error) {
            throw new Error("SystemC map is not valid JSON: " + SystemCJsonLoader.errorMessage(error));
        }

        if (!SystemCJsonLoader.isObject(value)) {
            throw new Error("SystemC map root must be an object");
        }

        const nodesValue = value.nodes;
        const edgesValue = value.edges;

        if (!Array.isArray(nodesValue)) {
            throw new Error("SystemC map must contain a nodes array");
        }

        const nodes = nodesValue.map((nodeValue, index) => SystemCJsonLoader.parseNode(nodeValue, index));
        const nodeIds = new Set<string>();

        for (const node of nodes) {
            if (nodeIds.has(node.id)) {
                throw new Error("Duplicate SystemC node id: " + node.id);
            }
            nodeIds.add(node.id);
        }

        for (const node of nodes) {
            if (node.parentId !== null && !nodeIds.has(node.parentId)) {
                throw new Error("Node " + node.id + " references missing parent " + node.parentId);
            }
        }

        SystemCJsonLoader.validateNoCycles(nodes);

        let edges: SystemCEdge[] = [];
        if (edgesValue !== undefined) {
            if (!Array.isArray(edgesValue)) {
                throw new Error("SystemC map edges must be an array");
            }
            edges = edgesValue.map((edgeValue, index) =>
                SystemCJsonLoader.parseEdge(edgeValue, index, nodeIds));
        }

        return { nodes, edges };
    }

    private static parseNode(value: unknown, index: number): SystemCNodeData {
        if (!SystemCJsonLoader.isObject(value)) {
            throw new Error("Node " + index + " must be an object");
        }

        const id = SystemCJsonLoader.requiredString(value, "id", "Node " + index);
        const name = SystemCJsonLoader.requiredString(value, "name", "Node " + index);
        const kind = SystemCJsonLoader.requiredString(value, "kind", "Node " + index);

        const parentValue = value.parentId;
        let parentId: string | null = null;

        if (parentValue !== undefined && parentValue !== null) {
            if (typeof parentValue !== "string" || parentValue.length === 0) {
                throw new Error("Node " + id + " parentId must be a non-empty string or null");
            }
            parentId = parentValue;
        }

        return new SystemCNodeData(id, name, kind, parentId);
    }

    private static parseEdge(value: unknown, index: number, nodeIds: Set<string>): SystemCEdge {
        if (!SystemCJsonLoader.isObject(value)) {
            throw new Error("Edge " + index + " must be an object");
        }

        const sourceId = SystemCJsonLoader.requiredString(value, "sourceId", "Edge " + index);
        const targetId = SystemCJsonLoader.requiredString(value, "targetId", "Edge " + index);
        const typeValue = SystemCJsonLoader.requiredString(value, "type", "Edge " + index);

        if (!nodeIds.has(sourceId) || !nodeIds.has(targetId)) {
            throw new Error("Edge " + index + " references an unknown node");
        }

        if (typeValue !== "hierarchy" && typeValue !== "binding") {
            throw new Error("Edge " + index + " has unsupported type " + typeValue);
        }

        const edge: SystemCEdge = {
            sourceId,
            targetId,
            type: typeValue as SystemCEdgeType
        };

        if (typeof value.sourcePort === "string") {
            edge.sourcePort = value.sourcePort;
        }

        if (typeof value.targetPort === "string") {
            edge.targetPort = value.targetPort;
        }

        return edge;
    }

    private static validateNoCycles(nodes: SystemCNodeData[]): void {
        const byId = new Map<string, SystemCNodeData>();
        for (const node of nodes) {
            byId.set(node.id, node);
        }

        for (const node of nodes) {
            const visited = new Set<string>();
            let current: SystemCNodeData | undefined = node;

            while (current !== undefined && current.parentId !== null) {
                if (visited.has(current.id)) {
                    throw new Error("Hierarchy cycle detected at node " + current.id);
                }

                visited.add(current.id);
                current = byId.get(current.parentId);
            }
        }
    }

    private static requiredString(value: JsonObject, key: string, prefix: string): string {
        const field = value[key];
        if (typeof field !== "string" || field.length === 0) {
            throw new Error(prefix + " must contain non-empty string field " + key);
        }
        return field;
    }

    private static isObject(value: unknown): value is JsonObject {
        return typeof value === "object" && value !== null && !Array.isArray(value);
    }

    private static errorMessage(error: unknown): string {
        return error instanceof Error ? error.message : String(error);
    }
}
