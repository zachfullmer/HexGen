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
        pixi: 'utility/pixi.min'
    }
});

requirejs(['jquery', 'map', 'tile', 'xml', 'sprites', 'anim', 'gen', 'tint', 'gradient', 'scaling', 'pixi'],
    function ($, map, tile, xml, sprites, anim, gen, tint, gradient, scaling, PIXI) {
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
        var renderer = PIXI.autoDetectRenderer(canvasSize.w, canvasSize.h);
        renderer.view.style.position = "absolute";
        renderer.view.style.display = "block";
        renderer.view.style.left = '0';
        renderer.view.style.top = '0';
        renderer.autoResize = true;
        document.body.appendChild(renderer.view);
        var stage = new PIXI.Container();
        var camVelX = 0;
        var camVelY = 0;
        // when sprite loading is done, load map and begin drawing
        PIXI.loader
            .add(['images/terrain.png', 'images/feature.png', 'images/monsters.png', 'images/castle.png'])
            .load(function () {
                $.when(tile.loadTiles(), tile.loadFeatures(), sprites.addAnimList('castle.anim'))
                    .done(() => {
                        var camSpeed = 15;
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
                                gen.generateMap(hexMap);
                                //hexMap.renderMiniMap();
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
                        let hexMap = new map.HexMap({
                            mapWidthInTiles: 128,
                            mapHeightInTiles: 128,
                            tileWidthInPixels: 64,
                            tileHeightInPixels: 74,
                            tileSpriteSheet: $('#terrainSpriteSheet')[0],
                            featureSpriteSheet: $('#featureSpriteSheet')[0],
                            canvasWidthInPixels: canvasSize.w,
                            canvasHeightInPixels: canvasSize.h,
                        });
                        gen.generateMap(hexMap);
                        stage.addChild(hexMap.spriteContainer);
                        let anims = [];
                        for (let a = 0; a < 3000; a++) {
                            let tilePos = {
                                x: Math.floor(Math.random() * hexMap.mapWidthInTiles),
                                y: Math.floor(Math.random() * hexMap.mapHeightInTiles)
                            }
                            let currentTile = hexMap.grid.getTileByCoords(tilePos.x, tilePos.y);
                            let currentAnim = new anim.Anim(sprites.animLists.castle['castle']);
                            currentTile.addSprite(currentAnim.spriteContainer);
                            //stage.addChild(currentAnim.spriteContainer);
                            anims.push(currentAnim);
                        }
                        var oldTime = null;
                        function render(time) {
                            meter.tickStart();
                            requestAnimationFrame(render);
                            if (oldTime === null) {
                                oldTime = time;
                            }
                            var deltaTime = time - oldTime;
                            oldTime = time;
                            //
                            for (let a in anims) {
                                anims[a].update(deltaTime);
                            }
                            hexMap.updateScreenVisibility(false);
                            hexMap.screenPos.x += camVelX;
                            hexMap.screenPos.y += camVelY;
                            stage.x = -hexMap.screenPos.x;
                            stage.y = -hexMap.screenPos.y;
                            hexMap.calcCamPos();
                            hexMap.updateScreenVisibility(true);
                            //
                            renderer.render(stage);
                            meter.tick();
                        };
                        requestAnimationFrame(render);
                    });
            });
    });