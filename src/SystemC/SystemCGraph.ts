import { SystemCEdge } from "./SystemCEdge";
import { SystemCNodeData } from "./SystemCNode";

export interface SystemCGraph {
    nodes: SystemCNodeData[];
    edges: SystemCEdge[];
}
