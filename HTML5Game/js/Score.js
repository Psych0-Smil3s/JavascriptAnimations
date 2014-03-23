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
					
		this.StartTimer = function() {
		
			if (counter == null) {
				
				var w = utils.getWidth();
				var h = utils.getHeight();
				
				counter = setInterval(function() {
					container.removeChild(timerCount);
					timerCount = new createjs.Text(self.Total,"100px Impact","white");
					timerCount.lineWidth = 200;
					timerCount.textAlign = "center";
					timerCount.x = w - (100 * scale);
					timerCount.y = scale;
					timerCount.scaleX = timerCount.scaleY = scale;
					container.addChild(timerCount);
					createjs.Tween.get(timerCount).to({scaleX:1.3 * scale,scaleY:1.3 * scale},200,createjs.Ease.linear).to({alpha:0}, 200);
					
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