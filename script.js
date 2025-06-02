let camera = { x: 0, y: 0 };
let initTile = { x:2,y:10 };
let showCoords = false;

const defaultMaps = ["map1.1","map2","map3","map4"];

const gameCanvas = document.getElementById('game-canvas');
let gameCtx;
const editorCanvas = document.getElementById('editor-canvas');
let editorCtx;

const spriteCanvas = document.getElementById('spriteCanvas');
const spriteCtx = spriteCanvas.getContext('2d');

const is_unit = document.getElementById('is_unit');
const is_layer = document.getElementById('is_layer');
const is_clear = document.getElementById('is_clear');
const is_double = document.getElementById('is_double');
const is_player = document.getElementById('is_player');
const is_obsticle = document.getElementById('is_obsticle');
const is_info = document.getElementById('is_info');
const is_hide_units = document.getElementById('is_hide_units');
const is_hide_layer = document.getElementById('is_hide_layer');
const selected_json = document.getElementById('selected_json');
const selected_id = document.getElementById('selected_id');
const its_purpose = document.getElementById('its_purpose');

let selectedTile = null;
let mouseX = 0, mouseY = 0;
let smouseX = 0, smouseY = 0;
let hoverx = 0, hovery = 0;


const selectedStatus = document.getElementById('selected_status');
const input_map_name = document.querySelector('#map_name');
const map_menu = document.querySelector('#map_menu');
const menu = document.getElementById('menu');
const editormenu = document.getElementById('editor-controls');
const gridSize = 50;
const cellSize = 8;
let currentPlayer = 1;
let playersCount = 1;
function newPlayer(id){
    return {
        id: id,
        //money: 0,
        //exp: 0,
        //level: 1,
    }
}
let currentPlayerObj = false
let selectedUnit = null;
function createEmptyMap() {
    //return Array(gridSize).fill().map(() => Array(gridSize).fill({x:9,y:11}));//16
    return Array(gridSize).fill().map(() => Array(gridSize).fill({x:initTile.x,y:initTile.y}));//8
}
let gameMap = createEmptyMap();
let gameUnits = [];
let gameMapLayer = [];
let mapList = [];
//let mode = 'game';
let mode = 'editor';
let turnCount = 0;
let currentMapName = '';
let playerMoving = false;
let gameScale = 3;
let gameLoopStarted = false;
let editorLoopStarted = false;
let keys = {};
let pauseLoop = false;

let ufeffSpriteLoaded = false;
let unitSpriteLoaded = true;//if later need more sprites

//game menu
let isGameMenuOpen = false;
let isPlayerMenuOpen = false;
let menuButtonSize = cellSize * gameScale;

let gameMenuItems = ['Save', 'Load', 'Edit'];
let playerMenuItems = [
  { label: 'Player perks ', items: [{ name: 'Chaos Orb', spriteX: 16, spriteY: 0, count: 200 }] },
  { label: 'Stats', items: [{ name: 'Strength', value: 12 }, { name: 'Magic', value: 30 }] }
];

let playerInventory = Array(8*4).fill(null); // 10x5 grid
playerInventory[0] = { name: 'Chaos Orb', spriteX: 16, spriteY: 0, count: 200 };
playerInventory[1] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[2] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[3] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[4] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[5] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[6] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[7] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[8] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };
playerInventory[9] = { name: 'Mana Potion', spriteX: 17, spriteY: 0, count: 5 };

const ufeffSprite = new Image();
ufeffSprite.src = "img/ufeff_tiles_v2.png"; // Your sprite sheet path

ufeffSprite.onload = function () {
    ufeffSpriteLoaded = true;
    goInit();
    theLoop();
}
function goInit(){
    if(ufeffSpriteLoaded && unitSpriteLoaded){
        console.log('goInit');
        gameCanvas.addEventListener('touchstart', handleTouchStart);
        gameCanvas.addEventListener('touchend', handleTouchEnd);

        gameCanvas.addEventListener('click', handleUIClick);//in game menu and profile
        gameCanvas.addEventListener('touchstart', handleUIClickT);//in game menu and profile
        gameCanvas.addEventListener('mousemove', handleUIMouseMove);
        //gameCanvas.addEventListener('click', handleUIClick);

        document.addEventListener('keydown', e => {
            //console.log('KEY',e.code);
          keys[e.code] = true;
          if (
            e.code === 'ArrowLeft' ||
            e.code === 'ArrowRight' ||
            e.code === 'ArrowUp' ||
            e.code === 'ArrowDown'
            ) {
                pauseLoop = false;
                sayMsgObj = [];
                playerMoving = true;
                //if(editorCanvas.focus)
                e.preventDefault();
            }
          if (e.code === 'KeyS') {
                autosave();
            }
          if (e.code === 'KeyR') {
          }else{
            //e.preventDefault();
          }
            //drawEditor();
        });
        document.addEventListener('keyup', e => {
            keys[e.code] = false;

            playerMoving = false;
            //drawEditor();
        });

        spriteCtx.drawImage(ufeffSprite, 0, 0);
        // --- Sprite selection ---
        spriteCanvas.addEventListener('click', (e) => {
            let is_double_checked = is_double.checked;

            const size = is_double_checked ? 2 : 1;
          const rect = spriteCanvas.getBoundingClientRect();
          const sx = Math.floor((e.clientX - rect.left) / cellSize/gameScale*2)/2;
          const sy = Math.floor((e.clientY - rect.top) / cellSize/gameScale*2)/2;
            console.log('selected tile',sx,sy)
          selectedTile = { x:sx, y:sy, size };
        });
        // --- Track mouse for preview ---
        spriteCanvas.addEventListener('mousemove', (e) => {
          const rect = spriteCanvas.getBoundingClientRect();
          smouseX = Math.floor((e.clientX - rect.left) / cellSize/gameScale*2)/2;
          smouseY = Math.floor((e.clientY - rect.top) / cellSize/gameScale*2)/2;
        });
        // --- Track mouse for preview ---
        editorCanvas.addEventListener('mousemove', (e) => {
          const rect = editorCanvas.getBoundingClientRect();
          mouseX = Math.floor((e.clientX - rect.left) / cellSize /gameScale)// *2)/2;
          mouseY = Math.floor((e.clientY - rect.top) / cellSize /gameScale)// *2)/2;
        });
        // --- Place tile on map ---
        editorCanvas.addEventListener('click', () => {
            let is_unit_checked = is_unit.checked;
            let is_layer_checked = is_layer.checked;
            let is_clear_checked = is_clear.checked;
            let is_player_checked = is_player.checked;
            let is_obsticle_checked = is_obsticle.checked;
            let is_info_checked = is_info.checked;
            let selected_id_txt = '';
            //console.log('is_unit_checked is_layer_checked',is_unit_checked, is_layer_checked);

                selected_id_txt += ` At ${mouseX} ${mouseY} `;


            if(is_clear_checked){
                selected_id_txt += " cleared";
                if(is_unit_checked){
                    selected_id_txt += " unit";
                    const unit = getUnitAt(mouseX,mouseY);
                    if(unit){
                        gameUnits = gameUnits.filter(unit => Math.floor(unit.x) !== mouseX || Math.floor(unit.y) !== mouseY);
                        console.log('cleaned unit', Math.floor(unit.x),mouseX,Math.floor(unit.y),mouseY,gameUnits)

                        selected_json.innerHTML = JSON.stringify(unit)
                    }

                }else if(is_layer_checked){
                    selected_id_txt += " layer";
                    const unit = getLayerAt(mouseX,mouseY);
                    if(unit){
                        gameMapLayer = gameMapLayer.filter(unit => unit.x !== mouseX || unit.y !== mouseY);
                        console.log('cleaned layer', Math.floor(unit.x),mouseX,Math.floor(unit.y),mouseY,gameUnits)
                        selected_json.innerHTML = JSON.stringify(unit)
                    }

                }else{
                    gameMap[mouseY][mouseX] = {x:initTile.x,y:initTile.y};
                }

            }else if(is_unit_checked ){
                //
                if (selectedTile) {
                    gameUnits = gameUnits.filter(unit => unit.x !== mouseX || unit.y !== mouseY);
                    console.log(gameUnits);
                    //let clone = Object.assign({}, userDetails)
                    let unitObj = {}//Object.assign({}, unitsBlueprint[unitType]);
                    unitObj.x = mouseX;
                    unitObj.y = mouseY;
                    unitObj.spritex = selectedTile.x;
                    unitObj.spritey = selectedTile.y;
                    unitObj.size = selectedTile.size;
                    unitObj.o = is_obsticle_checked;
                    unitObj.p = its_purpose.value;

                    if(is_player_checked){
                        unitObj.is_player = 1;
                        //unitObj.currentPlayerID = gameUnits.length;
                        currentPlayerObj = unitObj; 
                        gameUnits = gameUnits.filter(unit.player !== true);
                    }else{
                        //unitObj.player = player;
                        gameUnits.push(unitObj);
                    }
                    console.log('unit added',unitObj,gameUnits);
                    selected_id_txt += " unit added ";
                    selected_json.innerHTML = JSON.stringify(unitObj)
                }else{
                    const unit = getUnitAt(mouseX,mouseY);
                    selected_id_txt += " unit selected ";
                    selected_json.innerHTML = JSON.stringify(unit)
                }
            }else if(is_layer_checked){
                if (selectedTile) {
                    gameMapLayer = gameMapLayer.filter(unit => unit.x !== mouseX || unit.y !== mouseY);
                    let layerObj = {  };
                    layerObj.x = mouseX;
                    layerObj.y = mouseY;
                    layerObj.o = is_obsticle_checked;
                    layerObj.p = its_purpose.value;
                    layerObj.spritex = selectedTile.x;
                    layerObj.spritey = selectedTile.y;
                    layerObj.size = selectedTile.size;
                    gameMapLayer.push(layerObj);
                    console.log('layer added',layerObj,gameMapLayer);
                    selected_id_txt += " layer added ";
                    selected_json.innerHTML = JSON.stringify(layerObj)
                }else{
                    const unit = getLayerAt(mouseX,mouseY);
                    selected_id_txt += " layer selected ";
                    selected_json.innerHTML = JSON.stringify(unit)
                }
            }else{
              if (selectedTile) {
                    console.log('add bg tile',selectedTile);
                    let obsticle = false;
                    if(is_obsticle_checked){
                        obsticle = true;
                    }
                    gameMap[mouseY][mouseX] = { ...selectedTile };
                    gameMap[mouseY][mouseX].o = obsticle
                    gameMap[mouseY][mouseX].p = its_purpose.value;
                    if(selectedTile.size === 2){
                        gameMap[mouseY+1][mouseX] = { x:selectedTile.x, y:selectedTile.y+1, o: obsticle };
                        gameMap[mouseY][mouseX+1] = { x:selectedTile.x+1, y:selectedTile.y, o: obsticle };
                        gameMap[mouseY+1][mouseX+1] = { x:selectedTile.x+1, y:selectedTile.y+1, o: obsticle };
                    }
                    selected_id_txt += " tile added ";
                    selected_json.innerHTML = JSON.stringify(selectedTile)
              }else{
                    selected_id_txt += " tile selected ";
                    if(gameMap[mouseY])
                        selected_json.innerHTML = JSON.stringify(gameMap[mouseY][mouseX])
                    else
                        selected_json.innerHTML = '';
                }
            }
            if(is_info_checked){
                console.log(`x:${mouseX} y:${mouseY} `+'map',gameMap[mouseY][mouseX],'layers',getLayerAt(mouseX,mouseY),'units',getUnitAt(mouseX,mouseY))
            }
            selected_id.innerHTML = selected_id_txt
            autosave();
        });

        spriteCanvas.width *=gameScale;
        spriteCanvas.height *=gameScale;
        spriteCtx.scale(gameScale, gameScale)

        gameCanvas.width =window.innerWidth-50;// gridSize * cellSize;
        gameCanvas.height =window.innerHeight-200;// gridSize * cellSize;
        gameCtx = gameCanvas.getContext('2d');
        gameCtx.scale(gameScale, gameScale)

        editorCanvas.width = gridSize * cellSize *gameScale;
        //editorCanvas.width = gridSize * cellSize ;
        editorCanvas.height = gridSize * cellSize *gameScale;
        //editorCanvas.height = gridSize * cellSize ;
        editorCtx = editorCanvas.getContext('2d');
        //gameCtx.strokeStyle = 'black';
        editorCtx.scale(gameScale, gameScale)
        clearMap();
        if(loadAutosave()){
            console.log('loaded autosave');
        }
        //switchMode('editor');
        switchMode('game');
        //defaultLoad();
        // Initialize
        //switchMode('gamesingle');
    }
}
let currentTouchDirection = null;

function handleTouchStart(e) {
    e.preventDefault();
        pauseLoop = false;
    const touch = e.touches[0];
    const rect = gameCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const width = gameCanvas.width;
    const height = gameCanvas.height;

    const centerX = width / 2;
    const centerY = height / 2;

    const dx = x - centerX;
    const dy = y - centerY;

    const absDX = Math.abs(dx);
    const absDY = Math.abs(dy);

    // Clear previous direction
    clearTouchKeys();

    // Determine direction and simulate key
    if (absDX > absDY) {
        if (dx < 0) {
            keys['ArrowLeft'] = true;
            currentTouchDirection = 'ArrowLeft';
        } else {
            keys['ArrowRight'] = true;
            currentTouchDirection = 'ArrowRight';
        }
    } else {
        if (dy < 0) {
            keys['ArrowUp'] = true;
            currentTouchDirection = 'ArrowUp';
        } else {
            keys['ArrowDown'] = true;
            currentTouchDirection = 'ArrowDown';
        }
    }

    playerMoving = true;
}

function handleTouchEnd(e) {
    if (currentTouchDirection) {
        keys[currentTouchDirection] = false;
        playerMoving = false;
        currentTouchDirection = null;
    }
}

function clearTouchKeys() {
    keys['ArrowLeft'] = false;
    keys['ArrowRight'] = false;
    keys['ArrowUp'] = false;
    keys['ArrowDown'] = false;
}

function downloadMap(){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(packForSave()));
    var dlAnchorElem = document.getElementById('downloadAnchorElem');
    dlAnchorElem.setAttribute("href",     dataStr     );
    dlAnchorElem.setAttribute("download", currentMapName+".json");
    dlAnchorElem.click();
}

function defaultLoad(){
    if(loadAutosave()){
        console.log('autoseave?');
        if(!gameLoopStarted)
        drawGame();
        //showOverlay("Turn for Player "+currentPlayer);
        //document.getElementById('status').textContent = printPlayer(currentPlayerObj);
        return;
    }
    alert('autosave not found, please load a map');
    loadMap();
}
function loadAutosave(){
    const loaded = localStorage.getItem('autosaveUfeff');
    if(loaded){
        const autosave = JSON.parse(loaded);
        //autosave.units = fixData(autosave.units);
        extractFromSave(autosave);
        return true;
    }
    return false;
}
function extractFromSave(save){
        gameMap = save.map;
        gameMapLayer = save.layer;
        gameUnits = save.units;
        currentPlayer = save.current;
    if(!currentPlayerObj)
        currentPlayerObj = save.currentObj;
        currentMapName = save.currentMapName;
        turnCount = save.turnCount || 0;
        input_map_name.value = currentMapName;
}
function packForSave(){
    const toSave = {
        map: gameMap,
        layer: gameMapLayer,
        units: gameUnits,
        current: currentPlayer,
        currentObj: currentPlayerObj,
        currentMapName: currentMapName,
        turnCount: turnCount
    }
    return toSave;
}
function autosave(){
    localStorage.setItem('autosaveUfeff', JSON.stringify(packForSave()));
    console.log('autosaved');
}
function printSavedMap(maps){
    let list = `<p onclick="this.parentNode.innerHTML = ''">close</p><p class="d" onclick="this.parentNode.innerHTML=''">&times;</p><br />`;
    for(let i = 0; i<maps.length; i++){
        list += `<p onclick="loadMapByName('${maps[i]}')">${maps[i]} </p><p class="d" onclick="deleteMap('${maps[i]}')">del</p><br />`;
    }
    map_menu.innerHTML = list;
}
function loadMap() {
    //alert('will load maps');
    const savedMapsStr = localStorage.getItem('savedMapsUfeff');
    let savedMaps = [];
    if(savedMapsStr){
        savedMaps = JSON.parse(savedMapsStr);
        //return;
    }
    for(let i = 0; i< defaultMaps.length;i++){
        if(savedMaps.indexOf(defaultMaps[i]) === -1){
            console.log('pushing',defaultMaps[i]);
            savedMaps.push(defaultMaps[i]);
        }
    }
    printSavedMap(savedMaps);
    return
}
function toggleMenu(){
    if(menu.style.display === 'none')
        menu.style.display = 'inline-block';
        else
        menu.style.display = 'none';
}
function toggleControls(){
    if(editormenu.style.display === 'none')
        editormenu.style.display = 'inline-block';
        else
        editormenu.style.display = 'none';
}
function toggleSprites(){
    if(spriteCanvas.style.display === 'none')
        spriteCanvas.style.display = 'inline-block';
        else
        spriteCanvas.style.display = 'none';
}

let doLoop = null;
function theLoop(dt){
    //console.log('ooping', doLoop)
    if(!pauseLoop)
       doLoop(dt);
   requestAnimationFrame(theLoop)
}

function switchMode(newMode) {
    mode = newMode;
    document.getElementById('game-container').classList.toggle('active', mode === 'game' || mode === "gamesingle");
    document.body.classList.toggle('active', mode === 'game' || mode === "gamesingle");
    document.getElementById('editor-container').classList.toggle('active', mode === 'editor');
    if (mode === 'game') {

        gameLoopStarted =true;
        editorLoopStarted = false;
        doLoop = drawGame;
        //showOverlay("Turn for Player "+currentPlayer);
    } else {
        gameLoopStarted =false;
        editorLoopStarted = true;
        map_name.value = currentMapName;
        doLoop = drawEditor;

    }
    
    document.getElementById('status').textContent = printPlayer(currentPlayerObj);
}
let playerAnimationX = 0;
let stopFlip = false;
let flipTile = false;
let flippingTile = false;
let flipTimer = 0;
const flipInterval = 200; // milliseconds
let flipHorizontally = false;

let x1
let y1
let x2
let y2

function update(dt,ctx){

    if(playerMoving){
       if(!flipTimer) flipTimer = dt+flipInterval; 
        //flipTimer += dt;

        if (flipTimer < dt) {
            //console.log('dt',dt, flipTimer,flipInterval);
            if(!stopFlip)
            flipHorizontally = !flipHorizontally; // true if moving left
            if(flipTile)
            flippingTile = !flippingTile;
            //flipTimer -= flipInterval;   // reset timer, preserving leftover time
            flipTimer = dt + flipInterval; //flipInterval;   // reset timer, preserving leftover time
        }else{
            //console.log('ielse dt',dt, flipTimer,flipInterval);
        }
    }

    let currentP = Object.assign({}, currentPlayerObj);
    
    //
    //1. x,y       2. x+2cell y
    //3. x,y+2cell 4. x+2cell y+2cell
    if(!x1)
    x1=Math.round(currentP.x)
    if(!y1)
    y1=Math.round(currentP.y)
    if(!x2)
    x2=Math.round(currentP.x)
    if(!y2)
    y2=Math.round(currentP.y)
    let speed = 0.05;
    let offset = 0;
    if (keys['ArrowLeft']){ 
        currentP.x -= speed
        x1 = Math.round(currentP.x-offset-1) +1;
        x2 = x1;
        y1 =  Math.round(currentP.y);
        y2 = y1+1;
        playerAnimationX = 4;
        stopFlip = true;
        flipTile = true;
        //flippingTile = !flippingTile;
        flipHorizontally = true;
    }else
    if (keys['ArrowRight']){ 
        currentP.x += speed
        x1 = Math.round(currentP.x+2+offset)-1 ;
        x2 = x1;
        y1 =  Math.round(currentP.y);
        y2 = y1+1;
        playerAnimationX = 4
        stopFlip = true;
        flipTile = true;
        //flippingTile = !flippingTile;
        flipHorizontally = false;
    }else
    if (keys['ArrowUp']) {
        currentP.y -= speed
        x1 = Math.round(currentP.x) ;
        x2 = x1 +1;
        y1 = Math.round(currentP.y-offset-1)+1;
        y2 = y1
        playerAnimationX = 2
        flipTile = false;
        flippingTile = false;
        stopFlip = false;
    }else
    if (keys['ArrowDown']){ 
        currentP.y += speed
        x1 = Math.round(currentP.x) ;
        x2 = x1+1;
        y1 = Math.round(currentP.y+2 +offset)-1;
        y2 = y1;
        playerAnimationX = 0
        flipTile = false;
        flippingTile = false;
        stopFlip = false;
    }


    if(x1 && y1){
        let layer = getLayerAt(x1,y1);
        if(
            (layer && layer.p) 
        ){
            if(checkPurpose(layer)) return;
        }
        if(layer && layer.o === true){
            return
        }
        let unit = getUnitAt(x1,y1);
        if(unit && unit.p){
            if(checkPurpose(unit )) return;
        }
        if(unit && unit.o === true){
            return
        }

        if(gameMap[y1] && gameMap[y1][x1]) {
            let cell = gameMap[y1][x1]
            //console.log(currentP, cell);
            if(cell.o === true){
                //stop collision
                return;
            }

        }else{
            return
        }
    }
    if(x2 && y2){
        //console.log('p',currentP, x1,y1,x2,y2,currentPlayerObj);
        let layer = getLayerAt(x2,y2);
        //console.log(layer1);
        if(
            (layer && layer.p) 
        ){
            if(checkPurpose(layer)) return;

        }
        if(layer && layer.o === true){
            return
        }
        let unit = getUnitAt(x2,y2);
        if(unit && unit.p){
            if(checkPurpose(unit )) return;
        }
        if(unit && unit.o === true){
            return
        }
        if(gameMap[y2] && gameMap[y2][x2]) {
            let cell = gameMap[y2][x2]
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
        currentPlayerObj = currentP;
}
function checkPurpose(obj){
    let p =  obj.p;
    console.log('p',p)
    const splt = p.split(":");
    let action = splt[0] ;
    if (action === "portal"){
        let direction = splt[1], cx = parseInt(splt[2]), cy = parseInt(splt[3])
        x1=x2=0;
        y1=y2=0;
        keys = {};
        currentPlayerObj.x -= 0.5;
        currentPlayerObj.y -= 0.5;
        //flipTile = false;
        //flipHorizontally = false;
        playerMoving = false;

        update()
        let go = true;//confirm("want to go?");
        if(go){

            //autosave()
            saveMap()
            loadMapByName(direction);
            console.log('map loaded',direction,cx,cy)
            if(cx)
            currentPlayerObj.x = cx;
            if(cy)
            currentPlayerObj.y = cy;
        }
        return true;
    }
    if (action === "say"){
        let msg = splt[1];
        x1=x2=0;
        y1=y2=0;
        keys = {};
        flipTile = false;
        //flipHorizontally = false;
        //playerMoving = false;
        sayMsgObj = [obj, msg];
        pauseLoop = true;

        return true;
    }
    return false;
}
function sayMsg({x, y}, msg, ctx = gameCtx) {
    const padding = 4;
    const fontSize = 4;
    const lineHeight = fontSize + 2;

    ctx.save();

    ctx.font = `${fontSize}px monospace`;
    const textWidth = ctx.measureText(msg).width;

    const boxWidth = textWidth + padding * 2;
    const boxHeight = lineHeight + padding * 2;

    // Compute screen position
    const screenX = x * cellSize - camera.x;
    const screenY = y * cellSize - camera.y - boxHeight - 2; // Just above the tile

    // Draw message background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(screenX, screenY, boxWidth, boxHeight);

    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(screenX, screenY, boxWidth, boxHeight);

    // Draw text
    ctx.fillStyle = 'white';
    ctx.fillText(msg, screenX + padding, screenY + padding + fontSize);

    ctx.restore();
}


let updating = false;

function drawEditor(dt) {

    let is_hide_units_checked = is_hide_units.checked;
    let is_hide_layer_checked = is_hide_layer.checked;
    editorCtx.clearRect(0, 0, editorCanvas.width, editorCanvas.height);
    
    if(!updating){
        updating = true
        update(dt, editorCtx);
        updating = false

    }

    drawGrid(editorCtx);
    //console.log('drawGrid draw');
    if(!is_hide_layer_checked){
        drawLayer(editorCtx);
    }
    if(!is_hide_units_checked){
        drawUnits(editorCtx);
    }

    if(is_info.checked){
    drawDot(editorCtx, x1*cellSize, y1*cellSize);
    drawDot(editorCtx, x2*cellSize, y2*cellSize);
    }
    //console.log('drawUnits draw');
    // Preview selected tile under mouse
        let is_double_checked = is_double.checked;
            //const tile = gameMap[smouseY][smouseX];
        let cellS = is_double_checked ? cellSize *2 : cellSize;

      if (selectedTile) {
        editorCtx.drawImage(
          ufeffSprite,
          selectedTile.x * cellSize, selectedTile.y * cellSize, cellS, cellS,
          mouseX * cellSize, mouseY * cellSize, cellS, cellS
        );
      }

        spriteCtx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);

        spriteCtx.drawImage(ufeffSprite, 0, 0);
        spriteCtx.strokeStyle = 'red';
        spriteCtx.lineWidth = 2;
        spriteCtx.strokeRect( (smouseX * cellSize), (smouseY * cellSize), cellS, cellS);

    
    if(!gameLoopStarted && mode === "editor"){
        editorLoopStarted = true;
      //requestAnimationFrame(drawEditor);
      //  setTimeout(()=>{console.log('ok timeout to refresh'); drawEditor();}, 100);
    }
}
function drawGrid(ctx){
    // Draw terrain
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const tile = gameMap[y][x];

            if (tile) {
                
                const cellS = tile.size === 2 ? cellSize : cellSize;
                ctx.drawImage(
                  ufeffSprite,
                  tile.x * cellSize, tile.y * cellSize, cellS, cellS,
                  //x * cellSize- camera.x, y * cellSize- camera.y,
                  x * cellSize, y * cellSize,
                  cellS, cellS
                );
            }

            //ctx.strokeStyle = '#00000033';
            //ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if(showCoords || tile.o && is_info.checked){
                ctx.fillStyle = 'white';
                ctx.font = '2px monospace';
                ctx.fillText(`${x},${y}`, x * cellSize , y * cellSize+4);
            }
        }
    }

}
function drawGameGrid(ctx){
    // Draw terrain
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const tile = gameMap[y][x];

            if (tile) {
                
                const cellS = tile.size === 2 ? cellSize : cellSize;
                ctx.drawImage(
                  ufeffSprite,
                  tile.x * cellSize, tile.y * cellSize, cellS, cellS,
                  x * cellSize-camera.x, y * cellSize- camera.y,
                  //x * cellSize, y * cellSize,
                  cellS, cellS
                );
            }

            //ctx.strokeStyle = '#00000033';
            //ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            if(showCoords){
                ctx.fillStyle = 'red';
                ctx.font = '8px monospace';
                ctx.fillText(`${x},${y}`, x * cellSize + 2, y * cellSize + 12);
            }
        }
    }

}
let sayMsgObj = []
function drawGame(dt) {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    update(dt, gameCtx);

    let c = {};
    c.x = Math.round(currentPlayerObj.x) *cellSize  - gameCanvas.width  / (2*gameScale) + cellSize / 2;
    c.y = Math.round(currentPlayerObj.y) *cellSize  - gameCanvas.height / (2*gameScale) + cellSize / 2;
    let chomp = 10
    if(
        c.x > camera.x+chomp ||
        c.x < camera.x-chomp ||
        c.y < camera.y-chomp ||
        c.y > camera.y+chomp
    )
    camera = c

    //camera.x = 100;
    //camera.y = 100;
    //console.log(camera, currentPlayerObj,gameCanvas.width,gameCanvas.height )
    drawGameGrid(gameCtx);
    //console.log('drawGrid draw');
    //drawLayer(gameCtx);
    drawGameLayer(gameCtx);

    drawGameUnits(gameCtx);

    drawGameMenu(gameCtx);
    drawPlayerMenu(gameCtx);
    //console.log(sayMsgObj)
    if(sayMsgObj.length) sayMsg(sayMsgObj[0],sayMsgObj[1]);

    //gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    //drawGrid(gameCtx);
    //drawUnits(gameCtx);
    //if(selectedUnit) selectedStatus.innerHTML = printUnit(selectedUnit);
    //else selectedStatus.innerHTML = '';
    if( mode !== "editor"){
        //requestAnimationFrame(drawGame);
    }
}
function drawGameLayer(ctx){
    //check if currently drawing selected unit
    for(let i = 0; i < gameMapLayer.length; i++){
        let tile = gameMapLayer[i];

                const cellS = tile.size === 2 ? cellSize *2: cellSize;
        //console.log('draw unit',unit);
                ctx.drawImage(
                  ufeffSprite,
                  tile.spritex * cellSize, tile.spritey * cellSize, cellS, cellS,
                  tile.x * cellSize-camera.x, tile.y * cellSize-camera.y,
                  cellS, cellS
                );
    }
}
function drawLayer(ctx){
    //check if currently drawing selected unit
    for(let i = 0; i < gameMapLayer.length; i++){
        let tile = gameMapLayer[i];

                const cellS = tile.size === 2 ? cellSize *2: cellSize;
        //console.log('draw layer', tile);
                ctx.drawImage(
                  ufeffSprite,
                  tile.spritex * cellSize, tile.spritey * cellSize, cellS, cellS,
                  tile.x * cellSize, tile.y * cellSize,
                  cellS, cellS
                );
            if( showCoords || tile.o === true && !!is_info.checked){
                //console.log('draw layer', tile);
                ctx.fillStyle = 'white';
                ctx.font = '3px monospace';
                ctx.fillText(`${tile.x},${tile.y}`, tile.x * cellSize , tile.y * cellSize+4);

                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect( (tile.x * cellSize), (tile.y * cellSize), cellS, cellS);

            }
    }
}
function drawGameUnits(ctx){
    for(let i = 0; i < gameUnits.length; i++){
        let unit = gameUnits[i];
        drawSingleUnit(ctx, unit, camera);
    }
        drawSingleUnit(ctx, currentPlayerObj, camera);
}
function drawSingleUnit(ctx, unit, cam = {x:0,y:0}){
        const cellS = unit?.size === 2 ? cellSize *2: cellSize;
        if(!unit.is_player){
           // console.log('draw unit',unit,flipHorizontally);
            ctx.drawImage(
              ufeffSprite,
              unit.spritex * cellSize, unit.spritey * cellSize, cellS, cellS,
              unit.x * cellSize -cam.x, unit.y * cellSize -cam.y,
              cellS, cellS
            );
        }else if(flipHorizontally){
        //if(true){
            //console.log('draw flipped unit',unit, flipHorizontally);
            if(flippingTile){
            drawFlippedSprite(
              ctx,                  // canvas context
              ufeffSprite,          // your sprite image
              (unit.spritex + playerAnimationX +2) * cellSize, unit.spritey * cellSize, cellS, cellS,
                unit.x * cellSize -cam.x, unit.y * cellSize -cam.y,
                cellS, cellS,

              flipHorizontally,     // flip horizontally
              false                 // flip vertically
            );
            }else{
            drawFlippedSprite(
              ctx,                  // canvas context
              ufeffSprite,          // your sprite image
              (unit.spritex + playerAnimationX ) * cellSize, unit.spritey * cellSize, cellS, cellS,
                unit.x * cellSize -cam.x, unit.y * cellSize -cam.y,
                cellS, cellS,

              flipHorizontally,     // flip horizontally
              false                 // flip vertically
            );
            }

        }else if(flippingTile){
            ctx.drawImage(
              ufeffSprite,
              (unit.spritex + playerAnimationX +2) * cellSize, unit.spritey * cellSize, cellS, cellS,
              unit.x * cellSize -cam.x, unit.y * cellSize -cam.y,
              cellS, cellS
            );
        }else{
            ctx.drawImage(
              ufeffSprite,
              (unit.spritex + playerAnimationX ) * cellSize, unit.spritey * cellSize, cellS, cellS,
              unit.x * cellSize -cam.x, unit.y * cellSize -cam.y,
              cellS, cellS
            );
        }
}
function drawUnits(ctx){
    //check if currently drawing selected unit
    for(let i = 0; i < gameUnits.length; i++){
        let unit = gameUnits[i];

        drawSingleUnit(ctx, unit);
    }
        drawSingleUnit(ctx, currentPlayerObj);
    //debug frame by frame
    if (selectedUnit) {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect( (selectedUnit.x * cellSize), (selectedUnit.y * cellSize), cellSize-2, cellSize-2);
        ctx.strokeStyle = 'black';

    }

    if(is_info.checked){
        const cellS = currentPlayerObj?.size === 2 ? cellSize *2: cellSize;
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect( (currentPlayerObj.x * cellSize), (currentPlayerObj.y * cellSize), cellS, cellS);

        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;
        ctx.strokeRect( (currentPlayerObj.x * cellSize), (currentPlayerObj.y * cellSize), cellSize, cellSize);
        drawDot(ctx, currentPlayerObj.x * cellSize,currentPlayerObj.y * cellSize);
    }

    //noDraw = false;
}
function drawDot(ctx, x, y, radius = 3, color = 'red') {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}
function printPlayer(player){
    //return `Player ${currentPlayer}'s Turn, turnCount=${turnCount} \nMoney:${player.money} exp:${{player}.exp}`;
    let pre = "multi";
    if(playersCount === 1) pre = "single";
    return `${pre} P ${currentPlayer} t:${turnCount} m:${currentMapName}`;
}
function clearMap() {
    gameMap = createEmptyMap();
    gameUnits = [];
    map_name.value = '';
    //drawEditor();
}

function clearUnits(){

    gameUnits = [];
    //drawEditor();
}
function getUnitAt(x, y) {
    return gameUnits.find(unit => unit.x === x && unit.y === y);
}
function getLayerAt(x, y) {
    return gameMapLayer.find(unit => unit.x === x && unit.y === y);
}
function drawFlippedSprite(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh, flipH = false, flipV = false) {
  ctx.save();
  
  // Move the origin to where we want to draw
  ctx.translate(dx + (flipH ? dw : 0), dy + (flipV ? dh : 0));
  
  // Apply scaling
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  // Draw image
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);

  ctx.restore();
}
function saveMap() {

    if(input_map_name.value === ""){
        alert('fill in the name for the map to save it');
        return;
    }
    console.log(input_map_name.value, 'name of save');
    localStorage.setItem(input_map_name.value, JSON.stringify(packForSave()));
    const savedMapsStr = localStorage.getItem('savedMapsUfeff');
    let savedMaps = [];
    if(savedMapsStr) savedMaps = JSON.parse(savedMapsStr);
    if(savedMaps.indexOf(input_map_name.value) === -1){
        console.log('pushing hard',input_map_name.value);
        savedMaps.push(input_map_name.value)
    }

    localStorage.setItem('savedMapsUfeff', JSON.stringify(savedMaps));
    //alert('Map "'+input_map_name.value+'" saved! ');
    return;
}
function loadMapByName(name){
    console.log('loading map by name ',name);
    currentMapName = name;
    if(defaultMaps.indexOf(name) !== -1){
        fetch("maps/"+name+".json")
            .then(response => response.json())
            .then(saved => { 
                //console.log(saved) 
                //saved.units = fixData(saved.units);
                extractFromSave(saved)
                document.getElementById('status').textContent = printPlayer(currentPlayerObj);
                //drawGame();
                //showOverlay("Turn for Player "+currentPlayer);
            });
        return;
    }
    const loadMapStr = localStorage.getItem(name);
    if(loadMapStr){
        const loadMapObj = JSON.parse(loadMapStr);
        extractFromSave(loadMapObj);
        document.getElementById('status').textContent = printPlayer(currentPlayerObj);
        //alert(`loaded ${name}`)
        map_menu.innerHTML = "";
        //drawGame();
        //showOverlay("Turn for Player "+currentPlayer);
    }else{

        alert(`not found ${name}`)
    }

}
function drawGameMenu(ctx = gameCtx) {
    const size = cellSize;
    const sx = 24;
    const sy = 0;
    const x = 1, y=1;
    

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(x*size, y*size, size*2, size*2);
    // Draw gear icon
    ctx.drawImage(
        ufeffSprite,
        sx * size, sy * size, size*2, size*2,
        x*size, y*size, size * 2 , size * 2
    );
    // Draw border
    ctx.strokeStyle = 'white';
    if (isGameMenuOpen) {
        ctx.strokeStyle = 'green';
    }
    ctx.lineWidth = 1;
    ctx.strokeRect(x*size, y*size, size*2, size*2);

    // Expand menu if open
    if (isGameMenuOpen) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(x*size, y * size * gameScale, 80, gameMenuItems.length * 16);

        ctx.font = '10px monospace';
        gameMenuItems.forEach((item, i) => {
            //const itemY = y + size * gameScale + i * 16;
            ctx.fillStyle = (hoveredGameMenuItem === i) ? '#00ffff' : 'white';
            ctx.fillText(item, x + size + gameScale, y + size * gameScale + 10 + i * 16);
        });
    }
    drawDot(ctx,hoverx,hovery, 3)
}
let ix , iy;
function drawInventoryGrid(ctx){
    const size = cellSize;
    const scale = gameScale;
        const gridCols = 8;
        const gridRows = 4;
        const slotSize = size * scale + 1;
        const menuWidth = gridCols * slotSize;
        const menuHeight = gridRows * slotSize;
        const menuX = ix = size * 12 * scale - menuWidth - 10;
        const menuY = iy = size + size*2 ;

        // Draw background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

        //hoveredInventoryIndex = -1;

        // Draw inventory items
        for (let i = 0; i < gridCols*gridRows; i++) {
            const item = playerInventory[i];
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const itemX = menuX + col * slotSize;
            const itemY = menuY + row * slotSize;

                ctx.strokeStyle = 'white';
                ctx.strokeRect(itemX, itemY, slotSize, slotSize);
                drawDot(ctx, itemX,itemY,2,'blue');
            // Highlight if hovered
            if (hoveredInventoryIndex === i) {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 2;
                ctx.strokeRect(itemX, itemY, slotSize - 2, slotSize - 2);
            }

            if (item) {

                ctx.drawImage(
                    ufeffSprite,
                    item.spriteX * size, item.spriteY * size, size, size,
                    itemX + 2, itemY + 2, size * scale, size * scale
                );

                if (item.count > 1) {
                    ctx.fillStyle = 'white';
                    ctx.font = '10px monospace';
                    ctx.fillText(`${item.count}`, itemX + 2, itemY + slotSize - 4);
                }
            }

            // Store hover index (will be set by mousemove)
            if (
                mouseX >= itemX && mouseX <= itemX + slotSize &&
                mouseY >= itemY && mouseY <= itemY + slotSize
            ) {
                hoveredInventoryIndex = i;
            }
        }

        // Draw tooltip
        if (hoveredInventoryIndex !== -1) {
            //console.log(gameX,gameY)
            const item = playerInventory[hoveredInventoryIndex];
            if (item) {
                const tooltipX = gameX + 10;
                const tooltipY = gameY + 10;
                const text = item.name;
                const padding = 4;
                ctx.font = '10px monospace';
                const textWidth = ctx.measureText(text).width;

                ctx.fillStyle = 'black';
                ctx.fillRect(tooltipX, tooltipY, textWidth + padding * 2, 16);
                ctx.strokeStyle = 'white';
                ctx.strokeRect(tooltipX, tooltipY, textWidth + padding * 2, 16);
                ctx.fillStyle = 'white';
                ctx.fillText(text, tooltipX + padding, tooltipY + 12);
            }
        }
    drawDot(ctx, menuX,menuY,2,'yellow');
    drawDot(ctx, ix,iy,2,'purple');
}
function drawPlayerMenu(ctx = gameCtx) {
    const size = cellSize;
    const cx = gameCanvas.width/gameScale - size * 4;
    const cy = size;

    //console.log('gm',cx,cy, gameCanvas.width);
    const spriteX = currentPlayerObj?.spritex || 0;
    const spriteY = currentPlayerObj?.spritey || 0;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(cx, cy, size*2, size*2);
    // Draw player icon
    ctx.drawImage(
        ufeffSprite,
        spriteX * size, spriteY * size, size*2, size*2,
        cx, cy, size * 2, size * 2
    );
    // Draw border
    ctx.strokeStyle = 'white';
    if (isPlayerMenuOpen) {
        ctx.strokeStyle = 'green';
    }
    ctx.lineWidth = 1;
    ctx.strokeRect(cx, cy, size*2, size*2);

    if (isPlayerMenuOpen) {
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(cx - 50, cy + size*2, 140, 80);

        ctx.fillStyle = 'white';
        ctx.font = '4px monospace';
        let yOffset = cy + size * gameScale ;

        playerMenuItems.forEach(section => {
            ctx.fillText(section.label + ':', cx - 45, yOffset);
            yOffset += 12;

            section.items.forEach(item => {
                if (item.spriteX !== undefined) {
                    ctx.drawImage(
                        ufeffSprite,
                        item.spriteX * size, item.spriteY * size, size, size,
                        cx - 45, yOffset - 8, size * gameScale, size * gameScale
                    );
                    ctx.fillText(`${item.name} x${item.count}`, cx - 45 + 20, yOffset + 4);
                    yOffset += 20;
                } else {
                    ctx.fillText(`${item.name}: ${item.value}`, cx - 45, yOffset);
                    yOffset += 14;
                }
            });
            //////////////
        });
        drawInventoryGrid(ctx);
    }
}

//hover menu
let hoveredGameMenuItem = -1;
let hoveredPlayerMenuItem = -1;

let hoveredInventoryIndex = -1;

function handleUIMouseMove(e) {
    const rect = gameCanvas.getBoundingClientRect();
    const x = gameX = (e.clientX - rect.left)/gameScale;
    const y = gameY = (e.clientY - rect.top)/gameScale;

    hoveredGameMenuItem = -1;
    hoveredPlayerMenuItem = -1;
    hoveredInventoryIndex = -1;

    const size = cellSize;

    //hoverx = x
    //hovery = y;
    if (isGameMenuOpen) {

        const startY = size * gameScale;
        gameMenuItems.forEach((item, i) => {
            //const itemY = y + size * gameScale + i * 16;
            const itemY = startY + i * 16;
            if (
                x >= size && 
                x <= size+80 && 
                y >= itemY && 
                y <= itemY + 16
            ) {
                hoveredGameMenuItem = i;
            //console.log(x, " > " , size, x, "< ",size+80, y , ">",itemY, "<", itemY+16);

            }
            //console.log(x, " > " , size, x, "< ",size+80, y , ">",itemY, "<", itemY+16);
        });
    }

    if (isPlayerMenuOpen) {
        const size = cellSize;
        const scale = gameScale;
        const gridCols = 8;
        const gridRows = 4;
        const slotSize = size * scale + 1;
        const menuX = ix;
        const menuY = iy;
   
        for (let i = 0; i < gridCols*gridRows; i++) {
            //const item = playerInventory[i];
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const itemX = menuX + col * slotSize;
            const itemY = menuY + row * slotSize;
        //playerInventory.forEach((section, i) => {

            //console.log(startX,startY, x,y,i)
            if (
                x > itemX  && x < itemX + slotSize &&
                y > itemY  && y < itemY + slotSize
                //x >= startX + (size * gameScale *i) && x <= startX + (size *gameScale *(i+1)  )  &&
                //y >= startY + size * gameScale *i  && y <= startY + size *gameScale *(i +i)
            ) {
                hoveredInventoryIndex = i;
            //console.log('AAAAAAAAa',i, gameScale)
            //console.log('AAAAAAAAa',startX,startY, x,y,i)


            }
            //yOffset += 12 + section.items.length * 16;
        };
    }
}
let gameX,gameY;
function handleUIClickT(e){
    console.log(e);
    handleUIClick(e.touches[0])
}
function handleUIClick(e) {
    const rect = gameCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y =(e.clientY - rect.top);

    const size = cellSize * gameScale;

    // Game menu (top-left)
    if (x >= 1 && x <= size + (size *2) && y >= size && y <= size * 2 + size) {
        isGameMenuOpen = !isGameMenuOpen;
        isPlayerMenuOpen = false;
        return;
    }

    const cx = gameCanvas.width - size * 4;
    console.log(e, 'cx',cx,'x',x, y);
    // Player menu (top-right)
    if (
        x >= cx &&
        x <= cx+size*2 &&
        y >= size && y <= size*2+size
    ) {
        isPlayerMenuOpen = !isPlayerMenuOpen;
        isGameMenuOpen = false;
        return;
    }

    // Clicked inside game menu
    if (isGameMenuOpen && hoveredGameMenuItem !== -1) {
        const action = gameMenuItems[hoveredGameMenuItem];
        console.log(`Game Menu: ${action}`);

        if (action === 'Save') autosave();
        if (action === 'Load') loadAutosave();
        if (action === 'Edit') switchMode('editor');
        isGameMenuOpen = false;
        return;
    }

    // Clicked player menu
    if (isPlayerMenuOpen && hoveredPlayerMenuItem !== -1) {
        //const section = playerMenuItems[hoveredPlayerMenuItem];
        const item = playerInventory[hoveredPlayerMenuItem]
        console.log(`Player Menu: ${item.name}`);
        // You can expand to handle opening inventory views etc.
        return;
    }
    // Click outside closes menus
    isGameMenuOpen = false;
    isPlayerMenuOpen = false;
    ////////////


}

