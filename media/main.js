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

    //updateColorList(colors);

    document.querySelector('.show-names').addEventListener('click', () => {
        showNames();
    });

    document.querySelector('.show-number').addEventListener('click', () => {
        showNumber();
    });

    document.querySelector('.show-class-info').addEventListener('click', () => {
        showClassInfo();
    });

    // Handle messages sent from the extension to the webview
    window.addEventListener('message', event => {
        const message = event.data; // The json data that the extension sent
        switch (message.type) {
            case 'showNames':
                {
                    updateClassList(message.content);
                    break;
                }
            case 'showNumber':
                {
                    updateNumberOfClasses(message.content);
                    break;
                }
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

    function showNames() {
        //get names
        //add to ul class list
        vscode.postMessage({type: 'getNames'});
    }

    function showNumber(){
        //get number of classes
        //add to ul class list as one item
        vscode.postMessage({type : 'getNumber'});
    }


    function updateClassList(content)
    {
        clearClassInfo();
        clearNumberOfClasses();
        const ul = document.querySelector('.class-list');
        ul.textContent = '';
        for (const cont of content){
            const li = document.createElement('li');
            li.className = 'class-entry';

            const text = document.createElement('p');
            text.innerText = cont;
            li.appendChild(text);
            ul.appendChild(li);
        }
        vscode.setState({ content: content });
    }
    
    function clearClassInfo()
    {
        const ul = document.querySelector('.svg1');
        ul.textContent = '';
    }

    function setRect(c)
    {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        //position in SVG
        rect.setAttributeNS(null, 'x', c.x.toString());
        rect.setAttributeNS(null, 'y', c.y.toString());

        
        const width = 0.1 * c.nTokens;
        const height = 0.5 * c.nLines;

        //size of rect in SVG
        rect.setAttributeNS(null, 'height', height.toString());
        rect.setAttributeNS(null, 'width', width.toString());
        
        //CSS of rect and cursor
        rect.setAttributeNS(null, 'cursor', 'pointer');
        rect.setAttributeNS(null, 'fill', 'white');
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
            rect.setAttributeNS(null, 'fill', 'white');
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

        

        ul.setAttributeNS(null, 'width', '500');
        ul.setAttributeNS(null, 'height', '500');
        
        //console.log(window.screen.availWidth.toString(), window.screen.availHeight.toString(), window.screen.height, window.screen.width);

        //console.log(classes);
        for (let i = 0; i < classes.length; i++)
        {
            const rect = setRect(classes[i]);
            /*const c = classes[i];
            const g = document.createElement('g');
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            const width = 0.1 * c.nTokens;
            const height = 0.5 * c.nLines;
            rect.setAttributeNS(null, 'width', width.toString());
            rect.setAttributeNS(null, 'height', height.toString());

            rect.setAttributeNS(null, 'x', prevX.toString());
            prevX = width + prevX + 10;
            //console.log(prevX);
            rect.setAttributeNS(null, 'cursor', 'pointer');
            rect.setAttributeNS(null, 'fill', 'white');
            rect.setAttributeNS(null, 'stroke', 'red');
            rect.onclick = function(){
                //console.log('clicked ' + c.name); //post message to open class in new window
                vscode.postMessage({type:'openWindow', content : c.uri});
            };
            rect.onmouseover = function(){
                //console.log('hover ' + c.name);
                rect.setAttributeNS(null, 'fill', 'red');
                rect.setAttributeNS(null, 'stroke', 'white');
            };
            rect.onmouseout = function(){
                //console.log('hover out ' + c.name);
                rect.setAttributeNS(null, 'fill', 'white');
                rect.setAttributeNS(null, 'stroke', 'red');
            };
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.textContent = classInfo.name;
            text.innerHTML = "test";*/
            ul.appendChild(rect);
            //ul.appendChild(text);
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
    function updateNumberOfClasses(numberClasses)
    {
        clearClassInfo();
        clearClassList();
        const ul = document.querySelector('.svg1');
        ul.textContent = '';
        ul.setAttributeNS(null, 'width', '500');
        ul.setAttributeNS(null, 'height', '3000');
        let height = 100 * numberClasses;
        //<rect width="300" height="100" style="fill:rgb(0,0,255;);stroke-width:3;stroke:rgb(0,0,0)"/>;
        const li = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        li.setAttributeNS(null, 'width', '100');

        li.setAttributeNS(null, 'height', height.toString());
        ul.appendChild(li);
        vscode.setState({content: content});
    }

}());


