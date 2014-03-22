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
            flyImg,
            fly,
            palringoImg,
            palringo,
            w,
            h,
            scale,
            background,
            background2,
            horizontalGrid = 8,
            verticalGrid = 6,
            keyDown = false,
            collideables = [],
            parallaxObjects = [],
            spriteSheets = [],
			gameStateEnum = { INIT: 0, PLAY: 1, PAUSE: 2, FINISHED: 4 },
			currentState;

        self.lastPlatform = null;

        this.getCollideables = function() { return collideables; };

        this.init = function() {
            
			currentState = gameStateEnum.INIT;
			
			canvas = document.getElementById("canvas"),
            stage = new createjs.Stage(canvas);
            world = new createjs.Container();

            setCanvas();

            $.each(globalAssets, function(i) {
                if (this.id === "Hero") heroImg = globalAssets[i];
                if (this.id === "Platform") platformImg = globalAssets[i];
                if (this.id === "Fly") flyImg = globalAssets[i];
                if (this.id === "PalringoSprite") palringoImg = globalAssets[i];
            });

            hero = new Game.Hero(self,heroImg,canvas,scale);

            reset();
            setUpListerners();

            createjs.Ticker.setFPS(50);
            createjs.Ticker.addEventListener("tick", handleTick);
        }

        function initSpriteSheets() {
            var flyData = {
                images: [flyImg],
                frames: {
                    height: 6 * scale,
                    width: 16 * scale,
                    regX: 8 * scale,
                    regY: 3 * scale,
                    count: 2
                },
                animations: {
                    fly: {
                        frames:[0, 1],
                        frequency: 1
                    }
                }
            }
            spriteSheets[flyImg] = new createjs.SpriteSheet(flyData);
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
            initSpriteSheets();

            stage.removeChild(background);
            background = createBgGrid(horizontalGrid,verticalGrid);
            stage.addChild(background);

            stage.removeChild(background2);
            background2 = new createjs.Container();
            stage.addChild(background2);
            for ( var c = 0; c < 4; c++) {
                var line = createPixelLine((Math.random()*3+1)|0);
                background2.addChild(line);
                parallaxObjects.push(line);
            }

            world.removeAllChildren();
            world.x = world.y = 0;

            hero.x = 50 * scale;
            hero.y = h/2 - 50 * scale;
            hero.scaleX = hero.scaleY = scale;
            hero.reset();
            world.addChild(hero);

            fly = new createjs.Sprite(spriteSheets[flyImg]);
            fly.gotoAndPlay('fly');
            world.addChild(fly);

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
			switch (currentState) {
				case gameStateEnum.INIT:
					setup();
					break;
				case gameStateEnum.PLAY:
					play();
					break;
				case gameStateEnum.PAUSE:
					// don't need to do anything, just keep ticking
					break;
				case gameStateEnum.FINISHED:
					finished();
					break;
			}
            stage.update();
        }
		
		var counter = null;
		var timerCount = null;
		function setup() {
			if (counter == null) {
				var count = 3;
				counter = setInterval(function() {
				
					world.removeChild(timerCount);
					if (count <= 0) {
						clearInterval(counter);
						counter = null;
						currentState = gameStateEnum.PLAY;
						return;
					}

					timerCount = new createjs.Text(count,"100px Verdana","white");
					timerCount.lineWidth = 200;
					timerCount.textAlign = "center";
					timerCount.x = (w/2);
					timerCount.y = (h/2) - (100 * scale);
					timerCount.scaleX = timerCount.scaleY = scale;
					world.addChild(timerCount);
					
					count = count - 1;			
				}, 500); // change count every 500
			}
		}
				
		function finished() {
			// 1. stop the ticker
			// 2. show button 'start again' and button to tweet score
			// 3. in event handler for 'start again' - change currentState to INIT - then start the ticker
			
			// at the mo, go straight to INIT
			currentState = gameStateEnum.INIT;
		}
		
		function play() {
		
			hero.tick();

            if ( hero.y > h*3 ) {
                reset();
				currentState = gameStateEnum.FINISHED;
            }

            // movement of the fly
            fly.offsetX = ( Math.cos(ticks/10) * 10) * scale;
            fly.offsetY = ( Math.sin(ticks/ 7) *  5) * scale;
            // smoothly follow the hero by 10% of the distance every frame
            fly.x = fly.x + (hero.x - fly.x) * .1 + fly.offsetX;
            fly.y = fly.y + (hero.y - fly.y) * .1 + fly.offsetY;

            // keep hero visible
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

            // move background grid
            background.x = (world.x * .45) % (w/horizontalGrid);
            background.y = (world.y * .45) % (h/verticalGrid);

            // move background lines
            for ( c = 0; c < parallaxObjects.length; c++ ) {
                p = parallaxObjects[c];
                p.x = ((world.x * p.speedFactor - p.offsetX) % p.range) + p.range;
            }		
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
		
		function handleDoubleClick() {
			// cannot pause a game that is not playing or already paused
			if (currentState != gameStateEnum.PLAY && currentState != gameStateEnum.PAUSE) {
				return;
			}
			// if paused, lets resume game play
			if (currentState == gameStateEnum.PAUSE) {
				currentState = gameStateEnum.PLAY;
				createjs.Ticker.setPaused(false);
				return;
			}
			// otherwise, lets pause game
			currentState = gameStateEnum.PAUSE;
			createjs.Ticker.setPaused(true);
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
				
				// pause / resume on dbl click
				document.ondblclick = handleDoubleClick;
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
            // calculating the distance between the grid-lines
            var gw = w/numX;
            var gh = h/numY;

            var verticalLine = new createjs.Graphics();
            verticalLine.beginFill("rgba(2, 132, 130,0.5)");
            verticalLine.drawRect(0,0,gw * 0.02,gh*(numY+2));
            var vs;

            for ( var c = -1; c < numX+1; c++) {
                vs = new createjs.Shape(verticalLine);
                vs.snapToPixel = true;
                vs.x = c * gw;
                vs.y = -gh;
                grid.addChild(vs);
            }

            var horizontalLine = new createjs.Graphics();
            horizontalLine.beginFill("rgba(2, 132, 130,0.5)");
            horizontalLine.drawRect(0,0,gw*(numX+1),gh * 0.02);
            var hs;

            for ( c = -1; c < numY+1; c++ ) {
                hs = new createjs.Shape(horizontalLine);
                hs.snapToPixel = true;
                hs.x = 0;
                hs.y = c * gh;
                grid.addChild(hs);
            }
            return grid;
        }

        function createPixelLine(width) {

            width = Math.max(Math.round(width * scale),1);

            var vl = new createjs.Graphics();
            vl.beginFill(createjs.Graphics.getRGB(255,255,255));
            vl.drawRect(0,0,width,h);

            var lineShape = new createjs.Shape(vl);
            lineShape.snapToPixel = true;
            // the thinner the line, the less alpha
            lineShape.alpha = width * .15;
            // if it's further away, make it move slower
            lineShape.speedFactor = 0.3 + lineShape.alpha * 0.3 + Math.random() * 0.2;
            // the line will be moved back to the end of the screen
            lineShape.range = w + Math.random() * w * .3;
            // offset lines so they're all different
            lineShape.offsetX = Math.random() * w;

            return lineShape;
        }
    }

    Game.Play = Play;

}(jQuery));
