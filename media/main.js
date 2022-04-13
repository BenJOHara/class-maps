//@ts-check
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

//const { lchmodSync } = require("fs");
//const { json } = require("stream/consumers");


(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    const oldState = vscode.getState() || { content: [] };

    /** @type {Array<{ value: string }>} */
    let content = oldState.content;


    document.querySelector('.show-class-info').addEventListener('click', () => {
        showClassInfo();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'showClassInfo':
                {
                    updateClassInfo(message.content);
                }

        }
    });

    function showClassInfo() {
        //get names
        //add to ul class list
        vscode.postMessage({type: 'getClassInfo'});
    }

    //from a child finds the start and end of the line between parent and child
    function findStartAndEnd(c)
    {
        

        //parent exists
        //find x
        if (c.parentType !== undefined)
        {
            let pX = c.parentType.x + 0.5* c.parentType.width;
            let pY = c.parentType.y + c.parentType.height;

            let cX = c.x + 0.5 * c.width;
            let cY = c.y;

            return [[pX, pY],[cX,cY]];
        }

        if (c.parent.length === 0)
        {
            return [[0,0],[0,0]];//if no parent draw a line from 0,0 to 0,0 idk what happens if u do this i assume no line
        }
        else {
            //parent was undefined
            return [[0,0],[0,0]];//this should be changed
        }

        

    }

    function setLine(c)
    {
        //console.log(c);
        let startAndEnd = findStartAndEnd(c);
        //console.log(startAndEnd);
        if (startAndEnd === [[0,0],[0,0]])
        {
            return;
        }

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');

        line.setAttributeNS(null, 'x1', startAndEnd[0][0].toString());
        line.setAttributeNS(null, 'y1', startAndEnd[0][1].toString());
        line.setAttributeNS(null, 'x2', startAndEnd[1][0].toString());
        line.setAttributeNS(null, 'y2', startAndEnd[1][1].toString());

        line.setAttributeNS(null, 'stroke-width', '1');

        line.setAttributeNS(null, 'stroke', 'red');
        return line;

    }

    //
    function setRect(c)
    {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        //position in SVG
        if (c.x === 0 && c.y === 0)//this is because some classes inherit from external classes
        {
            console.log("placing at 0,0", c);
        }
        rect.setAttributeNS(null, 'x', c.x.toString());
        rect.setAttributeNS(null, 'y', c.y.toString());

        
        const width = 0.1 * c.nTokens;
        const height = 0.5 * c.nLines;

        //size of rect in SVG
        rect.setAttributeNS(null, 'height', c.height.toString());
        rect.setAttributeNS(null, 'width', c.width.toString());//
        
        //CSS of rect and cursor
        rect.setAttributeNS(null, 'cursor', 'pointer');

        let fill = 'white';
        if (c.external)
        {
            fill = 'LightBlue';
        }

        rect.setAttributeNS(null, 'fill', fill);
        rect.setAttributeNS(null, 'stroke', 'red');

        //const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        //title.textContent = c.name  + 'test' ;

        //onclick tell extension 
        rect.onclick = function(){
            vscode.postMessage({type:'openWindow', content : c.uri});
        };

        //onmouseover change css
        rect.onmouseover = function(){
            rect.setAttributeNS(null, 'fill', 'blue');
            rect.setAttributeNS(null, 'stroke', 'white');
        };
        rect.onmouseout = function(){
            rect.setAttributeNS(null, 'fill', fill);
            rect.setAttributeNS(null, 'stroke', 'red');
        };

        //rect.appendChild(title);

        return rect;
    }
    

    function updateClassInfo(classInfo)
    {
        clearNumberOfClasses();
        clearClassList();
        let prevX = 0;
        const classes = JSON.parse(classInfo);
        const ul = document.querySelector('.svg1');
        ul.textContent = '';

        

        ul.setAttributeNS(null, 'width', '20000');
        ul.setAttributeNS(null, 'height', '2000');
        
        //console.log(window.screen.availWidth.toString(), window.screen.availHeight.toString(), window.screen.height, window.screen.width);

        //console.log(classes);
        for (let i = 0; i < classes.length; i++)
        {
            const rect = setRect(classes[i]);
            const line = setLine(classes[i]);
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = "test";
            ul.appendChild(rect);
            ul.appendChild(line);
        }
        vscode.setState({ content: content });

    }

    function clearClassList()
    {
        const ul = document.querySelector('.class-list');
        ul.textContent = '';
    }

    function clearNumberOfClasses()
    {
        const ul = document.querySelector('.svg1');
        ul.textContent = '';
    }

    /**
     * 
     * @param {number} numberClasses 
     */

}());


