this.Game = this.Game || {};

/*
 * Preloader - Image and Audio
 */
(function($) {

    "use strict";

    function Preloader(o, callback, globalAssets) {

        var assets = o || new Object(),
            images = assets.images,
            audios = assets.audios;

        var queue = new createjs.LoadQueue(false);

        var PreloaderView = new Game.PreloaderView({imageURL:"img/palringo_p_50px.png",
                                                    imageID:"PalringoLogo"}, queue);

        queue.addEventListener("complete", handleComplete);
        queue.addEventListener("progress", PreloaderView.handleProgress);

        preload();

        function preload() {
            preloadImages();
            preloadSound();
            queue.load();
        }

        function preloadImages() {
            for (var i = 0, len = images.length; i < len; i++) {
                queue.loadFile({id: images[i].imageID, src: images[i].imageURL, type:createjs.LoadQueue.IMAGE});
            }
        }

        function preloadSound() {
            for (var i = 0, len = audios.length; i < len; i++) {
                queue.loadFile({id: audios[i].audioID, src: audios[i].audioSrc, type:createjs.LoadQueue.SOUND});
            }
        }

        function handleComplete() {
            for (var i = 0, len = images.length; i < len; i++) {
                var image = queue.getResult(images[i].imageID);
                image.sprite_width = image.width;
                image.sprite_height = image.height;
                image.id = images[i].imageID;
                image.src = images[i].imageURL;
                globalAssets.push(image);
            }

            for (var i = 0, len = audios.length; i < len; i++) {
                var audio = queue.getResult(audios[i].audioID);
                audio.preload = "auto";
                audio.volume = 1;
                globalAssets.push(audio);

                audio.addEventListener('ended', function(){
                    audio.pause();
                    audio.currentTime = 0;
                });
            }
            PreloaderView.explode(callback);
        }
    }

    Game.Preloader = Preloader;

}(jQuery));

/*
 * PreloaderView - Render Splash Screen
 */
(function($) {

    "use strict";

    function PreloaderView(o, preload) {

        var canvas = document.getElementById("canvas"),
            self = this,
            stage = new createjs.Stage(canvas),
            stageContainer = new createjs.Container();

            canvas.width = utils.getWidth();
            canvas.height = utils.getHeight();

        var scale = Math.min(canvas.width/BaseWidth,canvas.height/BaseHeight);

        var loadingImage = new createjs.Bitmap(o.imageURL);
            loadingImage.x = canvas.width/2  - (25 * scale) ;
            loadingImage.y = canvas.height/2 - (65 * scale) ;
            loadingImage.alpha = 0.0;
            loadingImage.scaleX = loadingImage.scaleY = scale;

        var loadProgressLabel = new createjs.Text("Loading...","14px Verdana","black");
            loadProgressLabel.lineWidth = 200;
            loadProgressLabel.textAlign = "center";
            loadProgressLabel.x = canvas.width/2;
            loadProgressLabel.y = canvas.height/2 + (20 * scale);
            loadProgressLabel.scaleX = loadProgressLabel.scaleY = scale;

        var loadingBarContainer = new createjs.Container();
        var loadingBarHeight = 10 * scale,
            loadingBarWidth = 300 * scale,
            LoadingBarColor = createjs.Graphics.getRGB(0,0,0);

        var loadingBar = new createjs.Shape();
            loadingBar.graphics.beginFill(LoadingBarColor).drawRect(0, 0, 1, loadingBarHeight).endFill();

        var frame = new createjs.Shape(),
            padding = 5 * scale;
            frame.graphics.setStrokeStyle(1).beginStroke(LoadingBarColor).drawRect(-padding/2, -padding/2, loadingBarWidth+padding, loadingBarHeight+padding);

        loadingBarContainer.addChild(loadingBar, frame);
        loadingBarContainer.x = Math.round(canvas.width/2 - loadingBarWidth/2);
        loadingBarContainer.y = Math.round(canvas.height/2 - loadingBarHeight/2);
        stage.addChild(loadingBarContainer);

        stageContainer.addChild(loadProgressLabel);
        stageContainer.addChild(loadingImage);
        stage.addChild(stageContainer);
		
		window.addEventListener('resize', resizePreloader, false); // reseize event

        this.handleProgress = function() {

            loadingBar.scaleX = preload.progress * loadingBarWidth;
            loadingImage.alpha = preload.progress;
            stage.update();
        }

        this.explode = function(callback) {

            createjs.Tween.get(loadProgressLabel).to({x:canvas.width + 50 * scale},1000,createjs.Ease.circOut);
            createjs.Tween.get(loadingBarContainer).to({x:-loadingBarWidth - 50 * scale},1000,createjs.Ease.circOut);
            createjs.Tween.get(loadingImage).wait(100)
                .to({scaleX:1.2 * scale,scaleY:1.2 * scale},1000,createjs.Ease.bounceOut)
                .call(clearStage);
            createjs.Ticker.setFPS(50);
            createjs.Ticker.addEventListener("tick", stage);

            function clearStage() {

                createjs.Tween.get(loadingImage).to({alpha:0, visible:false},300);
                $('.canvas.preload').animate({opacity:0}, 500, function() {
                    $(this).removeClass('preload');
                    stage.removeAllChildren();
                    stage.update();
                    callback();
                });
                createjs.Ticker.removeEventListener("tick", stage);
                $('.canvas').animate({opacity:1}, 500);
            }
			
			// the window event listener remains attached always, we could remove it here, but this seems to not work after a refresh, so leave it attached - it wont affect game 
			//window.removeEventListener('resize', resizePreloader, false);
        }
		
		function resizePreloader() { 
		    // experiment with these values to get a responsive preloader - so far, image is responsive and so is loading text and bar - but their positions
			// when moving across screen isn't spot on
			
			// remove all children from containers, and reset their x / y
			stageContainer.removeAllChildren();
            stageContainer.x = stageContainer.y = 0;
			
			loadingBarContainer.removeAllChildren();
            loadingBarContainer.x = loadingBarContainer.y = 0;
			
			// get canvas width / height and scale
			canvas.width = utils.getWidth();
            canvas.height = utils.getHeight();

			scale = Math.min(canvas.width/BaseWidth,canvas.height/BaseHeight);

			//for some reason, with the image, always have to re-draw it for it to scale (scaling existing one doesn't work)
			loadingImage = new createjs.Bitmap(o.imageURL);
			loadingImage.x = canvas.width/2  - (25 * scale) ;
			loadingImage.y = canvas.height/2 - (65 * scale) ;
			//loadingImage.alpha = 0.0; -- this makes it invisible
			loadingImage.scaleX = loadingImage.scaleY = scale;

			// use existing progress label
			//loadProgressLabel = new createjs.Text("Loading...","14px Verdana","black");
			loadProgressLabel.lineWidth = 200;
			loadProgressLabel.textAlign = "center";
			loadProgressLabel.x = canvas.width/2;
			loadProgressLabel.y = canvas.height/2 + (20 * scale);
			loadProgressLabel.scaleX = loadProgressLabel.scaleY = scale;

			// use existing loading bar
			//loadingBarContainer = new createjs.Container();
			loadingBarHeight = 10 * scale;
			loadingBarWidth = 300 * scale;
			LoadingBarColor = createjs.Graphics.getRGB(0,0,0);

			//loadingBar = new createjs.Shape();
			//loadingBar.graphics.beginFill(LoadingBarColor).drawRect(0, 0, 1, loadingBarHeight).endFill();

			frame = new createjs.Shape(),
			padding = 5 * scale;
			frame.graphics.setStrokeStyle(1).beginStroke(LoadingBarColor).drawRect(-padding/2, -padding/2, loadingBarWidth+padding, loadingBarHeight+padding);

			loadingBarContainer.addChild(loadingBar, frame);
			loadingBarContainer.x = Math.round(canvas.width/2 - loadingBarWidth/2);
			loadingBarContainer.y = Math.round(canvas.height/2 - loadingBarHeight/2);
			stage.addChild(loadingBarContainer);

			stageContainer.addChild(loadProgressLabel);
			stageContainer.addChild(loadingImage);
			stage.addChild(stageContainer);
			
			stage.update();
		}
    }

    Game.PreloaderView = PreloaderView;

}(jQuery));