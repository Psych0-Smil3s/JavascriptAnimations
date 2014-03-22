this.Game = this.Game || {};

/*
 * Utils - Utility Functions
 */
(function($) {

    "use strict";

    function Utils() {

        /*
         * Calculated the boundaries of an object.
         *
         */
        this.getBounds = function(obj, rounded) {
            var bounds={x:Infinity,y:Infinity,width:0,height:0};

            if ( obj instanceof createjs.Container ) {
                var children = object.children, l=children.length, cbounds, c;
                for ( c = 0; c < l; c++ ) {
                    cbounds = getBounds(children[c]);
                    if ( cbounds.x < bounds.x ) bounds.x = cbounds.x;
                    if ( cbounds.y < bounds.y ) bounds.y = cbounds.y;
                    if ( cbounds.width > bounds.width ) bounds.width = cbounds.width;
                    if ( cbounds.height > bounds.height ) bounds.height = cbounds.height;
                }
            } else {
                var gp,imgr;
                if ( obj instanceof createjs.Bitmap ) {
                    gp = obj.localToGlobal(0,0);
                    imgr = {width:obj.image.width,height:obj.image.height};
                } else if ( obj instanceof createjs.SpriteSheet ) {
                    gp = obj.localToGlobal(0,0);
                    imgr = obj.spriteSheet._frames[obj.currentFrame];
                } else {
                    return bounds;
                }

                bounds.width = imgr.width * Math.abs(obj.scaleX);
                if ( obj.scaleX >= 0 ) {
                    bounds.x = gp.x;
                } else {
                    bounds.x = gp.x - bounds.width;
                }

                bounds.height = imgr.height * Math.abs(obj.scaleY);
                if ( obj.scaleX >= 0 ) {
                    bounds.y = gp.y;
                } else {
                    bounds.y = gp.y - bounds.height;
                }
            }
            if ( rounded ) {
                bounds.x = (bounds.x + (bounds.x > 0 ? .5 : -.5)) | 0;
                bounds.y = (bounds.y + (bounds.y > 0 ? .5 : -.5)) | 0;
                bounds.width = (bounds.width + (bounds.width > 0 ? .5 : -.5)) | 0;
                bounds.height = (bounds.height + (bounds.height > 0 ? .5 : -.5)) | 0;
            }
            return bounds;
        }

        /*
         * Calculate the boundaries of an object.
         */
        this.calculateIntersection = function(rect1, rect2, x, y)
        {

            x = x || 0; y = y || 0;

            // calculate the center of each rectangle and half of width and height
            var dx, dy, r1={}, r2={};
            r1.cx = rect1.x+x+(r1.hw = (rect1.width /2));
            r1.cy = rect1.y+y+(r1.hh = (rect1.height/2));
            r2.cx = rect2.x + (r2.hw = (rect2.width /2));
            r2.cy = rect2.y + (r2.hh = (rect2.height/2));

            dx = Math.abs(r1.cx-r2.cx) - (r1.hw + r2.hw);
            dy = Math.abs(r1.cy-r2.cy) - (r1.hh + r2.hh);

            if (dx < 0 && dy < 0) {
                return {width:-dx,height:-dy};
            } else {
                return null;
            }
        }

        /*
         * Calculate object collision (Generic rectangle collision)
         */
        this.calculateCollision = function(obj, direction, collideables, moveBy) {
            moveBy = moveBy || {x:0,y:0};
            if ( direction != 'x' && direction != 'y' ) {
                direction = 'x';
            }
            var measure = direction == 'x' ? 'width' : 'height',
                oppositeDirection = direction == 'x' ? 'y' : 'x',
                oppositeMeasure = direction == 'x' ? 'height' : 'width',

                bounds = utils.getBounds(obj, true),
                cbounds,
                collision = null,
                cc = 0;

            while ( !collision && cc < collideables.length ) {
                cbounds = utils.getBounds(collideables[cc],true);
                if ( collideables[cc].isVisible ) {
                    collision = utils.calculateIntersection(bounds, cbounds, moveBy.x, moveBy.y);
                }

                if ( !collision && collideables[cc].isVisible ) {

                    var wentThroughForwards  = ( bounds[direction] < cbounds[direction] && bounds[direction] + moveBy[direction] > cbounds[direction] ),
                        wentThroughBackwards = ( bounds[direction] > cbounds[direction] && bounds[direction] + moveBy[direction] < cbounds[direction] ),
                        withinOppositeBounds = !(bounds[oppositeDirection]+bounds[oppositeMeasure] < cbounds[oppositeDirection])
                            && !(bounds[oppositeDirection] > cbounds[oppositeDirection]+cbounds[oppositeMeasure]);

                    if ( (wentThroughForwards || wentThroughBackwards) && withinOppositeBounds ) {
                        moveBy[direction] = cbounds[direction] - bounds[direction];
                    } else {
                        cc++;
                    }
                }
            }

            if ( collision ) {
                var sign = Math.abs(moveBy[direction]) / moveBy[direction];
                moveBy[direction] -= collision[measure] * sign;
            }

            return collision;
        }

        /*
         * Get viewport width.
         */
        this.getWidth = function() {
            if( typeof( window.innerWidth ) == 'number' ) {
                return window.innerWidth / 2;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                return document.documentElement.clientWidth / 2;
            } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
                return document.body.clientWidth / 2;
            }
        }

        /*
         * Get viewport height.
         */
        this.getHeight = function() {
            if( typeof( window.innerWidth ) == 'number' ) {
                return window.innerHeight / 2;
            } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
                return document.documentElement.clientHeight / 2;
            } else if( document.body && ( document.body.clientHeight || document.body.clientHeight ) ) {
                return document.body.clientHeight / 2;
            }
        }
    }

    Game.Utils = Utils;

}(jQuery));