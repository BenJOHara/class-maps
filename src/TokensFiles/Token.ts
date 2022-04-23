export class Token{
    content : string;
    type : number; // 0 = stringLitteral,  1 = Identifier/Keyword, 2 = number, 3 = new line, -1 everything else

    constructor(content : string, type:number)
    {
        this.content = content;
        this.type = type;
    }
}