export default class View{
    gameCanvas = document.getElementById('game-canvas');
    gameCtx;
    editorCanvas = document.getElementById('editor-canvas');
    editorCtx;
    spriteCanvas = document.getElementById('spriteCanvas');
    spriteCtx = spriteCanvas.getContext('2d');
    craftCanvas = document.getElementById('craftCanvas');
    craftCtx = craftCanvas.getContext('2d');
    is_unit = document.getElementById('is_unit');
    is_layer = document.getElementById('is_layer');
    is_clear = document.getElementById('is_clear');
    is_double = document.getElementById('is_double');
    is_player = document.getElementById('is_player');
    is_obsticle = document.getElementById('is_obsticle');
    is_info = document.getElementById('is_info');
    is_hide_units = document.getElementById('is_hide_units');
    is_hide_layer = document.getElementById('is_hide_layer');
    selected_json = document.getElementById('selected_json');
    selected_id = document.getElementById('selected_id');
    its_purpose = document.getElementById('its_purpose');
    input_map_name = document.querySelector('#map_name');
    map_menu = document.querySelector('#map_menu');
    menu = document.getElementById('menu');
    editormenu = document.getElementById('editor-controls');

    ufeffSprite;
    craftSprite;

    //craft Sprite settings
    frameWidth = 200;
    frameHeight = 250;
    framesPerRow = 3; // You can count the number of frames in a row
    framesPerCol = 3;
    frameScale = 0.2;
    rowIndex = 2; // For example: 8th row (choose based on which character to animate)
    totalFrames = 3

    currentFrame = 0;
    animationSpeed = 200; // milliseconds between frames
    old_dt = 0;

    constructor(){
        console.log(' View constructed');
    }
    drawEditor(dt) {

        if(!dt) dt = game.dt;
        let is_hide_units_checked = is_hide_units.checked;
        let is_hide_layer_checked = is_hide_layer.checked;
        view.editorCtx.clearRect(0, 0, view.editorCanvas.width, view.editorCanvas.height);

        if(!game.updating){
            game.updating = true
            game.update(dt, view.editorCtx);
            game.updating = false

        }

        this.drawGrid(view.editorCtx);
        //console.log('drawGrid draw');
        if(!is_hide_layer_checked){
            this.drawLayer(view.editorCtx);
        }
        if(!is_hide_units_checked){
            this.drawUnits(view.editorCtx);
        }

        if(is_info.checked){
            this.drawDot(view.editorCtx, game.x1*game.cellSize, game.y1*game.cellSize);
            this.drawDot(view.editorCtx, game.x2*game.cellSize, game.y2*game.cellSize);
        }
        //console.log('drawUnits draw');
        // Preview selected tile under mouse
        let is_double_checked = is_double.checked;
        //const tile = game.gameMap[game.sgame.mouseY][game.sgame.mouseX];
        let cellS = is_double_checked ? game.cellSize *2 : game.cellSize;

        if (game.selectedTile) {
            view.editorCtx.drawImage(
                this.ufeffSprite,
                game.selectedTile.x * game.cellSize, game.selectedTile.y * game.cellSize, cellS, cellS,
                game.mouseX * game.cellSize, game.mouseY * game.cellSize, cellS, cellS
            );
        }
        if(
            game.frameSelected
        ){
            console.log('oooo',game.mouseX, game.mouseY, game.frameSelected);
            view.editorCtx.drawImage(
                view.craftSprite,
                0,0, game.frameWidth, game.frameHeight,
                //game.frameSelected.x * game.frameWidth * game.totalFrames, game.frameSelected.y * game.frameHeight, game.frameWidth, game.frameHeight,
                //game.mouseX * game.cellSize, game.mouseY * game.cellSize, cellS*2, cellS*2
                0, 0 ,game.frameWidth, game.frameHeight
            );
        }

        view.spriteCtx.clearRect(0, 0, spriteCanvas.width, spriteCanvas.height);
        view.spriteCtx.drawImage(this.ufeffSprite, 0, 0);
        view.spriteCtx.strokeStyle = 'red';
        view.spriteCtx.lineWidth = 2;
        view.spriteCtx.strokeRect( (game.smouseX * game.cellSize), (game.smouseY * game.cellSize), cellS, cellS);


            const w = this.frameWidth*view.frameScale // view.framesPerRow;//200/12
            const h = this.frameHeight*view.frameScale // view.framesPerCol;//250/12

            const dx = (game.cmouseX)* w /2.5
            const dy = (game.cmouseY-25)*w/2.5
        console.log(w,h,dx,dy)
        view.craftCtx.clearRect(0, 0, craftCanvas.width, craftCanvas.height);
        //view.craftCtx.drawImage(this.craftSprite, 0, 0);
        view.craftCtx.strokeStyle = 'red';
        view.craftCtx.lineWidth = 2;
        view.craftCtx.strokeRect( dx, dy, w, h);
        view.drawAnimationEdit(dt);

        if(!game.gameLoopStarted && game.mode === "editor"){
            game.editorLoopStarted = true;
            //requestAnimationFrame(drawEditor);
            //  setTimeout(()=>{console.log('ok timeout to refresh'); drawEditor();}, 100);
        }
    }

    drawGame(dt) {
        //console.log('draw game dt',dt, game.dt);
        if(!dt) dt = game.dt;
        view.gameCtx.clearRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);
        game.update(dt, view.gameCtx);

        let c = {};
        c.x = Math.round(game.currentPlayerObj.x) *game.cellSize  - view.gameCanvas.width  / (2*game.gameScale) + game.cellSize / 2;
        c.y = Math.round(game.currentPlayerObj.y) *game.cellSize  - view.gameCanvas.height / (2*game.gameScale) + game.cellSize / 2;
        let chomp = 10
        if(
            c.x > game.camera.x+chomp ||
                c.x < game.camera.x-chomp ||
                c.y < game.camera.y-chomp ||
                c.y > game.camera.y+chomp
        )
            game.camera = c

        //game.camera.x = 100;
        //game.camera.y = 100;
        //console.log(game.camera, game.currentPlayerObj,view.gameCanvas.width,view.gameCanvas.height )
        this.drawGameGrid(this.gameCtx);
        //console.log('drawGrid draw');
        //drawLayer(view.gameCtx);
        this.drawGameLayer(this.gameCtx);

        this.drawGameUnits(this.gameCtx);

        this.drawGameMenu(this.gameCtx);
        this.drawPlayerMenu(this.gameCtx);
        //console.log(game.sayMsgObj, 'in view')
        if(game.sayMsgObj.length) this.sayMsg(game.sayMsgObj[0],game.sayMsgObj[1]);
        this.drawAnimation(this.gameCtx, dt)
        //view.gameCtx.clearRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);
        //drawGrid(view.gameCtx);
        //drawUnits(view.gameCtx);
        //if(game.selectedUnit) selectedStatus.innerHTML = printUnit(game.selectedUnit);
        //else selectedStatus.innerHTML = '';
        if( game.mode !== "editor"){
            //requestAnimationFrame(drawGame);
        }
    }
    drawLoadScreen(dt) {
        const ctx = view.gameCtx
        //console.log('drawLoadScreen');
        ctx.clearRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText('My RPG Game', 50, 60);

        const buttons = [
            { label: 'Continue', action: 'continue' },
            { label: 'Load Map', action: 'loadmap' },
            { label: 'New Game', action: 'newgame' },
        ];

        let localBtnAreas = [];
        buttons.forEach((btn, i) => {
            const x = 50;
            const y = 100 + i * 20;
            const w = 200;
            const h = 20;
            ctx.fillStyle = '#333';
            ctx.fillRect(x, y, w, h);
            ctx.strokeStyle = 'white';
            ctx.strokeRect(x, y, w, h);
            ctx.fillStyle = 'white';
            ctx.fillText(btn.label, x + 4, y + 14);
            localBtnAreas.push({ x, y, w, h, action: btn.action });
        });
        if (!game.btnAreas.length) game.btnAreas = localBtnAreas;
    }
    drawGameGrid(ctx){
        // Draw terrain
        for (let y = 0; y < game.gridSize; y++) {
            for (let x = 0; x < game.gridSize; x++) {
                const tile = game.gameMap[y][x];

                if (tile) {

                    const cellS = tile.size === 2 ? game.cellSize : game.cellSize;
                    ctx.drawImage(
                        this.ufeffSprite,
                        tile.x * game.cellSize, tile.y * game.cellSize, cellS, cellS,
                        x * game.cellSize-game.camera.x, y * game.cellSize- game.camera.y,
                        //x * game.cellSize, y * game.cellSize,
                        cellS, cellS
                    );
                }

                //ctx.strokeStyle = '#00000033';
                //ctx.strokeRect(x * game.cellSize, y * game.cellSize, game.cellSize, game.cellSize);

                if(game.showCoords){
                    ctx.fillStyle = 'red';
                    ctx.font = '8px monospace';
                    ctx.fillText(`${x},${y}`, x * game.cellSize + 2, y * game.cellSize + 12);
                }
            }
        }

    }
    drawGameLayer(ctx){
        //check if currently drawing selected unit
        for(let i = 0; i < game.gameMapLayer.length; i++){
            let tile = game.gameMapLayer[i];

            const cellS = tile.size === 2 ? game.cellSize *2: game.cellSize;
            //console.log('draw unit',unit);
            ctx.drawImage(
                this.ufeffSprite,
                tile.spritex * game.cellSize, tile.spritey * game.cellSize, cellS, cellS,
                tile.x * game.cellSize-game.camera.x, tile.y * game.cellSize-game.camera.y,
                cellS, cellS
            );
        }
    }
    drawGameUnits(ctx){
        for(let i = 0; i < game.gameUnits.length; i++){
            let unit = game.gameUnits[i];
            this.drawSingleUnit(ctx, unit, game.camera);
        }
        this.drawSingleUnit(ctx, game.currentPlayerObj, game.camera);
    }
    drawSingleUnit(ctx, unit, cam = {x:0,y:0}){
        const cellS = unit?.size === 2 ? game.cellSize *2: game.cellSize;
        if(!unit.is_player){
            // console.log('draw unit',unit,flipHorizontally);
            ctx.drawImage(
                this.ufeffSprite,
                unit.spritex * game.cellSize, unit.spritey * game.cellSize, cellS, cellS,
                unit.x * game.cellSize -cam.x, unit.y * game.cellSize -cam.y,
                cellS, cellS
            );
        }else if(game.flipHorizontally){
            //if(true){
            //console.log('draw flipped unit',unit, flipHorizontally);
            if(game.flippingTile){
                this.drawFlippedSprite(
                    ctx,                  // canvas context
                    this.ufeffSprite,          // your sprite image
                    (unit.spritex + game.playerAnimationX +2) * game.cellSize, unit.spritey * game.cellSize, cellS, cellS,
                    unit.x * game.cellSize -cam.x, unit.y * game.cellSize -cam.y,
                    cellS, cellS,

                    game.flipHorizontally,     // flip horizontally
                    false                 // flip vertically
                );
            }else{
                this.drawFlippedSprite(
                    ctx,                  // canvas context
                    this.ufeffSprite,          // your sprite image
                    (unit.spritex + game.playerAnimationX ) * game.cellSize, unit.spritey * game.cellSize, cellS, cellS,
                    unit.x * game.cellSize -cam.x, unit.y * game.cellSize -cam.y,
                    cellS, cellS,

                    game.flipHorizontally,     // flip horizontally
                    false                 // flip vertically
                );
            }

        }else if(game.flippingTile){
            ctx.drawImage(
                this.ufeffSprite,
                (unit.spritex + game.playerAnimationX +2) * game.cellSize, unit.spritey * game.cellSize, cellS, cellS,
                unit.x * game.cellSize -cam.x, unit.y * game.cellSize -cam.y,
                cellS, cellS
            );
        }else{
            ctx.drawImage(
                this.ufeffSprite,
                (unit.spritex + game.playerAnimationX ) * game.cellSize, unit.spritey * game.cellSize, cellS, cellS,
                unit.x * game.cellSize -cam.x, unit.y * game.cellSize -cam.y,
                cellS, cellS
            );
        }
    }
    drawGameMenu(ctx = view.gameCtx) {
        const size = game.cellSize;
        const sx = 24;
        const sy = 0;
        const x = 1, y=1;


        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(x*size, y*size, size*2, size*2);
        // Draw gear icon
        ctx.drawImage(
            this.ufeffSprite,
            sx * size, sy * size, size*2, size*2,
            x*size, y*size, size * 2 , size * 2
        );
        // Draw border
        ctx.strokeStyle = 'white';
        if (game.isGameMenuOpen) {
            ctx.strokeStyle = 'green';
        }
        ctx.lineWidth = 1;
        ctx.strokeRect(x*size, y*size, size*2, size*2);

        // Expand menu if open
        if (game.isGameMenuOpen) {
            ctx.fillStyle = 'rgba(0,230,0,0.8)';
            ctx.fillRect(x*size, (y+0.5) * size * game.gameScale, 80, game.gameMenuItems.length * 16);

            ctx.font = '10px monospace';
            game.gameMenuItems.forEach((item, i) => {
                //const itemY = y + size * game.gameScale + i * 16;
                ctx.fillStyle = (game.hoveredGameMenuItem === i) ? 'black' : 'white';
                ctx.fillText(item, x + size + game.gameScale, (y+0.5) * size * game.gameScale + 10 + i * 16);
            });
        }
        this.drawDot(ctx,game.hoverx,game.hovery, 3)
    }
    drawDot(ctx, x, y, radius = 3, color = 'red') {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
    }
    drawPlayerMenu(ctx = view.gameCtx) {
        const size = game.cellSize;
        const cx = view.gameCanvas.width/game.gameScale - size * 4;
        const cy = size;

        //console.log('gm',cx,cy, view.gameCanvas.width);
        const spriteX = game.currentPlayerObj?.spritex || 0;
        const spriteY = game.currentPlayerObj?.spritey || 0;

        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(cx, cy, size*2, size*2);
        // Draw player icon
        ctx.drawImage(
            this.ufeffSprite,
            spriteX * size, spriteY * size, size*2, size*2,
            cx, cy, size * 2, size * 2
        );
        // Draw border
        ctx.strokeStyle = 'white';
        if (game.isPlayerMenuOpen) {
            ctx.strokeStyle = 'green';
        }
        ctx.lineWidth = 1;
        ctx.strokeRect(cx, cy, size*2, size*2);

        if (game.isPlayerMenuOpen) {
            //ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillStyle = 'rgba(0,230,0,0.8)';
            ctx.fillRect(cx - 50, cy + size* game.gameScale, 140, 80);

            //ctx.fillStyle = 'white';
            ctx.fillStyle = 'black';
            ctx.font = '4px monospace';
            let yOffset = cy+10 + size* game.gameScale 

            game.playerMenuItems.forEach(section => {
                ctx.fillText(section.label + ':', cx - 45, yOffset);
                yOffset += 12;

                section.items.forEach(item => {
                    if (item.spriteX !== undefined) {
                        ctx.drawImage(
                            this.ufeffSprite,
                            item.spriteX * size, item.spriteY * size, size, size,
                            cx - 45, yOffset - 8, cy+size * game.gameScale, size * game.gameScale
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
            this.drawInventoryGrid(ctx);
        }
    }
    sayMsg({x, y}, msg, ctx = this.gameCtx) {
        const padding = 4;
        const fontSize = 4;
        const lineHeight = fontSize + 2;

        ctx.save();

        ctx.font = `${fontSize}px monospace`;
        const textWidth = ctx.measureText(msg).width;

        const boxWidth = textWidth + padding * 2;
        const boxHeight = lineHeight + padding * 2;

        // Compute screen position
        const screenX = x * game.cellSize - game.camera.x;
        const screenY = y * game.cellSize - game.camera.y - boxHeight - 2; // Just above the tile

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
    drawFlippedSprite(ctx, image, sx, sy, sw, sh, dx, dy, dw, dh, flipH = false, flipV = false) {
        ctx.save();

        // Move the origin to where we want to draw
        ctx.translate(dx + (flipH ? dw : 0), dy + (flipV ? dh : 0));

        // Apply scaling
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

        // Draw image
        ctx.drawImage(image, sx, sy, sw, sh, 0, 0, dw, dh);

        ctx.restore();
    }
    drawGrid(ctx){
        // Draw terrain
        for (let y = 0; y < game.gridSize; y++) {
            for (let x = 0; x < game.gridSize; x++) {
                const tile = game.gameMap[y][x];

                if (tile) {

                    const cellS = tile.size === 2 ? game.cellSize : game.cellSize;
                    ctx.drawImage(
                        this.ufeffSprite,
                        tile.x * game.cellSize, tile.y * game.cellSize, cellS, cellS,
                        //x * game.cellSize- game.camera.x, y * game.cellSize- game.camera.y,
                        x * game.cellSize, y * game.cellSize,
                        cellS, cellS
                    );
                }

                //ctx.strokeStyle = '#00000033';
                //ctx.strokeRect(x * game.cellSize, y * game.cellSize, game.cellSize, game.cellSize);

                if(game.showCoords || tile.o && is_info.checked){
                    ctx.fillStyle = 'white';
                    ctx.font = '2px monospace';
                    ctx.fillText(`${x},${y}`, x * game.cellSize , y * game.cellSize+4);
                }
            }
        }

    }
    drawInventoryGrid(ctx){
        const size = game.cellSize;
        const scale = game.gameScale;
        const gridCols = 8;
        const gridRows = 4;
        const slotSize = size * scale + 1;
        const menuWidth = gridCols * slotSize;
        const menuHeight = gridRows * slotSize;
        const menuX = game.ix = size * 12 * scale - menuWidth - 10;
        const menuY = game.iy = size + size*2 ;

        // Draw background
        ctx.fillStyle = 'rgba(0,0,0,0.8)';
        ctx.fillRect(menuX, menuY, menuWidth, menuHeight);

        //hoveredInventoryIndex = -1;

        // Draw inventory items
        for (let i = 0; i < gridCols*gridRows; i++) {
            const item = game.playerInventory[i];
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const itemX = menuX + col * slotSize;
            const itemY = menuY + row * slotSize;

            ctx.strokeStyle = 'white';
            ctx.lineWidth = 1;
            ctx.strokeRect(itemX, itemY, slotSize, slotSize);
            this.drawDot(ctx, itemX,itemY,1,'blue');
            // Highlight if hovered
            if (game.hoveredInventoryIndex === i) {
                ctx.strokeStyle = 'yellow';
                ctx.lineWidth = 2;
                ctx.strokeRect(itemX, itemY, slotSize - 2, slotSize - 2);
            }

            if (item) {

                ctx.drawImage(
                    this.ufeffSprite,
                    item.spriteX * size , item.spriteY * size, size*2, size*2,
                    itemX + 4, itemY + 2, size * scale- 6, size * scale -6 
                );

                if (item.count > 1) {
                    ctx.fillStyle = 'rgba(255,255,255,0.7)';
                    ctx.font = '5px monospace';
                    ctx.fillText(`${item.count}`, itemX + 2, itemY + slotSize - 4);
                }
            }

            // Store hover index (will be set by mousemove)
            if (
                game.mouseX >= itemX && game.mouseX <= itemX + slotSize &&
                    game.mouseY >= itemY && game.mouseY <= itemY + slotSize
            ) {
                game.hoveredInventoryIndex = i;
            }
        }

        // Draw tooltip
        if (game.hoveredInventoryIndex !== -1) {
            //console.log(gameX,gameY)
            const item = game.playerInventory[game.hoveredInventoryIndex];
            if (item) {
                const tooltipX = game.gameX + 10;
                const tooltipY = game.gameY + 10;
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
        this.drawDot(ctx, game.menuX,game.menuY,2,'yellow');
        this.drawDot(ctx, game.ix,game.iy,2,'purple');
    }
    drawCharacterSelectScreen(dt) {
        const ctx = view.gameCtx
        //ctx.clearRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, view.gameCanvas.width, view.gameCanvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '6px monospace';
        ctx.fillText('Choose Your Character', 50, 40);

        const size = game.cellSize;
        const scale = game.gameScale;
        const gap = 10;
        const startX = 50;
        const startY = 60;
        const cols = 5;

        let lcharAreas = [];

        game.characters.forEach((char, i) => {
            const x = startX + (i % cols) * (size * scale + gap);
            const y = startY + Math.floor(i / cols) * (size * scale + gap);
            ctx.fillStyle = (i === game.selectedCharacterIndex) ? '#0f0' : '#444';
            ctx.fillRect(x - 2, y - 2, size * scale + 4, size * scale + 4);
            ctx.drawImage(
                this.ufeffSprite,
                char.spritex * size, char.spritey * size, size*2, size*2,
                x, y, size * scale, size * scale
            );
            ctx.fillStyle = 'white';
            ctx.font = '4px monospace';
            ctx.fillText(char.name, x, y + size * scale);
            lcharAreas.push({ x, y, w: size * scale, h: size * scale, index: i });
            if (!game.charAreas.length) game.charAreas = lcharAreas;
        });
        drawCanvasInput(ctx, dt);
    }
    ///////////editor
    //

    drawLayer(ctx){
        //check if currently drawing selected unit
        for(let i = 0; i < game.gameMapLayer.length; i++){
            let tile = game.gameMapLayer[i];

            const cellS = tile.size === 2 ? game.cellSize *2: game.cellSize;
            //console.log('draw layer', tile);
            ctx.drawImage(
                this.ufeffSprite,
                tile.spritex * game.cellSize, tile.spritey * game.cellSize, cellS, cellS,
                tile.x * game.cellSize, tile.y * game.cellSize,
                cellS, cellS
            );
            if( game.showCoords || tile.o === true && !!is_info.checked){
                //console.log('draw layer', tile);
                ctx.fillStyle = 'white';
                ctx.font = '3px monospace';
                ctx.fillText(`${tile.x},${tile.y}`, tile.x * game.cellSize , tile.y * game.cellSize+4);

                ctx.strokeStyle = 'red';
                ctx.lineWidth = 1;
                ctx.strokeRect( (tile.x * game.cellSize), (tile.y * game.cellSize), cellS, cellS);

            }
        }
    }
    drawUnits(ctx){
        //check if currently drawing selected unit
        for(let i = 0; i < game.gameUnits.length; i++){
            let unit = game.gameUnits[i];

            this.drawSingleUnit(ctx, unit);
        }
        this.drawSingleUnit(ctx, game.currentPlayerObj);
        //debug frame by frame
        if (game.selectedUnit) {
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.strokeRect( (game.selectedUnit.x * game.cellSize), (game.selectedUnit.y * game.cellSize), game.cellSize-2, game.cellSize-2);
            ctx.strokeStyle = 'black';

        }

        if(view.is_info.checked){
            const cellS = game.currentPlayerObj?.size === 2 ? game.cellSize *2: game.cellSize;
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 1;
            ctx.strokeRect( (game.currentPlayerObj.x * game.cellSize), (game.currentPlayerObj.y * game.cellSize), cellS, cellS);

            ctx.strokeStyle = 'green';
            ctx.lineWidth = 1;
            ctx.strokeRect( (game.currentPlayerObj.x * game.cellSize), (game.currentPlayerObj.y * game.cellSize), game.cellSize, game.cellSize);
            this.drawDot(ctx, game.currentPlayerObj.x * game.cellSize,game.currentPlayerObj.y * game.cellSize);
        }

        //noDraw = false;
    }

    printSavedMap(maps){
        let list = `<p onclick="this.parentNode.innerHTML = ''">close</p><p class="d" onclick="this.parentNode.innerHTML=''">&times;</p><br />`;
        for(let i = 0; i<maps.length; i++){
            list += `<p onclick="game.loadMapByName('${maps[i]}')">${maps[i]} </p><p class="d" onclick="deleteMap('${maps[i]}')">del</p><br />`;
        }
        this.map_menu.innerHTML = list;
    }

    drawAnimation(ctx , dt) {
        //console.log ( dt - old_dt);

        if(dt - this.old_dt > 300){
            this.old_dt = dt;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
        const sx = (this.currentFrame * this.frameWidth);
        const sy = (this.rowIndex * this.frameHeight);

        ctx.drawImage(this.craftSprite, sx, sy, this.frameWidth, this.frameHeight, 100, 100, this.frameWidth/10, this.frameHeight/10);

    }
    drawAnimationEdit(dt) {
        //console.log ( dt - this.old_dt);

        if(dt - this.old_dt > 300){
            this.old_dt = dt;
            this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
        }
        for(let y = 0; y < view.framesPerCol; y++)
        for(let x = 0; x < view.framesPerRow; x++){
            const sx = this.currentFrame * this.frameWidth + this.frameWidth * this.totalFrames  * x;
            const sy = y * this.frameHeight;

            const w = parseInt(this.frameWidth*this.frameScale);
            const h = parseInt(this.frameHeight*this.frameScale);

            const dx = (x)*w
            const dy = (y)*h

            view.craftCtx.drawImage(this.craftSprite, 
                sx, sy, this.frameWidth, this.frameHeight, 
                dx, dy, w ,h
            );
            //console.log('ee dx dy',dx,dy,' cmx cmy ',game.cmouseX*20, (game.cmouseY-25)*10)
            if(

                game.cmouseX * 18> dx &&
                game.cmouseX * 18 < dx + w &&
                (game.cmouseY-25) * 18 > dy &&
                (game.cmouseY-25) * 18 < dy + h 

            ){
            view.craftCtx.strokeStyle = 'green';
                view.craftCtx.strokeRect(dx, dy, w ,h);
                game.frameHover = { x , y };
            }

        }

    }
}
