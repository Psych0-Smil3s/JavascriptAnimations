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

        var PreloaderView = new Game.PreloaderView({imageURL:"http://media.parlingo.com/website/live/messagepacks/plaudits/X2/clap1_1x70.png",
                                                    imageID:"BooHissImg"}, queue);

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
                queue.loadFile({id: images[i].imageID, src: images[i].imageURL, frameCount: images[i].frameCount || 1, type:createjs.LoadQueue.IMAGE});
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
                image.sprite_height = image.height / image.frameCount;
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
            $('.canvas.preload').animate({opacity:0}, 500, function() {
                $(this).removeClass('preload');
            });
            PreloaderView.explode();
            callback();
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
            stage = new createjs.Stage(canvas);

        var loadProgressLabel = new createjs.Text("Loading...","18px Verdana","black");
            loadProgressLabel.lineWidth = 200;
            loadProgressLabel.textAlign = "center";
            loadProgressLabel.x = canvas.width/2;
            loadProgressLabel.y = canvas.height/2 - 50;
            stage.addChild(loadProgressLabel);

        var loadingBarContainer = new createjs.Container();
        var loadingBarHeight = 20,
            loadingBarWidth = 300,
            LoadingBarColor = createjs.Graphics.getRGB(0,0,0);

        var loadingBar = new createjs.Shape();
            loadingBar.graphics.beginFill(LoadingBarColor).drawRect(0, 0, 1, loadingBarHeight).endFill();

        var frame = new createjs.Shape(),
            padding = 3;
            frame.graphics.setStrokeStyle(1).beginStroke(LoadingBarColor).drawRect(-padding/2, -padding/2, loadingBarWidth+padding, loadingBarHeight+padding);

        loadingBarContainer.addChild(loadingBar, frame);
        loadingBarContainer.x = Math.round(canvas.width/2 - loadingBarWidth/2);
        loadingBarContainer.y = Math.round(canvas.height/2 - loadingBarHeight/2);
        stage.addChild(loadingBarContainer);

        this.handleProgress = function() {

            loadingBar.scaleX = preload.progress * loadingBarWidth;
            stage.update();
        }

        this.explode = function() {
            stage.clear();
        }
    }

    Game.PreloaderView = PreloaderView;

}(jQuery));