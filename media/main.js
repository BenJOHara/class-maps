//@ts-check

(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    const refreshButton = document.querySelector(".refresh-hierarchy");
    const status = document.querySelector(".status");
    const svg = document.querySelector(".systemc-map");

    if (refreshButton !== null) {
        refreshButton.addEventListener("click", () => {
            setStatus("Loading...");
            vscode.postMessage({ type: "getSystemCInfo" });
        });
    }

    window.addEventListener("message", event => {
        const message = event.data;

        if (message.type === "showSystemCInfo") {
            renderGraph(message.content);
            return;
        }

        if (message.type === "showSystemCError") {
            clearSvg();
            setStatus(message.content);
        }
    });

    function renderGraph(graph) {
        if (svg === null) {
            return;
        }

        clearSvg();

        const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
        const nodeById = new Map();

        for (const node of nodes) {
            nodeById.set(node.id, node);
        }

        for (const node of nodes) {
            if (node.parentId === null || node.parentId === undefined) {
                continue;
            }

            const parent = nodeById.get(node.parentId);
            if (parent !== undefined) {
                svg.appendChild(createHierarchyLine(parent, node));
            }
        }

        let maxX = 0;
        let maxY = 0;

        for (const node of nodes) {
            svg.appendChild(createNode(node));
            maxX = Math.max(maxX, node.x + node.width);
            maxY = Math.max(maxY, node.y + node.height);
        }

        svg.setAttribute("width", Math.max(maxX + 20, 300).toString());
        svg.setAttribute("height", Math.max(maxY + 20, 200).toString());

        setStatus(nodes.length + (nodes.length === 1 ? " module" : " modules"));
        vscode.setState({ graph: graph });
    }

    function createHierarchyLine(parent, child) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

        line.setAttribute("x1", (parent.x + parent.width / 2).toString());
        line.setAttribute("y1", (parent.y + parent.height).toString());
        line.setAttribute("x2", (child.x + child.width / 2).toString());
        line.setAttribute("y2", child.y.toString());
        line.setAttribute("class", "hierarchy-edge");

        return line;
    }

    function createNode(node) {
        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "systemc-node");

        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("x", node.x.toString());
        rect.setAttribute("y", node.y.toString());
        rect.setAttribute("width", node.width.toString());
        rect.setAttribute("height", node.height.toString());
        rect.setAttribute("rx", "3");

        const title = document.createElementNS("http://www.w3.org/2000/svg", "title");
        title.textContent = node.id + " (" + node.kind + ")";
        rect.appendChild(title);

        const nameText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        nameText.setAttribute("x", (node.x + node.width / 2).toString());
        nameText.setAttribute("y", (node.y + 21).toString());
        nameText.setAttribute("text-anchor", "middle");
        nameText.setAttribute("class", "node-name");
        nameText.textContent = shorten(node.name, 20);

        const kindText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        kindText.setAttribute("x", (node.x + node.width / 2).toString());
        kindText.setAttribute("y", (node.y + 39).toString());
        kindText.setAttribute("text-anchor", "middle");
        kindText.setAttribute("class", "node-kind");
        kindText.textContent = shorten(node.kind, 22);

        group.appendChild(rect);
        group.appendChild(nameText);
        group.appendChild(kindText);

        return group;
    }

    function shorten(value, maxLength) {
        if (value.length <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength - 3) + "...";
    }

    function clearSvg() {
        if (svg !== null) {
            svg.textContent = "";
            svg.setAttribute("width", "0");
            svg.setAttribute("height", "0");
        }
    }

    function setStatus(text) {
        if (status !== null) {
            status.textContent = text;
        }
    }

    const oldState = vscode.getState();
    if (oldState !== undefined && oldState !== null && oldState.graph !== undefined) {
        renderGraph(oldState.graph);
    } else {
        setStatus("Loading...");
    }
}());
