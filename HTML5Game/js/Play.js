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
            hero,
            heroImg,
            platformImg,
            w,
            h,
            keyDown = false,
            collideables = [];

        self.lastPlatform = null;

        this.getCollideables = function() { return collideables; };

        this.init = function() {
            canvas = document.getElementById("canvas"),
            stage = new createjs.Stage(canvas);
            world = new createjs.Container();
            stage.addChild(world);

            w = canvas.width;
            h = canvas.height;

            $.each(globalAssets, function(i) {
                if (this.id === "Hero") heroImg = globalAssets[i];
                if (this.id === "Platform") platformImg = globalAssets[i];
            });

            hero = new Game.Hero(self,heroImg,canvas);
            reset();

            setUpListerners();

            createjs.Ticker.setFPS(50);
            createjs.Ticker.addEventListener("tick", handleTick);
        }

        function reset() {
            collideables = [];
            self.lastPlatform = null;
            world.removeAllChildren();
            world.x = world.y = 0;

            hero.x = 50;
            hero.y = h/2 - 50;
            hero.reset();
            world.addChild(hero);

            // add a platform for the hero to collide with
            addPlatform(50 - platformImg.width/2, h/2);

            var c, l = w / platformImg.width * 1.5, atX=0, atY = h/1.25;

            for ( c = 1; c < l; c++ ) {
                var atX = (c-.5) * platformImg.width*2 + (Math.random()*platformImg.width-platformImg.width/2);
                window.console.log(atX);
                var atY = atY + Math.random() * 300 - 150;
                addPlatform(atX,atY);
            }
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
            if ( hero.x > w*.4 ) {
                world.x = -hero.x + w*.4;
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

            stage.update();
        }

        function addPlatform(x,y) {
            x = Math.round(x);
            y = Math.round(y);

            var platform = new createjs.Bitmap(platformImg);
            platform.x = x;
            platform.y = y;
            platform.snapToPixel = true;

            world.addChild(platform);
            collideables.push(platform);
            self.lastPlatform = platform;
        }

        function movePlatformToEnd(platform) {
            platform.x = self.lastPlatform.x + platform.image.width*2 + Math.random()*platform.image.width*2 - platform.image.width;
            platform.y = self.lastPlatform.y + Math.random() * 300 - 150;
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
        }
    }

    Game.Play = Play;

}(jQuery));
