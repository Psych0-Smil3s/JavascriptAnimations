this.Game = this.Game || {};

/*
 * Hero - Main User Controlled Component
 */
(function($) {

    "use strict";

        function Hero(play,image,canvas,scale) {
            this.play = play;
            this.canvas = canvas;
            this.scale = scale;
            this.initialize(image);
        }

        Hero.prototype = new createjs.Sprite();

        Hero.prototype.Sprite_initialize = Hero.prototype.initialize;

        Hero.prototype.initialize = function (image) {
            this.reset();
			
			var localSpriteSheet = new createjs.SpriteSheet({
				images: [image],
				frames: { width: 30, height: 30.8 }, // 30.875 - 30.9 messes up
				animations: {
					spin: [0, 7]
				}
			});

			this.Sprite_initialize(localSpriteSheet);

			// start playing the first sequence:
			this.gotoAndPlay("spin");     //animate

			// starting directly at the first frame of the walk_h sequence
			this.currentFrame = 0;

            this.name = 'Hero';
            this.snapToPixel = true;
        };
		
        Hero.prototype.reset = function() {
            this.velocity = {x:10*this.scale,y:25*this.scale};
            this.onGround = true;
            this.doubleJump = true;
        };

        Hero.prototype.tick = function () {
            this.velocity.y += 1 * this.scale;

            var moveBy = {x:0, y:this.velocity.y},
                collision = null,
                collideables = this.play.getCollideables();

            collision = utils.calculateCollision(this, 'y', collideables, moveBy);

            this.y += moveBy.y;

            if ( !collision ) {
                if ( this.onGround ) {
                    this.onGround = false;
                    this.doubleJump = true;
                }
            } else {
                // the hero can only be 'onGround'
                // when he's hitting floor
                if ( moveBy.y > 0 ) {
                    this.onGround = true;
                    this.doubleJump = false;
                }
                this.velocity.y = 0;
            }

            moveBy = {x:this.velocity.x, y:0};
            collision = utils.calculateCollision(this, 'x', collideables, moveBy);
            this.x += moveBy.x;
        }

        Hero.prototype.jump = function() {
            // let hero jump if on ground
            if ( this.onGround ) {
                this.velocity.y = -17 * this.scale;
                this.onGround = false;
                this.doubleJump = true;
                // let hero doublejump if in air
            } else if ( this.doubleJump ) {
                this.velocity.y = -17 * this.scale;
                this.doubleJump = false;
            }
        }

    Game.Hero = Hero;

}(jQuery));



