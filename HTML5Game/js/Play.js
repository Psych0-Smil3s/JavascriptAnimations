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

            addPlatform(w/2 - platformImg.width/2, h/1.25);

            hero = new Game.Hero(self,heroImg,canvas);
            hero.x = w/2;
            hero.y = h/2;
            world.addChild(hero);

            setUpListerners();

            createjs.Ticker.setFPS(50);
            createjs.Ticker.addEventListener("tick", handleTick);
        }

        function handleTick() {
            ticks++;
            hero.tick();
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
