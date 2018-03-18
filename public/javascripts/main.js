requirejs.config({
    paths: {
        jquery: 'utility/jquery-1.10.2.min',
        hex: 'utility/hex-grid',
        xml: 'utility/xml-parsing',
        noise: 'utility/noise',
        tint: 'utility/tint',
        gradient: 'utility/gradient',
        color: 'utility/color',
        coords: 'utility/coords',
        scaling: 'utility/scaling',
        window: 'utility/window',
        pixi: 'utility/pixi.min',
        seedrandom: 'utility/seedrandom',
        priority: 'utility/priority-queue.min'
    }
});

const seedChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789?!';

function genSeed() {
    let seed = '';
    for (let s = 0; s < 8; s++) {
        seed = seed.concat(seedChars[Math.floor(Math.random() * seedChars.length)]);
    }
    return seed;
}

function seedIsValid(seed) {
    if (typeof seed !== 'string' ||
        seed.length !== 8) {
        return false;
    }
    for (let s = 0; s < seed.length; s++) {
        if (seedChars.indexOf(seed[s]) < 0) {
            return false;
        }
    }
    return true;
}

requirejs(['jquery', 'map', 'tile', 'xml', 'sprites', 'anim', 'gen', 'tint',
    'gradient', 'scaling', 'pixi', 'site', 'unit', 'color', 'ui'],
    function ($, MAP, TILE, XML, SPRITES, ANIM, GEN, TINT, GRADIENT, SCALING, PIXI, SITE, UNIT, COLOR, UI) {
        var seed = '12345678';
        $('#mapSeed').val(seed);
        var meter = new FPSMeter();
        // initialize rendering stuff
        var type = "WebGL"
        if (!PIXI.utils.isWebGLSupported()) {
            type = "canvas"
        }
        PIXI.utils.sayHello(type);
        var pixelRatio = devicePixelRatio;
        var zoom = 1.0;
        var canvasSize = { w: window.innerWidth * pixelRatio / zoom, h: window.innerHeight * pixelRatio / zoom };
        function updateCanvasSize() {
            canvasSize = { w: window.innerWidth * pixelRatio / zoom, h: window.innerHeight * pixelRatio / zoom };
            renderer.resize(canvasSize.w, canvasSize.h);
        }
        var renderer = PIXI.autoDetectRenderer(canvasSize.w, canvasSize.h);
        renderer.view.id = 'mapWindow';
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.view.style.left = '0';
        renderer.view.style.top = '0';
        document.body.appendChild(renderer.view);
        var stage = new PIXI.Container();
        var camVelX = 0;
        var camVelY = 0;
        var testUnit = null;
        var testSite = null;
        // when sprite loading is done, load map and begin drawing
        PIXI.loader
            .add(['images/terrain.png', 'images/feature.png', 'images/monsters.png', 'images/castle.png'])
            .load(function () {
                SPRITES.loadGraphics().then(() => {
                    TILE.loadTiles();
                    TILE.loadFeatures();
                    SITE.loadSites();
                    UNIT.loadUnits();
                    var camSpeed = 15;
                    $('#genButton').click((event) => {
                        seed = genSeed();
                        $('#mapSeed').val(seed);
                        GEN.generateMap(hexMap, seed);
                        hexMap.renderMiniMap();
                    });
                    $('#genSeedButton').click((event) => {
                        if (seedIsValid($('#mapSeed').val())) {
                            seed = $('#mapSeed').val();
                            GEN.generateMap(hexMap, seed);
                            hexMap.renderMiniMap();
                        }
                        else {
                            console.log('invalid seed');
                        }
                    });
                    $(window).keydown((event) => {
                        if (event.repeat) {
                            return;
                        }
                        if (event.key == 'ArrowLeft' || event.key == 'a') {
                            camVelX = -camSpeed;
                        }
                        if (event.key == 'ArrowRight' || event.key == 'd') {
                            camVelX = camSpeed;
                        }
                        if (event.key == 'ArrowUp' || event.key == 'w') {
                            camVelY = -camSpeed;
                        }
                        if (event.key == 'ArrowDown' || event.key == 's') {
                            camVelY = camSpeed;
                        }
                        if (event.key == 'Enter') {
                            seed = genSeed();
                            $('#mapSeed').val(seed);
                            GEN.generateMap(hexMap, seed);
                            hexMap.renderMiniMap();
                        }
                        if (event.key == 'z') {
                            zoom += 0.1;
                            updateCanvasSize();
                        }
                        if (event.key == 'x') {
                            zoom -= 0.1;
                            updateCanvasSize();
                        }
                        if (event.key == '.') {
                            let nextMove = testUnit.path.shift();
                            if (nextMove !== undefined) {
                                hexMap.moveUnit(testUnit, nextMove.x, nextMove.y);
                            }
                        }
                    });
                    $(window).keyup((event) => {
                        if (event.key == 'ArrowLeft' || event.key == 'a' || event.key == 'ArrowRight' || event.key == 'd') {
                            camVelX = 0;
                        }
                        if (event.key == 'ArrowUp' || event.key == 'w' || event.key == 'ArrowDown' || event.key == 's') {
                            camVelY = 0;
                        }
                    });
                    let hexMap = new MAP.HexMap({
                        mapWidthInTiles: 128,
                        mapHeightInTiles: 128,
                        tileWidthInPixels: 64,
                        tileHeightInPixels: 74,
                        tileSpriteSheet: $('#terrainSpriteSheet')[0],
                        featureSpriteSheet: $('#featureSpriteSheet')[0]
                    });
                    hexMap.screenPos.x = 4485;
                    hexMap.screenPos.y = 2955;
                    $(window).on('mousemove', (event) => {
                        let pixelPos = { x: ((event.clientX * pixelRatio / zoom) + hexMap.screenPos.x), y: ((event.clientY * pixelRatio / zoom) + hexMap.screenPos.y) }
                        let axial = hexMap.pixelToAxial(pixelPos.x, pixelPos.y, hexMap.tileHeightInPixels / 2);
                        let offset = MAP.axialToOffset(axial);
                        let mouseTile = hexMap.grid.getTileByCoords(offset.x, offset.y);
                        let terrain = mouseTile && mouseTile.terrain ? mouseTile.terrain.name : 'none';
                        let feature = mouseTile && mouseTile.feature ? mouseTile.feature.name : 'none';
                        $('#mousePos').text(offset.x + ',' + offset.y + ' (axial: ' + axial.q + ',' + axial.r + ')');
                        $('#tileTerrain').text(terrain);
                        $('#tileFeature').text(feature);
                    });
                    $(window).on('click', (event) => {
                        let pixelPos = { x: ((event.clientX * pixelRatio / zoom) + hexMap.screenPos.x), y: ((event.clientY * pixelRatio / zoom) + hexMap.screenPos.y) }
                        let axial = hexMap.pixelToAxial(pixelPos.x, pixelPos.y, hexMap.tileHeightInPixels / 2);
                        let offset = MAP.axialToOffset(axial);
                        let path = hexMap.findPath(testUnit.pos, offset, testUnit);
                        testUnit.path = path;
                    });
                    $(window).on('resize', (event) => {
                        updateCanvasSize();
                    });
                    GEN.generateMap(hexMap, seed);
                    hexMap.renderMiniMap();
                    let miniMapCanvas = $('#miniMap')[0];
                    miniMapCanvas.width = hexMap.miniMapCanvas.width;
                    miniMapCanvas.height = hexMap.miniMapCanvas.height;
                    miniMapCanvas.style.width = miniMapCanvas.width + 'px';
                    miniMapCanvas.style.height = miniMapCanvas.height + 'px';
                    let miniMapCtx = miniMapCanvas.getContext('2d');
                    stage.addChild(hexMap.spriteContainer);
                    let anims = [];
                    //
                    testUnit = new UNIT.Unit(UNIT.get('army'));
                    anims.push(testUnit.anim);
                    hexMap.addUnit(testUnit, 77, 60);
                    testSite = new SITE.Site(SITE.get('humanCity'));
                    anims.push(testSite.anim);
                    hexMap.addSite(testSite, 78, 60);
                    //
                    var oldTime = null;
                    let tilePos = hexMap.pixelCoordsOfTile(73, 57);
                    var graphics = new PIXI.Graphics();
                    graphics.position.set(tilePos.x, tilePos.y);
                    stage.addChild(graphics);
                    function render(time) {
                        meter.tickStart();
                        requestAnimationFrame(render);
                        if (oldTime === null) {
                            oldTime = time;
                        }
                        var deltaTime = time - oldTime;
                        oldTime = time;
                        //
                        let rgb = { r: Math.floor(Math.random() * 256), g: 128, b: 255 };
                        graphics.clear();
                        UI.drawCursor(graphics, hexMap, COLOR.rgbToHexInt(rgb));
                        //
                        for (let a in anims) {
                            anims[a].update(deltaTime);
                        }
                        hexMap.updateScreenVisibility(false);
                        hexMap.screenPos.x += camVelX;
                        hexMap.screenPos.y += camVelY;
                        stage.x = -hexMap.screenPos.x;
                        stage.y = -hexMap.screenPos.y;
                        $('#camPos').text(hexMap.screenPos.x + ',' + hexMap.screenPos.y);
                        hexMap.calcCamPos(renderer.view);
                        hexMap.updateScreenVisibility(true);
                        //
                        miniMapCtx.clearRect(0, 0, miniMapCanvas.width, miniMapCanvas.height);
                        hexMap.drawMiniMap(miniMapCtx, 0, 0, miniMapCanvas.width, miniMapCanvas.height);
                        renderer.render(stage);
                        meter.tick();
                    };
                    requestAnimationFrame(render);
                });
            });
    });