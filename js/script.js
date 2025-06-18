import config from "./config.js";
import Game from "./Game.js";
import View from "./View.js";
window.config = config;
window.game = new Game();
window.view = new View();
//game.view = view;
console.log(game, view, config);

let ufeffSpriteLoaded = false;
let unitSpriteLoaded = true;//if later need more sprites
let craftSpriteLoaded = false;

/////////////////
const ufeffSprite = new Image();
ufeffSprite.src = "img/ufeff_tiles_v2.png"; // Your sprite sheet path
ufeffSprite.onload = function () {
    ufeffSpriteLoaded = true;
    start();
}
/////////
//const animeCanvas = document.getElementById('anime-canvas');
//const animeCtx = animeCanvas.getContext('2d');
const craftSprite = new Image();
craftSprite.src = "img/crafting_tables.png"; // Make sure this path is correct or serve it locally
craftSprite.onload = function () {
    craftSpriteLoaded = true;
    start();
};
function start(){
    if( ufeffSpriteLoaded && craftSpriteLoaded){
        view.ufeffSprite = ufeffSprite;
        view.craftSprite = craftSprite;
        goInit();
        theLoop();//starting the only one loop
    }
}

    /*
    setInterval(() => {
        if(!view.gameCtx) return;
        //view.gameCtx = view.gameCanvas.getContext('2d');
        console.log('anime', view)

    view.gameCtx.fillStyle = 'white';
        view.gameCtx.fillRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);
        //drawGame();

        const sx = (currentFrame * frameWidth);
        const sy = (rowIndex * frameHeight);

        view.gameCtx.drawImage(sprite, sx, sy, frameWidth, frameHeight, 0, 0, frameWidth/10, frameHeight/10);

        currentFrame = (currentFrame + 1) % totalFrames;
    }, animationSpeed);
    */
/////////
const documentKeyDown =  e => {
    console.log('KEY',e.code);
    let code = e.code;
    if (code === 'KeyS' && game.keys["ControlLeft"]) {
        autosave();
        return;
    }
    if(code === "KeyI"){
        game.isPlayerMenuOpen = !game.isPlayerMenuOpen;
        return;
    }
    if(code === "KeyM"){
        game.isGameMenuOpen = !game.isGameMenuOpen;
        return;
    }
    if(code === "KeyW") code = "ArrowUp";
    if(code === "KeyS") code = "ArrowDown";
    if(code === "KeyA") code = "ArrowLeft";
    if(code === "KeyD") code = "ArrowRight";
    game.keys[code] = true;
    if (
        code === 'ArrowLeft' ||
            code === 'ArrowRight' ||
            code === 'ArrowUp' ||
            code === 'ArrowDown'
    ) {
        game.pauseLoop = false;
        if(game.sayMsgObj.length)
            game.sayMsgObj = [];
        game.playerMoving = true;
        //if(view.editorCanvas.focus)
        e.preventDefault();
    }
    if (code === 'KeyR') {
    }else{
        //e.preventDefault();
    }
    //drawEditor();
};
const documentKeyUp =  e => {
    let code = e.code;
    if(code === "KeyW") code = "ArrowUp";
    if(code === "KeyS") code = "ArrowDown";
    if(code === "KeyA") code = "ArrowLeft";
    if(code === "KeyD") code = "ArrowRight";
    game.keys[code] = false;

    game.pauseLoop = false;
    //sayMsgObj = []; //if uncommented hides msg 
    game.playerMoving = false;
    //drawEditor();
};
function goInit(){
    if(ufeffSpriteLoaded && unitSpriteLoaded){
        console.log('goInit');
        view.gameCanvas.addEventListener('touchstart', handleTouchStart);
        view.gameCanvas.addEventListener('touchend', handleTouchEnd);

        view.gameCanvas.addEventListener('click', handleUIClick);//in game menu and profile
        view.gameCanvas.addEventListener('touchstart', handleUIClickT);//in game menu and profile
        view.gameCanvas.addEventListener('mousemove', handleUIMouseMove);
        //view.gameCanvas.addEventListener('click', handleUIClick);

        document.addEventListener('keydown',documentKeyDown);
        document.addEventListener('keyup',documentKeyUp);

        view.spriteCtx.drawImage(ufeffSprite, 0, 0);
        // --- Sprite selection ---
        view.spriteCanvas.addEventListener('click', (e) => {
            let is_double_checked = view.is_double.checked;

            const size = is_double_checked ? 2 : 1;
            const rect = view.spriteCanvas.getBoundingClientRect();
            const sx = Math.floor((e.clientX - rect.left) / game.cellSize/game.gameScale*2)/2;
            const sy = Math.floor((e.clientY - rect.top) / game.cellSize/game.gameScale*2)/2;
            console.log('selected tile',sx,sy)
            game.selectedTile = { x:sx, y:sy, size };
        });
        // --- Track mouse for preview ---
        view.craftCanvas.addEventListener('mousemove', (e) => {
            const rect = view.spriteCanvas.getBoundingClientRect();
            game.cmouseX = Math.floor((e.clientX - rect.left) / game.cellSize/game.gameScale*2)/2;
            game.cmouseY = Math.floor((e.clientY - rect.top) / game.cellSize/game.gameScale*2)/2;
        });
        view.craftCanvas.addEventListener('click', handleCraftClick);
        // --- Track mouse for preview ---
        view.spriteCanvas.addEventListener('mousemove', (e) => {
            const rect = view.spriteCanvas.getBoundingClientRect();
            game.smouseX = Math.floor((e.clientX - rect.left) / game.cellSize/game.gameScale*2)/2;
            game.smouseY = Math.floor((e.clientY - rect.top) / game.cellSize/game.gameScale*2)/2;
        });
        // --- Track mouse for preview ---
        view.editorCanvas.addEventListener('mousemove', (e) => {
            const rect = view.editorCanvas.getBoundingClientRect();
            game.mouseX = Math.floor((e.clientX - rect.left) / game.cellSize /game.gameScale)// *2)/2;
            game.mouseY = Math.floor((e.clientY - rect.top) / game.cellSize /game.gameScale)// *2)/2;
        });
        // --- Place tile on map ---
        view.editorCanvas.addEventListener('click', () => {
            let is_unit_checked = is_unit.checked;
            let is_layer_checked = is_layer.checked;
            let is_clear_checked = is_clear.checked;
            let is_player_checked = is_player.checked;
            let is_obsticle_checked = is_obsticle.checked;
            let is_info_checked = is_info.checked;
            let selected_id_txt = '';
            //console.log('is_unit_checked is_layer_checked',is_unit_checked, is_layer_checked);

            selected_id_txt += ` At ${game.mouseX} ${game.mouseY} `;


            if(is_clear_checked){
                selected_id_txt += " cleared";
                if(is_unit_checked){
                    selected_id_txt += " unit";
                    const unit = game.getUnitAt(game.mouseX,game.mouseY);
                    if(unit){
                        game.gameUnits = game.gameUnits.filter(unit => Math.floor(unit.x) !== game.mouseX || Math.floor(unit.y) !== game.mouseY);
                        console.log('cleaned unit', Math.floor(unit.x),game.mouseX,Math.floor(unit.y),game.mouseY,game.gameUnits)

                        selected_json.innerHTML = JSON.stringify(unit)
                    }

                }else if(is_layer_checked){
                    selected_id_txt += " layer";
                    const unit = game.getLayerAt(game.mouseX,game.mouseY);
                    if(unit){
                        game.gameMapLayer = game.gameMapLayer.filter(unit => unit.x !== game.mouseX || unit.y !== game.mouseY);
                        console.log('cleaned layer', Math.floor(unit.x),game.mouseX,Math.floor(unit.y),game.mouseY,game.gameUnits)
                        selected_json.innerHTML = JSON.stringify(unit)
                    }

                }else{
                    game.gameMap[game.mouseY][game.mouseX] = {x:game.initTile.x,y:game.initTile.y};
                }

            }else if(is_unit_checked ){
                //
                if (game.selectedTile) {
                    game.gameUnits = game.gameUnits.filter(unit => unit.x !== game.mouseX || unit.y !== game.mouseY);
                    console.log(game.gameUnits);
                    //let clone = Object.assign({}, userDetails)
                    let unitObj = {}//Object.assign({}, unitsBlueprint[unitType]);
                    unitObj.x = game.mouseX;
                    unitObj.y = game.mouseY;
                    unitObj.spritex = game.selectedTile.x;
                    unitObj.spritey = game.selectedTile.y;
                    unitObj.size = game.selectedTile.size;
                    unitObj.o = is_obsticle_checked;
                    unitObj.p = its_purpose.value;

                    if(is_player_checked){
                        unitObj.is_player = 1;
                        //unitObj.game.currentPlayerID = game.gameUnits.length;
                        game.currentPlayerObj = unitObj; 
                        game.gameUnits = game.gameUnits.filter(unit.player !== true);
                    }else{
                        //unitObj.player = player;
                        game.gameUnits.push(unitObj);
                    }
                    console.log('unit added',unitObj,game.gameUnits);
                    selected_id_txt += " unit added ";
                    selected_json.innerHTML = JSON.stringify(unitObj)
                }else{
                    const unit = game.getUnitAt(game.mouseX,game.mouseY);
                    selected_id_txt += " unit selected ";
                    selected_json.innerHTML = JSON.stringify(unit)
                }
            }else if(is_layer_checked){
                if (game.selectedTile) {
                    game.gameMapLayer = game.gameMapLayer.filter(unit => unit.x !== game.mouseX || unit.y !== game.mouseY);
                    let layerObj = {  };
                    layerObj.x = game.mouseX;
                    layerObj.y = game.mouseY;
                    layerObj.o = is_obsticle_checked;
                    layerObj.p = its_purpose.value;
                    layerObj.spritex = game.selectedTile.x;
                    layerObj.spritey = game.selectedTile.y;
                    layerObj.size = game.selectedTile.size;
                    game.gameMapLayer.push(layerObj);
                    console.log('layer added',layerObj,game.gameMapLayer);
                    selected_id_txt += " layer added ";
                    selected_json.innerHTML = JSON.stringify(layerObj)
                }else{
                    const unit = game.getLayerAt(game.mouseX,game.mouseY);
                    selected_id_txt += " layer selected ";
                    selected_json.innerHTML = JSON.stringify(unit)
                }
            }else{
                if (game.selectedTile) {
                    console.log('add bg tile',game.selectedTile);
                    let obsticle = false;
                    if(is_obsticle_checked){
                        obsticle = true;
                    }
                    game.gameMap[game.mouseY][game.mouseX] = { ...game.selectedTile };
                    game.gameMap[game.mouseY][game.mouseX].o = obsticle
                    game.gameMap[game.mouseY][game.mouseX].p = its_purpose.value;
                    if(game.selectedTile.size === 2){
                        game.gameMap[game.mouseY+1][game.mouseX] = { x:game.selectedTile.x, y:game.selectedTile.y+1, o: obsticle };
                        game.gameMap[game.mouseY][game.mouseX+1] = { x:game.selectedTile.x+1, y:game.selectedTile.y, o: obsticle };
                        game.gameMap[game.mouseY+1][game.mouseX+1] = { x:game.selectedTile.x+1, y:game.selectedTile.y+1, o: obsticle };
                    }
                    selected_id_txt += " tile added ";
                    selected_json.innerHTML = JSON.stringify(game.selectedTile)
                }else{
                    selected_id_txt += " tile selected ";
                    if(game.gameMap[game.mouseY])
                        selected_json.innerHTML = JSON.stringify(game.gameMap[game.mouseY][game.mouseX])
                        else
                        selected_json.innerHTML = '';
                }
            }
            if(is_info_checked){
                console.log(`x:${game.mouseX} y:${game.mouseY} `+'map',game.gameMap[game.mouseY][game.mouseX],'layers',game.getLayerAt(game.mouseX,game.mouseY),'units',game.getUnitAt(game.mouseX,game.mouseY))
            }
            selected_id.innerHTML = selected_id_txt
            autosave();
        });

        spriteCanvas.width *=game.gameScale;
        spriteCanvas.height *=game.gameScale;
        view.spriteCtx.scale(game.gameScale, game.gameScale)

        view.gameCanvas.width =window.innerWidth-50;// game.gridSize * game.cellSize;
        view.gameCanvas.height =window.innerHeight-200;// game.gridSize * game.cellSize;
        view.gameCtx = view.gameCanvas.getContext('2d');
        view.gameCtx.scale(game.gameScale, game.gameScale)

        view.editorCanvas.width = game.gridSize * game.cellSize *game.gameScale;
        //view.editorCanvas.width = game.gridSize * game.cellSize ;
        view.editorCanvas.height = game.gridSize * game.cellSize *game.gameScale;
        //view.editorCanvas.height = game.gridSize * game.cellSize ;
        view.editorCtx = view.editorCanvas.getContext('2d');
        //view.gameCtx.strokeStyle = 'black';
        view.editorCtx.scale(game.gameScale, game.gameScale)
        game.clearMap();

        //if(loadAutosave()){
        //  console.log('loaded autosave');
        //}

        //game.switchMode('editor');
        game.switchMode('load');
        //game.switchMode('game_nice');
        //defaultLoad();
        // Initialize
        //switchMode('gamesingle');
    }
}
let currentTouchDirection = null;

function handleTouchStart(e) {
    e.preventDefault();
    game.pauseLoop = false;
    const touch = e.touches[0];
    const rect = view.gameCanvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const width = view.gameCanvas.width;
    const height = view.gameCanvas.height;

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
            game.keys['ArrowLeft'] = true;
            currentTouchDirection = 'ArrowLeft';
        } else {
            game.keys['ArrowRight'] = true;
            currentTouchDirection = 'ArrowRight';
        }
    } else {
        if (dy < 0) {
            game.keys['ArrowUp'] = true;
            currentTouchDirection = 'ArrowUp';
        } else {
            game.keys['ArrowDown'] = true;
            currentTouchDirection = 'ArrowDown';
        }
    }

    game.pauseLoop = false;
    sayMsgObj = [];
    game.playerMoving = true;
}

function handleTouchEnd(e) {
    if (currentTouchDirection) {
        game.keys[currentTouchDirection] = false;
        game.playerMoving = false;
        currentTouchDirection = null;
    }
}

function clearTouchKeys() {
    game.keys['ArrowLeft'] = false;
    game.keys['ArrowRight'] = false;
    game.keys['ArrowUp'] = false;
    game.keys['ArrowDown'] = false;
}



function defaultLoad(){
    if(loadAutosave()){
        console.log('autoseave?');
        if(!game.gameLoopStarted)
            view.drawGame();
        //showOv:rlay("Turn for Player "+game.currentPlayer);
        //document.getElementById('status').textContent = printPlayer(game.currentPlayerObj);
        return;
    }
    alert('autosave not found, please load a map');
    game.loadMap();
}
function loadAutosave(){
    const loaded = localStorage.getItem('autosaveUfeff');
    if(loaded){
        const autosave = JSON.parse(loaded);
        //autosave.units = fixData(autosave.units);
        game.extractFromSave(autosave);
        return true;
    }
    return false;
}

function autosave(){
    localStorage.setItem('autosaveUfeff', JSON.stringify(game.forSave()));
    console.log('autosaved');
}
window.toggleMenu = () => {
    if(menu.style.display === 'none')
        menu.style.display = 'inline-block';
        else
        menu.style.display = 'none';
}
window.toggleControls = () => {
    if(editormenu.style.display === 'none')
        editormenu.style.display = 'inline-block';
        else
        editormenu.style.display = 'none';
}
window.toggleSprites = () => {
    if(spriteCanvas.style.display === 'none')
        spriteCanvas.style.display = 'inline-block';
        else
        spriteCanvas.style.display = 'none';
}

function theLoop(dt){
    //console.log('looping', game.doLoop, dt)
    if(!game.pauseLoop){

        game.dt = dt;
        game.doLoop(dt);
    }
        requestAnimationFrame(theLoop)
}






function handleUIMouseMove(e) {
    const rect = view.gameCanvas.getBoundingClientRect();
    const x = game.gameX = (e.clientX - rect.left)/game.gameScale;
    const y = game.gameY = (e.clientY - rect.top)/game.gameScale;

    game.hoveredGameMenuItem = -1;
    game.hoveredPlayerMenuItem = -1;
    game.hoveredInventoryIndex = -1;

    const size = game.cellSize;

    //game.hoverx = x
    //game.hovery = y;
    if (game.isGameMenuOpen) {

        const startY = size * game.gameScale;
        game.gameMenuItems.forEach((item, i) => {
            //const itemY = y + size * game.gameScale + i * 16;
            const itemY = startY + i * 16;
            if (
                x >= size && 
                    x <= size+80 && 
                    y >= itemY && 
                    y <= itemY + 16
            ) {
                game.hoveredGameMenuItem = i;
                //console.log(x, " > " , size, x, "< ",size+80, y , ">",itemY, "<", itemY+16);

            }
            //console.log(x, " > " , size, x, "< ",size+80, y , ">",itemY, "<", itemY+16);
        });
    }

    if (game.isPlayerMenuOpen) {
        const size = game.cellSize;
        const scale = game.gameScale;
        const gridCols = 8;
        const gridRows = 4;
        const slotSize = size * scale + 1;
        const menuX = game.ix;
        const menuY = game.iy;

        for (let i = 0; i < gridCols*gridRows; i++) {
            //const item = game.playerInventory[i];
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const itemX = menuX + col * slotSize;
            const itemY = menuY + row * slotSize;
            //game.playerInventory.forEach((section, i) => {

            //console.log(startX,startY, x,y,i)
            if (
                x > itemX  && x < itemX + slotSize &&
                    y > itemY  && y < itemY + slotSize
                //x >= startX + (size * game.gameScale *i) && x <= startX + (size *game.gameScale *(i+1)  )  &&
                //y >= startY + size * game.gameScale *i  && y <= startY + size *game.gameScale *(i +i)
            ) {
                game.hoveredInventoryIndex = i;
                //console.log('AAAAAAAAa',i, game.gameScale)
                //console.log('AAAAAAAAa',startX,startY, x,y,i)


            }
            //yOffset += 12 + section.items.length * 16;
        };
    }
}
function handleUIClickT(e){
    console.log(e);
    handleUIClick(e.touches[0])
}
function handleUIClick(e) {
    const rect = view.gameCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y =(e.clientY - rect.top);

    const size = game.cellSize * game.gameScale;

    // Game menu (top-left)
    if (x >= 1 && x <= size + (size *2) && y >= size && y <= size * 2 + size) {
        game.isGameMenuOpen = !game.isGameMenuOpen;
        game.isPlayerMenuOpen = false;
        return;
    }

    const cx = view.gameCanvas.width - size * 4;
    console.log(e, 'cx',cx,'x',x, y);
    // Player menu (top-right)
    if (
        x >= cx &&
            x <= cx+size*2 &&
            y >= size && y <= size*2+size
    ) {
        game.isPlayerMenuOpen = !game.isPlayerMenuOpen;
        game.isGameMenuOpen = false;
        return;
    }

    // Clicked inside game menu
    if (game.isGameMenuOpen && game.hoveredGameMenuItem !== -1) {
        const action = game.gameMenuItems[game.hoveredGameMenuItem];
        console.log(`Game Menu: ${action}`);

        if (action === 'Save') autosave();
        if (action === 'Load') loadAutosave();
        if (action === 'Edit') game.switchMode('editor');
        if (action === 'zoom 1') game.gameScale = 1;
        if (action === 'zoom 2') game.gameScale = 2;
        if (action === 'zoom 3') game.gameScale = 3;
        game.isGameMenuOpen = false;
        return;
    }

    // Clicked player menu
    if (game.isPlayerMenuOpen && game.hoveredPlayerMenuItem !== -1) {
        //const section = game.playerMenuItems[hoveredPlayerMenuItem];
        const item = game.playerInventory[game.hoveredPlayerMenuItem]
        console.log(`Player Menu: ${item.name}`);
        // You can expand to handle opening inventory views etc.
        return;
    }
    // Click outside closes menus
    game.isGameMenuOpen = false;
    game.isPlayerMenuOpen = false;
    ////////////


}

////////////////////////////////

view.gameCanvas.addEventListener('click', e => {
    const rect = view.gameCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left)/ game.gameScale ;
    const y = (e.clientY - rect.top)/ game.gameScale ;

    console.log(x,y, game.charAreas)
    if (game.mode === 'load') {
        game.btnAreas.forEach(btn => {
            if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
                if (btn.action === 'continue') {
                    if (loadAutosave()) {
                        game.switchMode('game')
                        //drawGame();
                    }
                } else if (btn.action === 'loadmap') {
                    game.loadMap();
                } else if (btn.action === 'newgame') {
                    game.switchMode('charSelect')
                    //drawCharacterSelectScreen();
                }
            }
        });
    } else if (game.mode === 'charSelect') {
        game.charAreas.forEach(area => {
            if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) {
                game.selectedCharacterIndex = area.index;
                game.startNewGameWithCharacter(game.characters[area.index]);
            }
        });
    }
});
//////////////////////
//canvas input
/////////
window.canvasInput = {
    x: 50,
    y: 150,
    w: 200,
    h: 30,
    text: '',
    active: false,
    blink: true,
    blinkTimer: 0,
    blinkInterval: 1000,
};
let charmouseX
let charmouseY
document.addEventListener('click', (e) => {
    const rect = view.gameCanvas.getBoundingClientRect();
    charmouseX = (e.clientX - rect.left)/game.gameScale;
    charmouseY = (e.clientY - rect.top)/game.gameScale;

    if (
        charmouseX >= canvasInput.x && charmouseX <= canvasInput.x + canvasInput.w &&
        charmouseY >= canvasInput.y && charmouseY <= canvasInput.y + canvasInput.h
    ) {
        canvasInput.active = true;
    } else {
        canvasInput.active = false;
    }
});

document.addEventListener('keydown', (e) => {
    if (!canvasInput.active) return;

    if (e.key === 'Backspace') {
        canvasInput.text = canvasInput.text.slice(0, -1);
    } else if (e.key.length === 1) {
        canvasInput.text += e.key;
    }
console.log('active',canvasInput.text)
    //game.currentPlayerObj.name = canvasInput.text
});

window.drawCanvasInput = (ctx, dt) => {
    ctx.strokeStyle = canvasInput.active ? 'yellow' : 'gray';
    ctx.lineWidth = 2;
    ctx.strokeRect(canvasInput.x, canvasInput.y, canvasInput.w, canvasInput.h);

    ctx.font = '16px monospace';
    ctx.fillStyle = 'white';
    ctx.fillText(canvasInput.text, canvasInput.x + 5, canvasInput.y + 20);

    // Blink cursor
    canvasInput.blinkTimer += dt;
    if (canvasInput.blinkTimer > canvasInput.blinkInterval) {
        canvasInput.blink = !canvasInput.blink;
        canvasInput.blinkTimer = 0;
    }

    if (canvasInput.active && canvasInput.blink) {
        const textWidth = ctx.measureText(canvasInput.text).width;
        ctx.beginPath();
        ctx.moveTo(canvasInput.x + 5 + textWidth, canvasInput.y + 5);
        ctx.lineTo(canvasInput.x + 5 + textWidth, canvasInput.y + 25);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }
    console.log(charmouseX,charmouseY)
        view.drawDot(ctx, charmouseX,charmouseY,2,'purple');
}
function handleCraftClick(e){

    const rect = view.craftCanvas.getBoundingClientRect();
    const x = (e.clientX - rect.left)/ 10 ;
    const y = (e.clientY - rect.top)/ 10 ;
    console.log(x,y,e);
}
