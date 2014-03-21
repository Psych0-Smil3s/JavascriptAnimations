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

        Hero.prototype = new createjs.Bitmap();

        Hero.prototype.Bitmap_initialize = Hero.prototype.initialize;

        Hero.prototype.initialize = function (image) {
            this.reset();

            this.Bitmap_initialize(image);
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

            // preparing the variables
            var moveBy = {x:0, y:this.velocity.y},
                collision = null,
                collideables = this.play.getCollideables();

            collision = utils.calculateCollision(this, 'y', collideables, moveBy);
            // moveBy is now handled by 'calculateCollision'
            // and can also be 0 - therefore we won't have to worry
            this.y += moveBy.y;

            if ( !collision ) {
                if ( this.onGround ) {
                    this.onGround = false;
                    this.doubleJump = true;
                }
            } else {
                // the hero can only be 'onGround'
                // when he's hitting floor and not
                // some ceiling
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
            // if the hero is "on the ground"
            // let him jump, physically correct!
            if ( this.onGround ) {
                this.velocity.y = -17 * this.scale;
                this.onGround = false;
                this.doubleJump = true;
                // we want the hero to be able to
                // jump once more when he is in the
                // air - after that, he has to wait
                // to lang somewhere on the ground
            } else if ( this.doubleJump ) {
                this.velocity.y = -17 * this.scale;
                this.doubleJump = false;
            }
        }

    Game.Hero = Hero;

}(jQuery));



