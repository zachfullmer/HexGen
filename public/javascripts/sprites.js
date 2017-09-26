define(['jquery', 'xml', 'pixi', 'anim'],
    function ($, XML, PIXI, ANIM) {

        var SPRITES = {};

        function minusExt(fileName) {
            return fileName.match(/(.+)\./)[1];
        }

        function readFolder(folder, baseTex, root = true) {
            var folderData = ['', { dir: {}, spr: {} }];
            folderData[0] = folder.getAttribute('name');
            var child = XML.getFirstChild(folder);
            while (child !== null) {
                if (child.tagName == 'dir') {
                    var subFolderData = readFolder(child, baseTex, false);
                    folderData[1]['dir'][subFolderData[0]] = subFolderData[1];
                }
                else if (child.tagName == 'spr') {
                    let pixiTex = folderData[1]['spr'][child.getAttribute('name')] = new PIXI.Texture(baseTex);
                    pixiTex.frame = new PIXI.Rectangle(
                        parseInt(child.getAttribute('x')),
                        parseInt(child.getAttribute('y')),
                        parseInt(child.getAttribute('w')),
                        parseInt(child.getAttribute('h')));
                }
                child = XML.nextSibling(child);
            }
            if (root) {
                return folderData[1];
            }
            return folderData;
        }

        SPRITES.spriteLists = {};

        SPRITES.addSpriteList = function (xmlFilename) {
            var deferred = $.Deferred();

            $.ajax({
                type: 'GET',
                url: 'data/' + xmlFilename,
                dataType: 'xml',
                success: (xmlData) => {
                    var img = XML.get(xmlData, 'img')[0];
                    var fileName = img.getAttribute('name');
                    var fileNameMinusExt = minusExt(fileName);
                    var folder = XML.get(img, 'definitions')[0];
                    folder = XML.get(folder, 'dir')[0];
                    var baseTex = PIXI.loader.resources['images/' + fileName].texture.baseTexture;
                    SPRITES.spriteLists[fileNameMinusExt] = {
                        sheet: baseTex,
                        sprites: readFolder(folder, baseTex)
                    };
                    deferred.resolve();
                }
            });

            return deferred.promise();
        }

        SPRITES.getSpriteTexture = function (spriteListName, path) {
            if (SPRITES.spriteLists[spriteListName] === undefined) {
                throw Error('" couldn\'t find sprite list "' + spriteListName + '"');
            }
            let splitPath = path.split(/\/+/);
            splitPath.splice(0, 1);
            let spriteData = SPRITES.spriteLists[spriteListName].sprites;
            for (let s in splitPath) {
                if (s >= splitPath.length - 1) {
                    spriteData = spriteData.spr[splitPath[s]];
                }
                else {
                    spriteData = spriteData.dir[splitPath[s]];
                }
            }
            if (spriteData === undefined) {
                throw Error('" couldn\'t find sprite "' + path + '" in sprite list "' + spriteListName + '"');
            }
            return spriteData;
        }

        SPRITES.animLists = {};

        SPRITES.addAnimList = function (xmlFileName) {
            var deferred = $.Deferred();
            $.ajax({
                type: 'GET',
                url: 'data/' + xmlFileName,
                dataType: 'xml',
                success: (xmlData) => {
                    var anims = XML.get(xmlData, 'animations')[0];
                    var fileName = anims.getAttribute('spriteSheet');
                    var fileNameMinusExt = fileName.match(/(.+)\./)[1];
                    SPRITES.addSpriteList(fileName)
                        .then(() => {
                            var spriteList = SPRITES.spriteLists[fileNameMinusExt];
                            var animListObject = {};
                            var anim = XML.getFirstChild(anims);
                            // loop through animations
                            while (anim !== null) {
                                if (anim.tagName == 'anim') {
                                    var animObject = {
                                        name: anim.getAttribute('name'),
                                        spriteList: spriteList,
                                        loops: parseInt(anim.getAttribute('loops')),
                                        cells: []
                                    };
                                    // loop through animation cells
                                    var extents = { x1: 0, y1: 0, x2: 0, y2: 0 };
                                    var cell = XML.getFirstChild(anim);
                                    while (cell !== null) {
                                        if (cell.tagName == 'cell') {
                                            var cellObject = {
                                                delay: parseInt(cell.getAttribute('delay')) * 30.9,
                                                sprites: []
                                            };
                                            // loop through cell sprites
                                            var spr = XML.getFirstChild(cell);
                                            while (spr !== null) {
                                                if (spr.tagName == 'spr') {
                                                    var sprObject = {
                                                        x: parseInt(spr.getAttribute('x')),
                                                        y: parseInt(spr.getAttribute('y')),
                                                        z: parseInt(spr.getAttribute('z')),
                                                        flipH: spr.getAttribute('flipH') === null ? false : true,
                                                        flipV: spr.getAttribute('flipV') === null ? false : true
                                                    }
                                                    let path = spr.getAttribute('name');
                                                    let splitPath = path.split(/\/+/);
                                                    splitPath.splice(0, 1);
                                                    sprObject.spriteData = SPRITES.spriteLists[fileNameMinusExt].sprites;
                                                    for (let s in splitPath) {
                                                        if (s >= splitPath.length - 1) {
                                                            sprObject.spriteData = sprObject.spriteData.spr[splitPath[s]];
                                                        }
                                                        else {
                                                            sprObject.spriteData = sprObject.spriteData.dir[splitPath[s]];
                                                        }
                                                    }
                                                    if (sprObject.spriteData === undefined) {
                                                        throw Error('animation "' + xmlFileName + '" couldn\'t find sprite "' + path + '" in sprite list "' + fileName + '"');
                                                    }
                                                    var left = Math.floor(sprObject.x - (sprObject.spriteData.orig.width / 2));
                                                    var right = Math.floor(sprObject.x + (sprObject.spriteData.orig.width / 2));
                                                    var up = Math.floor(sprObject.y - (sprObject.spriteData.orig.height / 2));
                                                    var down = Math.floor(sprObject.y + (sprObject.spriteData.orig.height / 2));
                                                    if (left < extents.x1) extents.x1 = left;
                                                    if (right > extents.x2) extents.x2 = right;
                                                    if (up < extents.y1) extents.y1 = up;
                                                    if (down > extents.y2) extents.y2 = down;
                                                    cellObject.sprites.push(sprObject);
                                                }
                                                spr = XML.nextSibling(spr);
                                            }
                                            animObject.cells.push(cellObject);
                                        }
                                        cell = XML.nextSibling(cell);
                                    }
                                    animObject.extents = extents;
                                    animListObject[anim.getAttribute('name')] = animObject;
                                }
                                anim = XML.nextSibling(anim);
                            }
                            SPRITES.animLists[fileNameMinusExt] = animListObject;
                            deferred.resolve();
                        });
                }
            });
            return deferred.promise();
        }
        SPRITES.loadGraphics = function () {
            var deferred = $.Deferred();
            $.ajax({
                type: 'GET',
                url: 'data/graphics.json',
                dataType: 'json',
                success: (jsonData) => {
                    let promises = [];
                    for (let f in jsonData) {
                        let ext = jsonData[f].match(/.+(\.\w+)$/);
                        if (ext === null) {
                            throw Error('invalid file listed in graphics.json; must be .sprites or .anim file');
                        }
                        if (ext[1] === '.sprites') {
                            promises.push(SPRITES.addSpriteList(ext[0]));
                        }
                        else if (ext[1] === '.anim') {
                            promises.push(SPRITES.addAnimList(ext[0]));
                        }
                        else {
                            throw Error('invalid file "' + ext[0] + '" listed in graphics.json; must be .sprites or .anim file');
                        }
                    }
                    $.when(...promises).done(() => {
                        deferred.resolve();
                    });
                }
            });
            return deferred.promise();
        }

        SPRITES.getEntityTypeGraphics = function (entityType) {
            if (entityType.animListName && entityType.animName) {
                entityType.anim = SPRITES.animLists[entityType.animListName][entityType.animName];
                if (entityType.anim === undefined) {
                    throw Error('could not find animation "' + entityType.animName + '" in anim file "' + entityType.animListName + '"');
                }
            }
            else if (entityType.spriteListName && entityType.spritePath) {
                entityType.spriteTexture = SPRITES.getSpriteTexture(entityType.spriteListName, entityType.spritePath);
            }
            else {
                throw Error('entity does not have any animations or sprites specified');
            }
        }

        SPRITES.createEntityGraphics = function (entity) {
            if (entity.type.anim) {
                entity.anim = new ANIM.Anim(entity.type.anim);
                entity.sprite = entity.anim.spriteContainer;
            }
            else if (entity.type.spriteTexture) {
                entity.sprite = new PIXI.Sprite();
                entity.sprite.setTexture(entity.type.spriteTexture);
                entity.sprite.anchor.set(
                    Math.floor(entity.sprite.width / 2) / entity.sprite.width,
                    Math.floor(entity.sprite.height / 2) / entity.sprite.height);
            }
            else {
                throw Error('entity type "' + entity.type.name + '" has no animations or sprites defined');
            }
        }

        return SPRITES;
    }
);