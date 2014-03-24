this.Game = this.Game || {};

/*
 * Score - Score Functions
 */
(function($) {

    "use strict";

    function Score(scale, container) {
	
		var timerCount = null,
			counter = null,
			displayScore = null,
			displayText = null,
			d2 = null,
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
                    timerCount.outline = 10 * self.scale;
					timerCount.x = w - (100 * self.scale);
					timerCount.y = self.scale;
					timerCount.scaleX = timerCount.scaleY = self.scale;

                    var t2 = timerCount.clone();
                    t2.outline = false;
                    t2.color = "white";

					container.addChild(timerCount,t2);

                    if (self.Total !== 0 && self.Total % 5 === 0){
                        createjs.Tween.get(timerCount)
                            .to({scaleX:0.3 * self.scale,scaleY:0.3 * self.scale})
                            .to({rotation: 360 }, 300, createjs.Ease.linear)
                            .to({scaleX:1.3 * self.scale,scaleY:1.3 * self.scale}, 300, createjs.Ease.backOut)
                            .to({alpha:0}, 100);
                        t2.color = "red";
                        createjs.Tween.get(t2)
                            .to({scaleX:0.3 * self.scale,scaleY:0.3 * self.scale})
                            .to({rotation: 360 }, 300, createjs.Ease.linear)
                            .to({scaleX:1.3 * self.scale,scaleY:1.3 * self.scale}, 300, createjs.Ease.backOut)
                            .to({alpha:0}, 300);
                    }
				    else {
                    createjs.Tween.get(timerCount)
                        .to({scaleX:1 * self.scale,scaleY:1 * self.scale})
                        .wait(100)
                        .to({scaleX:0.8 * self.scale,scaleY:0.8 * self.scale},100,createjs.Ease.linear)
                        .wait(100)
                        .to({scaleX:1 * self.scale,scaleY:1 * self.scale},100,createjs.Ease.linear)
                        .to({alpha:0}, 200);
                    createjs.Tween.get(t2)
                        .to({scaleX:1 * self.scale,scaleY:1 * self.scale})
                        .wait(100)
                        .to({scaleX:0.8 * self.scale,scaleY:0.8 * self.scale},100,createjs.Ease.linear)
                        .wait(100)
                        .to({scaleX:1 * self.scale,scaleY:1 * self.scale},100,createjs.Ease.linear)
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
		
		this.IsScoreVisible = function() {
			return displayScore != null;
		}
		
		this.ClearScore = function() {
			container.removeChild(displayScore);
			container.removeChild(d2);
			container.removeChild(displayText);
			displayScore = null;
		}
		
		this.SetFinishDisplay = function() {
			// display 1 less than the Total, as this will have been incremented but not yet displayed! (unless 0);
			var scoreToDisplay = this.Total > 0 ? this.Total - 1 : 0;

			var w = utils.getWidth();
			var h = utils.getHeight();
			
			displayText = new createjs.Text("Seconds!","50px Impact","black");
			displayText.lineWidth = 200;
			displayText.textAlign = "center";
			displayText.x = w/2;
			displayText.y = h/2;
			displayText.scaleX = displayText.scaleY = this.scale;

            createjs.Tween.get(displayText,{loop:true})
                .to({scaleX:1.1 * self.scale,scaleY:1.1 * self.scale},200,createjs.Ease.linear)
                .wait(1000)
                .to({scaleX:1 * self.scale,scaleY:1 * self.scale},200,createjs.Ease.linear);

			displayScore = new createjs.Text(scoreToDisplay,"100px Impact","white");
			displayScore.lineWidth = 200;
			displayScore.textAlign = "center";
			displayScore.outline = 8 * this.scale;
			displayScore.x = w/2;
			displayScore.y = h/2 - (100 * this.scale);
			displayScore.scaleX = displayScore.scaleY = this.scale;

			d2 = displayScore.clone();
			d2.outline = false;
			d2.color = "black";

            createjs.Tween.get(displayScore,{loop:true})
                .to({scaleX:1.1 * self.scale,scaleY:1.1 * self.scale},200,createjs.Ease.linear)
                .wait(1000)
                .to({scaleX:1 * self.scale,scaleY:1 * self.scale},200,createjs.Ease.linear);
            createjs.Tween.get(d2,{loop:true})
                .to({scaleX:1.1 * self.scale,scaleY:1.1 * self.scale},200,createjs.Ease.linear)
                .wait(1000)
                .to({scaleX:1 * self.scale,scaleY:1 * self.scale},200,createjs.Ease.linear);
			
			container.addChild(displayScore);
			container.addChild(d2);
			container.addChild(displayText);
		}
	
	}
	
	Game.Score = Score;
	
}(jQuery));