//@ts-check
// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.


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

    function updateClassInfo(classInfo)
    {
        clearNumberOfClasses();
        clearClassList();
        let prevX = 0;
        const jsonText = JSON.parse(classInfo);
        const ul = document.querySelector('.svg1');
        ul.textContent = '';
        ul.setAttributeNS(null, 'width', '500');
        ul.setAttributeNS(null, 'height', '1000');
        for (const c of jsonText){
            console.log(c.name);
            const g = document.createElement('g');
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const width = 0.25 * c.length;
            const height = 0.5 * c.length;
            rect.setAttributeNS(null, 'width', width.toString());
            rect.setAttributeNS(null, 'x', prevX.toString());
            prevX = width + prevX + 10;
            console.log(prevX);
            rect.setAttributeNS(null, 'height', height.toString());

            rect.setAttributeNS(null, 'fill', 'white');
            rect.setAttributeNS(null, 'stroke', 'red');
            rect.setAttributeNS(null, 'onmouseover', "evt.target.setAttribute('fill', 'red');");
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.textContent = classInfo.name;
            ul.appendChild(rect);
            //ul.appendChild(g);
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


