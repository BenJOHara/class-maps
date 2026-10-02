import * as vscode from "vscode";
import { HierarchyForest } from "./Hierarchy/HierarchyForest";
import { SystemCGraph } from "./SystemC/SystemCGraph";
import { SystemCJsonLoader } from "./SystemC/SystemCJsonLoader";

export function activate(context: vscode.ExtensionContext): void {
    const provider = new SystemCViewProvider(context.extensionUri);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(SystemCViewProvider.viewType, provider)
    );

    context.subscriptions.push(
        vscode.commands.registerCommand("class-maps.refresh-systemc-hierarchy", async () => {
            await provider.showSystemCInfo();
        })
    );
}

class SystemCViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "class-maps.map-view";

    private view?: vscode.WebviewView;

    constructor(private readonly extensionUri: vscode.Uri) {
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true
        };

        webviewView.webview.html = this.getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            if (data.type === "getSystemCInfo") {
                await this.showSystemCInfo();
            }
        });

        void this.showSystemCInfo();
    }

    public async showSystemCInfo(): Promise<void> {
        try {
            const graph = await this.loadGraph();
            const forest = new HierarchyForest(graph.nodes);
            forest.layout();

            if (this.view !== undefined) {
                await this.view.webview.postMessage({
                    type: "showSystemCInfo",
                    content: graph
                });
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);

            if (this.view !== undefined) {
                await this.view.webview.postMessage({
                    type: "showSystemCError",
                    content: message
                });
            }

            void vscode.window.showErrorMessage("SystemC Map: " + message);
        }
    }

    private async loadGraph(): Promise<SystemCGraph> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders === undefined || workspaceFolders.length === 0) {
            throw new Error("Open a workspace containing a SystemC map");
        }

        const configuration = vscode.workspace.getConfiguration("class-maps");
        const configuredPath = configuration.get<string>("systemcMapPath", "systemc-map.json");
        const pathParts = configuredPath.split(/[\\/]+/).filter(part => part.length > 0);

        if (pathParts.length === 0) {
            throw new Error("class-maps.systemcMapPath must not be empty");
        }

        const mapUri = vscode.Uri.joinPath(workspaceFolders[0].uri, ...pathParts);

        let bytes: Uint8Array;
        try {
            bytes = await vscode.workspace.fs.readFile(mapUri);
        } catch {
            throw new Error("Unable to read " + mapUri.fsPath);
        }

        return SystemCJsonLoader.parse(Buffer.from(bytes).toString("utf8"));
    }

    private getHtmlForWebview(webview: vscode.Webview): string {
        const scriptUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "main.js")
        );
        const styleResetUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "reset.css")
        );
        const styleVSCodeUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "vscode.css")
        );
        const styleMainUri = webview.asWebviewUri(
            vscode.Uri.joinPath(this.extensionUri, "media", "main.css")
        );
        const nonce = getNonce();

        return [
            "<!DOCTYPE html>",
            '<html lang="en">',
            "<head>",
            '    <meta charset="UTF-8">',
            '    <meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src ' + webview.cspSource + '; script-src \'nonce-' + nonce + '\';">',
            '    <meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '    <link href="' + styleResetUri + '" rel="stylesheet">',
            '    <link href="' + styleVSCodeUri + '" rel="stylesheet">',
            '    <link href="' + styleMainUri + '" rel="stylesheet">',
            "    <title>SystemC Map</title>",
            "</head>",
            "<body>",
            '    <div class="toolbar">',
            '        <button class="refresh-hierarchy">Refresh hierarchy</button>',
            '        <span class="status" role="status"></span>',
            "    </div>",
            '    <div class="svg-container">',
            '        <svg class="systemc-map" width="0" height="0"></svg>',
            "    </div>",
            '    <script nonce="' + nonce + '" src="' + scriptUri + '"></script>',
            "</body>",
            "</html>"
        ].join("\n");
    }
}

export function deactivate(): void {
}

function getNonce(): string {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let index = 0; index < 32; index++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    return text;
}
