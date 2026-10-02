# SystemC Map

A VS Code extension for visualising an elaborated SystemC module hierarchy.

The original project visualised Java class inheritance. The SystemC version now uses hierarchy data exported from the running SystemC model instead of attempting to parse C++ source.

## Current workflow

1. Construct the SystemC model.
2. Export the elaborated module hierarchy to `systemc-map.json`.
3. Open the workspace in VS Code.
4. Open the **SystemC Map** view in the Explorer.
5. Use **Refresh hierarchy** after regenerating the JSON file.

By default the extension reads:

```text
systemc-map.json
```

from the first workspace folder.

The path can be changed with:

```text
class-maps.systemcMapPath
```

## JSON format

Each node uses its complete SystemC hierarchical name as its ID:

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
        }
    ],
    "edges": []
}
```

Full hierarchical IDs allow objects with the same local name under different parents to remain distinct.

An example is available in `examples/systemc-map.json`.

## Exporter

`exporter/SystemCMapExporter.cpp` walks the elaborated SystemC object hierarchy using SystemC's hierarchy APIs and emits module nodes.

Typical integration:

```cpp
#include "SystemCMapExporter.hpp"

int sc_main(int argc, char** argv)
{
    Top top("top");

    class_maps::write_systemc_map("systemc-map.json");

    sc_core::sc_start();
    return 0;
}
```

The exporter currently includes modules only. Ports, channels, bindings and runtime overlays are planned as later layers.

## Development status

Implemented in the current SystemC work branch:

- SystemC graph data model
- validated JSON loading
- duplicate-ID and missing-parent checks
- hierarchy-cycle detection
- hierarchy forest construction
- fixed-size tree layout
- multiple top-level hierarchy support
- repeated local-name support through full IDs
- SVG rendering in the VS Code webview
- hierarchy refresh command
- initial SystemC C++ exporter
- automated loader and layout tests

The legacy Java parsing code still exists in the repository but is no longer used by the extension execution path. It can be removed after the SystemC path is fully established.

## Requirements

- VS Code 1.65 or later
- a SystemC application capable of generating the hierarchy JSON
