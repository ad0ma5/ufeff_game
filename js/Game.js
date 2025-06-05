export default class Game{
    dt = 0;
    view;
    gridSize = 50;
    cellSize = 8;
    mapList = [];
    //mode = 'game';
    mode = 'load';
    currentMapName = '';
    playerMoving = false;
    gameScale = 2;
    gameLoopStarted = false;
    editorLoopStarted = false;
    keys = {};
    pauseLoop = false;

    camera = { x: 0, y: 0 };
    initTile = { x:2,y:10 };
    showCoords = false;

    defaultMaps = ["map1.1","map2","map3","map4"];

    gameMap = this.createEmptyMap();
    gameUnits = [];
    gameMapLayer = [];
    currentPlayerObj = false
    selectedUnit = null;

    playerMenuItems = [
      { label: 'Player perks ', items: [{ name: 'Chaos curse', spriteX: 23, spriteY: 25, count: 200 }] },
      { label: 'Stats', items: [{ name: 'Strength', value: 12 }, { name: 'Magic', value: 30 }] }
    ];

    //game menu
    isGameMenuOpen = false;
    isPlayerMenuOpen = false;

    gameMenuItems = ['Save', 'Load', 'Edit', 'zoom 1', 'zoom 2', 'zoom 3',];

    playerInventory = Array(8*4).fill(null); // 10x5 grid
    ///////////////////////// start game maybe extract outside as only needed once at the start
    selectedCharacterIndex = null;

    characters = Array.from({ length: 10 }, (_, i) => ({
        name: `Hero ${i + 1}`,
        spritex:    i < 5 ? 0 : 8,
        spritey:  i * 2 % 10 
    }));

    selectedTile = null;
    mouseX = 0;
    mouseY = 0;
    smouseX = 0; 
    smouseY = 0;
    hoverx = 0; 
    hovery = 0;

    btnAreas = [];
    charAreas = [];
    playerAnimationX = 0;
    stopFlip = false;
    flipTile = false;
    flippingTile = false;
    flipTimer = 0;
    flipInterval = 200; // milliseconds
    flipHorizontally = false;

    x1;
    y1;
    x2;
    y2;
    sayMsgObj = []
    ix;
    iy;

    hoveredGameMenuItem = -1;
    hoveredPlayerMenuItem = -1;

    hoveredInventoryIndex = -1;
    updating = false;
    gameX;
    gameY;
    /////////////////////////////////////////
    constructor(){
        console.log('Game constructed');
       this.playerInventory[0] = { name: 'Chaos Orb', spriteX: 16, spriteY: 0, count: 200 };
       this.playerInventory[1] = { name: 'Mana Potion', spriteX: 18, spriteY: 0, count: 15 };
       this.playerInventory[2] = { name: 'Mana Jana', spriteX: 22, spriteY: 0, count: 5 };
       this.playerInventory[3] = { name: 'Mana Dicvision', spriteX: 24, spriteY: 0, count: 65 };
       this.playerInventory[4] = { name: 'Mana Pollocks', spriteX: 20, spriteY: 0, count: 35 };
       this.playerInventory[5] = { name: 'Mana Peace', spriteX: 16, spriteY: 2, count: 51 };
       this.playerInventory[6] = { name: 'Mana Bugana', spriteX: 18, spriteY: 2, count: 356 };
       this.playerInventory[7] = { name: 'Mana Banana', spriteX: 20, spriteY: 2, count: 45 };
       this.playerInventory[8] = { name: 'Mana Pot', spriteX: 22, spriteY: 2, count: 53 };
       this.playerInventory[9] = { name: 'Mana Lotiom', spriteX: 24, spriteY: 2, count: 5 };
    }

    doLoop = () => {};
    
    createEmptyMap() {
        //return Array(gridSize).fill().map(() => Array(gridSize).fill({x:9,y:11}));//16
        return Array(this.gridSize).fill().map(() => Array(this.gridSize).fill({x:this.initTile.x,y:this.initTile.y}));//8
    }

    forSave(){
        return {
            map: this.gameMap,
            layer: this.gameMapLayer,
            units: this.gameUnits,
            currentObj: this.currentPlayerObj,
            currentMapName: this.currentMapName,
        }
    }

    clearMap() {
        this.gameMap = this.createEmptyMap();
        this.gameUnits = [];
        // this will be gameEditor part
        //this.map_name.value = '';
    }

    clearUnits(){

        this.gameUnits = [];
        //drawEditor();
    }
    getUnitAt(x, y) {
        return this.gameUnits.find(unit => unit.x === x && unit.y === y);
    }
    getLayerAt(x, y) {
        return this.gameMapLayer.find(unit => unit.x === x && unit.y === y);
    }

    startNewGameWithCharacter(character) {
        // Reset state
        this.currentMapName = 'map1.1';
        this.clearMap();

        if(canvasInput.text)
            character.name = canvasInput.text;
        // Add player unit
        const newPlayer = {
            ...character,
            x: 1,
            y: 1,
            is_player: 1,
            size: 2,
            o: false,
            p: "player"
        };
        this.currentPlayerObj = newPlayer;
        //this.gameUnits.push(newPlayer);

        // Load map1.1 (if stored locally)
        this.loadMapByName('map1.1');

        this.switchMode('game')
    }

    switchMode(newMode){
        
        this.mode = newMode;
        document.getElementById('game-container').classList.toggle('active', this.mode === 'game' || this.mode === "load" || this.mode === "charSelect");
        document.body.classList.toggle('active', this.mode === 'game' );
        document.getElementById('editor-container').classList.toggle('active', this.mode === 'editor');

        if (this.mode === 'load'){
            this.doLoop = () => view.drawLoadScreen();
        } else if (this.mode === 'charSelect'){
            this.doLoop = () => view.drawCharacterSelectScreen();
        } else if (this.mode === 'game') {
            this.gameLoopStarted =true;
            this.editorLoopStarted = false;
            this.doLoop = () => view.drawGame();
            //showOverlay("Turn for Player "+this.currentPlayer);
        } else {
            this.gameLoopStarted =false;
            this.editorLoopStarted = true;
            map_name.value = this.currentMapName;
            this.doLoop = () => view.drawEditor();

        }

    }
    loadMap = () => {
        //alert('will load maps');
        const savedMapsStr = localStorage.getItem('savedMapsUfeff');
        let savedMaps = [];
        if(savedMapsStr){
            savedMaps = JSON.parse(savedMapsStr);
            //return;
        }
        for(let i = 0; i< this.defaultMaps.length;i++){
            if(savedMaps.indexOf(this.defaultMaps[i]) === -1){
                console.log('pushing',this.defaultMaps[i]);
                savedMaps.push(this.defaultMaps[i]);
            }
        }
        printSavedMap(savedMaps);
        return
    }
    update(dt,ctx){
        if(!dt) dt = game.dt;
        //console.log('up',dt);

        if(this.playerMoving){
            if(!this.flipTimer) this.flipTimer = dt+this.flipInterval; 
            //flipTimer += dt;

            if (this.flipTimer < dt) {
                //console.log('dt',dt, flipTimer,flipInterval);
                if(!this.stopFlip)
                    this.flipHorizontally = !this.flipHorizontally; // true if moving left
                if(this.flipTile)
                    this.flippingTile = !this.flippingTile;
                //flipTimer -= flipInterval;   // reset timer, preserving leftover time
                this.flipTimer = dt + this.flipInterval; //flipInterval;   // reset timer, preserving leftover time
            }else{
                //console.log('ielse dt',dt, game.flipTimer,game.flipInterval);
            }
        }

        let currentP = Object.assign({}, this.currentPlayerObj);

        //
        //1. x,y       2. x+2cell y
        //3. x,y+2cell 4. x+2cell y+2cell
        if(!this.x1)
            this.x1=Math.round(currentP.x)
        if(!this.y1)
            this.y1=Math.round(currentP.y)
        if(!this.x2)
            this.x2=Math.round(currentP.x)
        if(!this.y2)
            this.y2=Math.round(currentP.y)
        let speed = 0.05;
        let offset = 0;
        if (this.keys['ArrowLeft']){ 
            currentP.x -= speed
            this.x1 = Math.round(currentP.x-offset-1) +1;
            this.x2 = this.x1;
            this.y1 =  Math.round(currentP.y);
            this.y2 = this.y1+1;
            this.playerAnimationX = 4;
            this.stopFlip = true;
            this.flipTile = true;
            //flippingTile = !flippingTile;
            this.flipHorizontally = true;
        }else
        if (this.keys['ArrowRight']){ 
            currentP.x += speed
            this.x1 = Math.round(currentP.x+2+offset)-1 ;
            this.x2 = this.x1;
            this.y1 =  Math.round(currentP.y);
            this.y2 = this.y1+1;
            this.playerAnimationX = 4
            this.stopFlip = true;
            this.flipTile = true;
            //flippingTile = !flippingTile;
            this.flipHorizontally = false;
        }else
        if (this.keys['ArrowUp']) {
            currentP.y -= speed
            this.x1 = Math.round(currentP.x) ;
            this.x2 = this.x1 +1;
            this.y1 = Math.round(currentP.y-offset-1)+1;
            this.y2 = this.y1
            this.playerAnimationX = 2
            this.flipTile = false;
            this.flippingTile = false;
            this.stopFlip = false;
        }else
        if (this.keys['ArrowDown']){ 
            currentP.y += speed
            this.x1 = Math.round(currentP.x) ;
            this.x2 = this.x1+1;
            this.y1 = Math.round(currentP.y+2 +offset)-1;
            this.y2 = this.y1;
            this.playerAnimationX = 0
            this.flipTile = false;
            this.flippingTile = false;
            this.stopFlip = false;
        }


        if(this.x1 && this.y1){
            let layer = this.getLayerAt(this.x1,this.y1);
            if(
                (layer && layer.p) 
            ){
                if(this.checkPurpose(layer)) return;
            }
            if(layer && layer.o === true){
                return
            }
            let unit = this.getUnitAt(this.x1,this.y1);
            if(unit && unit.p){
                if(this.checkPurpose(unit )) return;
            }
            if(unit && unit.o === true){
                return
            }

            if(this.gameMap[this.y1] && this.gameMap[this.y1][this.x1]) {
                let cell = this.gameMap[this.y1][this.x1]
                //console.log(currentP, cell);
                if(cell.o === true){
                    //stop collision
                    return;
                }

            }else{
                return
            }
        }
        if(this.x2 && this.y2){
            //console.log('p',currentP, x1,y1,x2,y2,this.currentPlayerObj);
            let layer = this.getLayerAt(this.x2,this.y2);
            //console.log(layer1);
            if(
                (layer && layer.p) 
            ){
                if(this.checkPurpose(layer)) return;

            }
            if(layer && layer.o === true){
                return
            }
            let unit = this.getUnitAt(this.x2,this.y2);
            if(unit && unit.p){
                if(this.checkPurpose(unit )) return;
            }
            if(unit && unit.o === true){
                return
            }
            if(this.gameMap[this.y2] && this.gameMap[this.y2][this.x2]) {
                let cell = this.gameMap[this.y2][this.x2]
                //console.log(currentP, cell);
                if(cell.o === true){
                    //stop collision
                    return;
                }
            }
            //if falling through no obsticle found so go there
        }else{
            return
        }
        this.currentPlayerObj = currentP;
    }
    checkPurpose(obj){
        let p =  obj.p;
        console.log('p',p)
        const splt = p.split(":");
        let action = splt[0] ;
        if (action === "portal"){
            let direction = splt[1], cx = parseInt(splt[2]), cy = parseInt(splt[3])
            this.x1=this.x2=0;
            this.y1=this.y2=0;
            this.keys = {};
            this.currentPlayerObj.x -= 0.5;
            this.currentPlayerObj.y -= 0.5;
            //flipTile = false;
            //flipHorizontally = false;
            this.playerMoving = false;

            //this.update()
            let go = true;//confirm("want to go?");
            if(go){

                //autosave()
                this.saveMap()
                this.loadMapByName(direction);
                console.log('map loaded',direction,cx,cy)
                if(cx)
                    this.currentPlayerObj.x = cx;
                if(cy)
                    this.currentPlayerObj.y = cy;
            }
            return true;
        }
        if (action === "say"){
            let msg = splt[1];
            this.x1=this.x2=0;
            this.y1=this.y2=0;
            this.keys = {};
            this.flipTile = false;
            //flipHorizontally = false;
            this.playerMoving = false;
            this.sayMsgObj = [obj, msg];
            this.pauseLoop = true;

            return true;
        }
        return false;
    }
    loadMapByName = (name) => {
        console.log('loading map by name ',name);
        game.currentMapName = name;
        if(game.defaultMaps.indexOf(name) !== -1){
            fetch("maps/"+name+".json")
                .then(response => response.json())
                .then(saved => { 
                    //console.log(saved) 
                    //saved.units = fixData(saved.units);
                    this.extractFromSave(saved)
                    map_menu.innerHTML = "";
                    //drawGame();
                    //showOverlay("Turn for Player "+game.currentPlayer);
                });
            return;
        }
        const loadMapStr = localStorage.getItem(name);
        if(loadMapStr){
            const loadMapObj = JSON.parse(loadMapStr);
            this.extractFromSave(loadMapObj);
            //alert(`loaded ${name}`)
            map_menu.innerHTML = "";
            //drawGame();
            //showOverlay("Turn for Player "+game.currentPlayer);
        }else{

            alert(`not found ${name}`)
        }

    }
    extractFromSave(save){
        game.gameMap = save.map;
        game.gameMapLayer = save.layer;
        game.gameUnits = save.units;
        if(!game.currentPlayerObj)
            game.currentPlayerObj = save.currentObj;
        game.currentMapName = save.currentMapName;
        view.input_map_name.value = game.currentMapName;
    }

    saveMap() {

        if(view.input_map_name.value === ""){
            alert('fill in the name for the map to save it');
            return;
        }
        console.log(view.input_map_name.value, 'name of save');
        localStorage.setItem(view.input_map_name.value, JSON.stringify(this.forSave()));
        const savedMapsStr = localStorage.getItem('savedMapsUfeff');
        let savedMaps = [];
        if(savedMapsStr) savedMaps = JSON.parse(savedMapsStr);
        if(savedMaps.indexOf(view.input_map_name.value) === -1){
            console.log('pushing hard',view.input_map_name.value);
            savedMaps.push(view.input_map_name.value)
        }

        localStorage.setItem('savedMapsUfeff', JSON.stringify(savedMaps));
        //alert('Map "'+view.input_map_name.value+'" saved! ');
        return;
    }

};
