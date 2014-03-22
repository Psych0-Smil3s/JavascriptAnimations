this.Game = this.Game || {};

/*
 * Play - Main Game Driver
 */
(function($) {

    "use strict";

    function Play() {

        var self = this,
            ticks = 0,
            canvas,
            stage,
            world,
            scale,
            hero,
            heroImg,
            platformImg,
            w,
            h,
            scale,
            background,
            horizontalGrid = 8,
            verticalGrid = 6,
            keyDown = false,
            collideables = [];

        self.lastPlatform = null;

        this.getCollideables = function() { return collideables; };

        this.init = function() {
            canvas = document.getElementById("canvas"),
            stage = new createjs.Stage(canvas);
            world = new createjs.Container();

            setCanvas();

            $.each(globalAssets, function(i) {
                if (this.id === "Hero") heroImg = globalAssets[i];
                if (this.id === "Platform") platformImg = globalAssets[i];
            });

            hero = new Game.Hero(self,heroImg,canvas,scale);

            reset();
            setUpListerners();

            createjs.Ticker.setFPS(50);
            createjs.Ticker.addEventListener("tick", handleTick);
        }

        function setCanvas() {
            w = utils.getWidth();
            h = utils.getHeight();

            canvas.width = w;
            canvas.height = h;

            scale = Math.min(w/BaseWidth,h/BaseHeight);
        }

        function reset() {
            collideables = [];
            self.lastPlatform = null;

            stage.removeChild(background);
            background = createBgGrid(horizontalGrid,verticalGrid);
            stage.addChild(background);

            world.removeAllChildren();
            world.x = world.y = 0;

            hero.x = 50 * scale;
            hero.y = h/2 - 50 * scale;
            hero.scaleX = hero.scaleY = scale;
            hero.reset();
            world.addChild(hero);

            // add a platform for the hero to collide with
            addPlatform(50 * scale - platformImg.width/2, h/2);

            var c, l = w / (platformImg.width * 1.5 * scale), atX=0, atY = h/1.25;

            for ( c = 1; c < l; c++ ) {
                var atX = (c-.5) * platformImg.width*2*scale + (Math.random()*platformImg.width-platformImg.width/2)*scale;
                var atY = atY + (Math.random() * 300 - 150) * scale;
                addPlatform(atX,atY);
            }

            stage.addChild(world);
        }

        function handleTick() {
            ticks++;
            hero.tick();

            if ( hero.y > h*3 ) {
                reset();
            }
            // if the hero "leaves" it's bounds of
            // screenWidth * 0.3 and screenHeight * 0.3(to both ends)
            // we will reposition the "world-container", so our hero
            // is allways visible
            if ( hero.x > w*.3 ) {
                world.x = -hero.x + w*.3;
            }
            if ( hero.y > h*.5 ) {
                world.y = -hero.y + h*.5;
            } else if ( hero.y < h*.1 ) {
                world.y = -hero.y + h*.1;
            }

            for ( var c = 0; c < collideables.length; c++ ) {
                var p = collideables[c];
                if ( p.localToGlobal(p.image.width,0).x < -10 ) {
                    movePlatformToEnd(p);
                }
            }

            background.x = (world.x * .45) % (w/horizontalGrid); // horizontal
            background.y = (world.y * .45) % (h/verticalGrid);   // vertical

            stage.update();
        }

        function addPlatform(x,y) {
            x = Math.round(x);
            y = Math.round(y);

            var platform = new createjs.Bitmap(platformImg);
            platform.x = x;
            platform.y = y;
            platform.scaleX = platform.scaleY = scale;
            platform.snapToPixel = true;

            world.addChild(platform);
            collideables.push(platform);
            self.lastPlatform = platform;
        }

        function movePlatformToEnd(platform) {
            platform.x = self.lastPlatform.x + platform.image.width*2*scale + (Math.random()*platform.image.width*2 - platform.image.width) * scale;
            platform.y = self.lastPlatform.y + (Math.random() * 300 - 150) * scale;
            self.lastPlatform = platform;
        }

        function handleKeyDown() {
            if ( !keyDown ) {
                keyDown = true;
                hero.jump();
            }
        }

        function handleKeyUp() {
            keyDown = false;
        }

        function setUpListerners() {
            if ('ontouchstart' in document.documentElement) {
                canvas.addEventListener('touchstart', function(e) {
                    self.handleKeyDown();
                }, false);

                canvas.addEventListener('touchend', function(e) {
                    self.handleKeyUp();
                }, false);
            } else {
                document.onkeydown = handleKeyDown;
                document.onkeyup = handleKeyUp;
                document.onmousedown = handleKeyDown;
                document.onmouseup = handleKeyUp;
            }

            window.addEventListener('resize', function() { onResize() }, false);
        }

        function onResize() {
            setCanvas();
            reset();
        }

        function createBgGrid(numX, numY) {
            var grid = new createjs.Container();
            grid.snapToPixel = true;
            // calculating the distance between
            // the grid-lines
            var gw = w/numX;
            var gh = h/numY;
            // drawing the vertical line
            var verticalLine = new createjs.Graphics();
            verticalLine.beginFill(createjs.Graphics.getRGB(2, 132, 130));
            verticalLine.drawRect(0,0,gw * 0.02,gh*(numY+2));
            var vs;
            // placing the vertical lines:
            // we're placing 1 more than requested
            // to have seamless scrolling later
            for ( var c = -1; c < numX+1; c++) {
                vs = new createjs.Shape(verticalLine);
                vs.snapToPixel = true;
                vs.x = c * gw;
                vs.y = -gh;
                grid.addChild(vs);
            }
            // drawing a horizontal line
            var horizontalLine = new createjs.Graphics();
            horizontalLine.beginFill(createjs.Graphics.getRGB(2, 132, 130));
            horizontalLine.drawRect(0,0,gw*(numX+1),gh * 0.02);
            var hs;
            // placing the horizontal lines:
            // we're placing 1 more than requested
            // to have seamless scrolling later
            for ( c = -1; c < numY+1; c++ ) {
                hs = new createjs.Shape(horizontalLine);
                hs.snapToPixel = true;
                hs.x = 0;
                hs.y = c * gh;
                grid.addChild(hs);
            }

            // return the grid-object
            return grid;
        }
    }

    Game.Play = Play;

}(jQuery));
