export class SystemCNodeData {
    public id: string;
    public name: string;
    public kind: string;
    public parentId: string | null;

    public x = 0;
    public y = 0;
    public width = 140;
    public height = 50;
    public hiddenWidth = 140;

    constructor(id: string, name: string, kind: string, parentId: string | null) {
        this.id = id;
        this.name = name;
        this.kind = kind;
        this.parentId = parentId;
    }
}
