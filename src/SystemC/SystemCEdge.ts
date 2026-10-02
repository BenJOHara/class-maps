export type SystemCEdgeType = "hierarchy" | "binding";

export interface SystemCEdge {
    sourceId: string;
    targetId: string;
    type: SystemCEdgeType;
    sourcePort?: string;
    targetPort?: string;
}
