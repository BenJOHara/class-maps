# Plan: Convert Class Maps to SystemC Hierarchy Visualisation

## 1. Objective

Convert the existing `class-maps` VS Code extension from a Java class-inheritance visualiser into a SystemC model visualiser.

The initial version will visualise the **elaborated SystemC module hierarchy**. Rather than attempting to parse C++/SystemC source code, the extension will consume hierarchy information exported from a running SystemC model.

The longer-term architecture should also support SystemC port, channel and binding relationships without requiring another major redesign.

---

## 2. Current architecture

The existing project follows this pipeline:

```text
Java source files
    ↓
Tokenizer
    ↓
Parser
    ↓
ClassType[]
    ↓
ClassForest
    ↓
ClassTree
    ↓
ClassNode
    ↓
Layout calculation
    ↓
JSON
    ↓
VS Code webview
    ↓
SVG hierarchy
```

The reusable parts are primarily:

- VS Code extension integration
- webview infrastructure
- tree/forest representation
- coordinate calculation
- SVG rendering
- user interaction and navigation infrastructure

The Java-specific parser and tokenizer should be removed.

---

## 3. Target architecture

The new pipeline will be:

```text
SystemC executable
    ↓
SystemC elaboration
    ↓
Hierarchy exporter
    ↓
systemc-map.json
    ↓
VS Code extension
    ↓
SystemC graph model
    ↓
Hierarchy layout
    ↓
SVG webview
```

The key architectural principle is:

> SystemC itself should provide the elaborated hierarchy.

The VS Code extension should not attempt to reconstruct runtime SystemC hierarchy by statically parsing C++.

---

## 4. SystemC hierarchy exporter

Add a small C++ component capable of inspecting the SystemC object hierarchy after elaboration.

The exporter should use SystemC APIs such as:

```cpp
sc_core::sc_get_top_level_objects()
```

and:

```cpp
sc_core::sc_object::get_child_objects()
```

to recursively discover instantiated objects.

A basic traversal would conceptually be:

```cpp
void visit_object(const sc_core::sc_object* object)
{
    for (const sc_core::sc_object* child : object->get_child_objects()) {
        visit_object(child);
    }
}
```

The exporter should produce structured JSON rather than text.

---

## 5. JSON interchange format

Define a stable format between the SystemC runtime and the VS Code extension.

Initial format:

```json
{
    "nodes": [
        {
            "id": "top",
            "name": "top",
            "kind": "sc_module",
            "parentId": null
        },
        {
            "id": "top.module_a",
            "name": "module_a",
            "kind": "sc_module",
            "parentId": "top"
        },
        {
            "id": "top.module_a.submodule_0",
            "name": "submodule_0",
            "kind": "sc_module",
            "parentId": "top.module_a"
        }
    ],
    "edges": []
}
```

The **full SystemC hierarchical name** should be used as the node ID.

This avoids ambiguity when multiple objects have the same local name:

```text
top.module_a.worker_0
top.module_b.worker_0
```

The local object name alone must not be treated as globally unique.

---

## 6. General graph data model

Replace the Java-specific `ClassType` model with a generic SystemC representation.

Suggested model:

```ts
interface SystemCNode {
    id: string;
    name: string;
    kind: string;
    parentId?: string;

    x: number;
    y: number;

    width: number;
    height: number;
    hiddenWidth: number;
}

interface SystemCEdge {
    sourceId: string;
    targetId: string;

    type: "hierarchy" | "binding";

    sourcePort?: string;
    targetPort?: string;
}

interface SystemCGraph {
    nodes: SystemCNode[];
    edges: SystemCEdge[];
}
```

Although the initial implementation only needs hierarchy relationships, defining explicit edges now prevents the representation from becoming tied permanently to trees.

---

## 7. Refactor the existing data structures

The existing hierarchy code can largely be retained but should be renamed and generalised.

Current:

```text
ClassType
ClassNode
ClassTree
ClassForest
```

Target:

```text
SystemCNodeData
HierarchyNode
HierarchyTree
HierarchyForest
```

Alternatively, the structures can use more generic graph-oriented names if future non-SystemC reuse is desirable.

The hierarchy layer should match objects using:

```text
node.id
node.parentId
```

rather than:

```text
class.name
class.parent
```

This is necessary because SystemC object names are only unique within their parent.

---

## 8. Remove the Java parsing layer

The following existing components should no longer be part of the main execution path:

```text
src/Parser.ts

src/TokensFiles/
    Token.ts
    Tokens.ts
    Tokenizer.ts
```

The VS Code extension should no longer search for:

```ts
vscode.workspace.findFiles("**/*.java")
```

or parse source files to discover the model.

Instead it should load the generated SystemC JSON.

---

## 9. Extension workflow

The extension should provide a command such as:

```text
SystemC Map: Refresh Hierarchy
```

The initial workflow can be:

```text
User runs SystemC executable
        ↓
systemc-map.json generated
        ↓
User opens/refreshes SystemC Map
        ↓
extension reads JSON
        ↓
hierarchy constructed
        ↓
coordinates calculated
        ↓
webview refreshed
```

Later versions can automate locating or generating the hierarchy file.

---

## 10. Hierarchy construction

For each node:

```text
parentId == null
```

means it is a root object.

All root objects form the hierarchy forest.

For every other object:

```text
node.parentId
```

identifies its parent.

For example:

```text
top
├── module_a
│   ├── submodule_0
│   └── submodule_1
└── module_b
```

would become one hierarchy tree.

Multiple SystemC top-level objects naturally become multiple trees in the forest.

---

## 11. Retain and adapt the existing layout algorithm

The existing recursive layout logic is reusable.

The current algorithm approximately:

1. Finds leaf nodes.
2. Calculates the width required by each subtree.
3. Places parents relative to their descendants.
4. Assigns vertical positions based on hierarchy depth.
5. Places separate trees next to each other.

This can remain the first SystemC layout algorithm.

However, node dimensions should no longer be based on Java line count.

Initially use consistent node sizes:

```text
fixed width
fixed height
```

This makes the hierarchy easier to interpret.

Later, dimensions could encode meaningful information such as:

- number of children
- number of ports
- number of processes
- selected runtime statistics

but this should not be part of the first implementation.

---

## 12. Webview changes

The existing SVG renderer can remain with modifications.

Each node should initially display:

```text
┌────────────────────┐
│ module_name        │
│ sc_module          │
└────────────────────┘
```

Hierarchy edges should connect parent and child objects.

The webview should continue to support:

- hover information
- node highlighting
- refresh
- scrolling/panning

The existing Java-specific terminology should be removed from UI text.

For example:

```text
Show classes and their sizes
```

should become something such as:

```text
Refresh SystemC hierarchy
```

---

## 13. Object kinds

The exporter should preserve `sc_object::kind()`.

Initially the visualisation can filter to:

```text
sc_module
```

but the data format should preserve other object types so they can be exposed later.

Potential object types include:

```text
sc_module
sc_in
sc_out
sc_inout
sc_port
sc_export
sc_signal
sc_fifo
other sc_object-derived objects
```

Do not overload the initial view with all of them.

The first milestone should remain a clean module hierarchy.

---

## 14. Source navigation

The old Java visualiser knows the originating file because classes are discovered directly from files.

Runtime SystemC objects do not inherently provide a source URI.

Therefore source navigation should be treated as a separate feature.

Possible first implementation:

1. Record the C++ type if available.
2. Search the workspace for definitions matching forms such as:

```cpp
class ExampleModule : public sc_core::sc_module
```

or:

```cpp
SC_MODULE(ExampleModule)
```

3. Open the likely source location.

Exact source metadata can be added later if the SystemC integration provides a reliable mechanism.

Source navigation should not block the initial hierarchy implementation.

---

## 15. Future connectivity graph

SystemC contains relationships beyond containment.

The long-term graph should be able to represent:

```text
Module A ──port/channel binding──► Module B
```

These relationships are not necessarily trees.

Therefore:

```ts
SystemCEdge
```

should exist from the beginning even if version one only generates hierarchy edges.

Later the exporter may capture:

- port bindings
- exports
- channels
- signals
- FIFOs
- socket-style connections where discoverable

At that stage the visualisation can provide separate modes:

```text
Hierarchy view
Connectivity view
Combined view
```

The connectivity view will likely require a different graph-layout algorithm from the hierarchy view.

---

## 16. Future runtime overlays

Once hierarchy identification is stable, arbitrary metadata could be associated with each node.

For example:

```json
{
    "id": "top.module_a",
    "metadata": {
        "metric_a": 1203,
        "metric_b": 84,
        "metric_c": 0.72
    }
}
```

The renderer could then support:

- node colouring
- node size
- labels
- tooltips
- filtering

based on runtime or simulation statistics.

This should be treated as a later layer built on top of the hierarchy visualiser rather than part of the initial conversion.

---

## 17. Testing

The existing test suite should be substantially strengthened during the conversion.

### JSON loader tests

Test:

- valid hierarchy files
- malformed JSON
- missing IDs
- duplicate IDs
- missing parent IDs
- multiple roots
- empty hierarchy

### Hierarchy tests

Test:

```text
single node
single chain
multiple children
deep hierarchy
multiple independent roots
duplicate local names
```

For example:

```text
root
├── child_0
│   └── worker
└── child_1
    └── worker
```

must correctly distinguish the two `worker` nodes using full IDs.

### Layout tests

Verify invariants such as:

```text
children are below parents
siblings do not overlap
separate trees do not overlap
all coordinates are finite
all node dimensions are positive
```

### Exporter tests

Create small SystemC models with known elaborated hierarchies and compare the exported JSON against expected structures.

---

## 18. Proposed repository structure

Target structure:

```text
class-maps/
├── media/
│   ├── main.js
│   ├── main.css
│   ├── reset.css
│   └── vscode.css
│
├── src/
│   ├── extension.ts
│   │
│   ├── SystemC/
│   │   ├── SystemCGraph.ts
│   │   ├── SystemCNode.ts
│   │   ├── SystemCEdge.ts
│   │   └── SystemCJsonLoader.ts
│   │
│   ├── Hierarchy/
│   │   ├── HierarchyNode.ts
│   │   ├── HierarchyTree.ts
│   │   └── HierarchyForest.ts
│   │
│   └── test/
│
├── exporter/
│   ├── SystemCMapExporter.hpp
│   └── SystemCMapExporter.cpp
│
├── package.json
├── tsconfig.json
└── webpack.config.js
```

The exact naming can be adjusted during implementation.

---

## 19. Implementation stages

### Stage 1 — Generalise the current model

Refactor:

```text
ClassType
ClassNode
ClassTree
ClassForest
```

into SystemC/generic equivalents.

Keep the existing layout behaviour working.

### Stage 2 — Replace Java ingestion

Remove the tokenizer/parser execution path.

Implement:

```text
SystemCJsonLoader
```

and construct the hierarchy from a test JSON file.

At this point the extension should display a static SystemC hierarchy.

### Stage 3 — Add the SystemC exporter

Implement the C++ hierarchy walker.

Export:

```text
id
name
kind
parentId
```

for each relevant object.

### Stage 4 — Connect exporter and extension

Load real hierarchy output and display it in VS Code.

Validate:

- multiple top-level objects
- repeated local names
- deep hierarchies
- large models

### Stage 5 — Improve UX

Add:

- refresh
- search
- collapse/expand
- fit-to-view
- selected-node information
- configurable object-kind filtering

### Stage 6 — Source navigation

Add best-effort mapping from SystemC node/type to source code.

### Stage 7 — Connectivity

Extend the exporter and renderer with ports, channels and binding edges.

### Stage 8 — Runtime/statistics overlays

Allow metadata to be attached to hierarchy objects and visualised interactively.

---

## 20. Initial completion criteria

Version 1 should be considered complete when:

1. A SystemC program can export its elaborated module hierarchy to JSON.
2. The VS Code extension can load that JSON.
3. Full hierarchical names uniquely identify objects.
4. Multiple top-level modules are supported.
5. Parent/child relationships are correctly reconstructed.
6. The hierarchy is automatically laid out without overlapping nodes.
7. The result is rendered interactively in the VS Code webview.
8. The Java tokenizer/parser is no longer required.
9. Core hierarchy and layout behaviour has meaningful automated tests.

The first version should focus specifically on producing a reliable **SystemC hierarchy explorer**. Ports, bindings, source navigation and runtime metrics should be layered onto that stable foundation afterwards.
