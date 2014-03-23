this.Game = this.Game || {};

/*
 * Score - Score Functions
 */
(function($) {

    "use strict";

    function Score(scale, container) {
	
		var timerCount = null,
			counter = null,
			self = this;

		this.Total = 0; // this will remember score when timer is killed (resets when timer is re-started)
        this.scale = scale; // set the scale in play.reset()

		this.StartTimer = function() {
		
			if (counter == null) {
				
				var w = utils.getWidth();
				var h = utils.getHeight();
				
				counter = setInterval(function() {
					container.removeChild(timerCount);
					timerCount = new createjs.Text(self.Total,"100px Impact","black");
					timerCount.lineWidth = 200;
					timerCount.textAlign = "center";
                    timerCount.outline = 8;
					timerCount.x = w - (100 * self.scale);
					timerCount.y = self.scale;
					timerCount.scaleX = timerCount.scaleY = self.scale;

                    var t2 = timerCount.clone();
                    t2.outline = false;
                    t2.color = "white";

					container.addChild(timerCount,t2);

                    if (self.Total !== 0 && self.Total % 5 === 0){
                        createjs.Tween.get(timerCount)
                            .to({scaleX:0.2,scaleY:0.2})
                            .to({rotation: 360 }, 300, createjs.Ease.linear)
                            .to({scaleX:1.2,scaleY:1.2}, 300, createjs.Ease.backOut)
                            .to({alpha:0}, 100);
                        t2.color = "red";
                        createjs.Tween.get(t2)
                            .to({scaleX:0.2,scaleY:0.2})
                            .to({rotation: 360 }, 300, createjs.Ease.linear)
                            .to({scaleX:1.2,scaleY:1.2}, 300, createjs.Ease.backOut)
                            .to({alpha:0}, 300);
                    }
				    else {
                    createjs.Tween.get(timerCount)
                        .to({scaleX:1,scaleY:1})
                        .wait(100)
                        .to({scaleX:0.8,scaleY:0.8},100,createjs.Ease.linear)
                        .wait(100)
                        .to({scaleX:1,scaleY:1},100,createjs.Ease.linear)
                        .to({alpha:0}, 200);
                    createjs.Tween.get(t2)
                        .to({scaleX:1,scaleY:1})
                        .wait(100)
                        .to({scaleX:0.8,scaleY:0.8},100,createjs.Ease.linear)
                        .wait(100)
                        .to({scaleX:1,scaleY:1},100,createjs.Ease.linear)
                        .to({alpha:0}, 400);
                    }

                    self.Total = self.Total + 1;
				}, 1000);
			}
		}
				
		this.KillTimer = function() {
			clearInterval(counter);
			counter = null;
		}
	
	}
	
	Game.Score = Score;
	
}(jQuery));