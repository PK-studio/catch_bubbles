var Game = (function(){
    var parameters = {
        screenWidth: 900,
        screenHeight: 600,
        panelHeight: 500,
        itemSize: 40
    }
    var settings = {
        intro: true,
        play: true,
        movementSpeed: 16,                         // *in millisecond. lower number is faster
        speedOffset: 30,                           // *in %, max speed up movementSpeed
        spamItemsSpeed: 150,                       // *in millisecond. lower number is faster
        spamItemsAmount: 5,
        startTime: 5,                              
        modifier: {                                // *modifies per amount of spams
            movementSpeed: 5,                      // *0-switch off
            speedOffset: 2,                        // *0-switch off
            spamItemsAmount: 10,                   // *0-switch off
            buttonsColor: 1                        // *0-switch off
        },
        color1: "rgba(255, 143, 255, 0.85)",       // *q button - match with css
        color2: "rgba(78, 236, 78, 0.85)",         // *w button - match with css
        color3: "rgba(68, 225, 251, 0.85)",        // *e button - match with css
        color4: "rgba(236, 254, 65, 0.85)"         // *r button - match with css
        // color4: "rgba(255, 255, 255, 0.05)"         // *r button - match with css
    }

    //DOM elements
    var $intro = $(".intro")
    var $logo1 = $intro.find(".logo.part1")
    var $logo2 = $intro.find(".logo.part2")
    var $logo3 = $intro.find(".logo.part3")
    var $screen = $(".screen")
    var $menu = $screen.find(".menu")
    var $allButtons = $menu.find(".color")
    var $button_q = $menu.find(".q")
    var $button_w = $menu.find(".w")
    var $button_e = $menu.find(".e")
    var $button_r = $menu.find(".r")
    var $clock = $menu.find(".clock span")
    var $score = $menu.find(".score span")
    var $dashboard = $screen.find(".dashboard")
    var $scrollTop  = $dashboard.find(".top")
    var $scrollBottom = $dashboard.find(".bottom")
    var $panelroom = $dashboard.find(".panelroom")
    var $scrollroom = $dashboard.find(".scrollroom")
    var $panel = $dashboard.find(".panel")
    var $start = $dashboard.find(".startgame")
    var $finalscreen = $screen.find(".finalscreen")
    var $finalscore = $finalscreen.find(".game_score")
    var $restart = $finalscreen.find(".restart")
    var $gameboard = $screen.find(".game_board")
    var $info = $gameboard.find(".info")
    var $item = $gameboard.find(".item")

    //Variable
    var _controler = new controlerConstructor();
    var _dashboard = new dashboardConstructor();
    var _game = new gameConstructor();
    var _difficultyCurve = new difficultyCurveConstructor();
    var timeToEnd = settings.startTime;
    var points = 0;
    var itemsArrey = [];
    var endOftheGame = false;

    //Bindings
    $scrollTop.on("click", function(){ _dashboard.scrollPanels ("top") })
    $scrollBottom.on("click", function(){ _dashboard.scrollPanels ("bottom") })
    $panel.on("click", function(){ _dashboard.chooseLvl() })
    // $start.on("click",  function(){ _game.start() })
    $restart.on("click",function(){ _game.restart()   })
    $gameboard.on("click", $item, function(e){ catchItem(e)})

    // Functionality
    var loadingScreen = (function (){
        $finalscreen.hide()
        $gameboard.hide()
        
        if(settings.intro){
            var animation = new TimelineLite()
            animation.delay(1)
            animation.to ([$logo1,$logo2], 1.6, {rotation:"0_short",ease: Bounce.easeOut, y: 300, opacity: 1}, 0)
            animation.to ($logo1, 1, {delay: .5,x: -65}, 1)
            animation.insert (new TweenLite($logo2, 1, {delay: .5, x: -80}), 1)
            animation.to ($logo3, 1, {delay: .5, x: 50, opacity: 1})
            animation.to ([$logo1, $logo2 ,$logo3], 1, {delay: 1.5,opacity: 0, onComplete: function(){
                $intro.remove()
                openGameScreen()    
            }})            
        }
        else{
            openGameScreen()
        }

        function openGameScreen(){
            if(settings.play)   _dashboard.build()
            else                {_dashboard.build();$dashboard.hide(),_game.finish()}
        }
    })()

    function dashboardConstructor(){
        var elemPosision = 0
        var scrollDist = parameters.panelHeight
        var maxScroll = scrollDist * ($scrollroom.children().length-1)
        this.build = function (){
            $screen.css("display", "flex")
            $dashboard.css("display", "flex")
        }
        this.scrollPanels = function (val){
            var calc = function(){
                if(val === "top" && elemPosision < 0 ){
                    elemPosision += scrollDist
                    return elemPosision
                }
                else if(val === "bottom" && elemPosision > -maxScroll){
                    elemPosision -= scrollDist
                    return elemPosision
                }
            }
            if(val === "top"){
                TweenLite.to($scrollroom, .6, {y: calc(),ease: Back.easeOut.config(3)})
            }
            else if(val === "bottom"){
                TweenLite.to($scrollroom, .6, {y: calc(),ease: Back.easeOut.config(3)})
            }
        }
        this.chooseLvl  = function(){
            _game.start()
        }
    }

    function gameConstructor() {
        var itemNum = 0;
        var timer = new timerConstructor();

        function timerConstructor (){
            var working;
            resetTime()
            this.startTimer = function(){ 
                working = setInterval(function(){
                    timeToEnd -= 1;
                    printTime()
                    if(timeToEnd <= 0){
                        _difficultyCurve.nextSpam()
                        resetTime()
                        spamItems();
                    }                    
                }, 1000)
            }
            this.stopTimer = function (){
                clearInterval(working)
            }
        }

        function spamItems (){
            var spamedItems = 0

            function defineX(){
                var xPosition = Math.floor((Math.random() * 1000) + 1);
                while(xPosition >= (parameters.screenWidth - parameters.itemSize)){
                    xPosition = Math.floor((Math.random() * 1000) + 1);
                }
                while(xPosition < (parameters.screenWidth - parameters.itemSize)){
                    return xPosition
                }
            }
            
            var spam = setInterval(function(){
                var yPosition = parameters.screenHeight;
                var xPosition = defineX()
                var _item = new itemConstructor(itemNum, yPosition, xPosition);
                
                itemsArrey.push(_item)
                itemNum++
                spamedItems++

                if(spamedItems === settings.spamItemsAmount){
                    clearInterval(spam)
                    spamedItems = 0
                }
            }, settings.spamItemsSpeed);
        }

        this.start = function (){
            // $screen.removeClass("background")
            $dashboard.hide()
            $finalscreen.hide()
            $gameboard.show()
            timer.startTimer()
            spamItems()
        }
        this.finish = function (){
            // $screen.addClass("background")
            itemNum = 0;
            numberOfItems = 5;
            itemsArrey.length = 0;
            timer.stopTimer()
            $gameboard.hide()
            $finalscreen.css({display: "flex"})
            $finalscore.html(points)
        }
        this.restart = function(){
            endOftheGame = false;
            _difficultyCurve.restart()
            resetTime()
            points = 0;
            printScore()
            this.start()
        }
    }

    function itemConstructor(itemNum, yPosition, xPosition) {
        // set up item parameters
        var indicator = itemNum;
        var topPosition = yPosition
        var leftPosition = xPosition
        var value = 1;
        var colorItem;
        var numForColor = Math.floor((Math.random() *10));
        switch (true) {
            case (numForColor < 2.5):
                colorItem = settings.color1
                break;
            case (numForColor < 5):
                colorItem = settings.color2
                break;
            case (numForColor < 7.5):
                colorItem = settings.color3
                break;
            case (numForColor < 10):
                colorItem = settings.color4
                break;
        }

        // render item
        var nodeConstructor = '<div class="item" id="' + indicator + '" data-value="'+ value +'" style="top:'+ topPosition + "px" +'; left:'+ leftPosition + 'px' +';background-color:'+ colorItem +'"></div>'
        $gameboard.append(nodeConstructor)

        // set up movement
        var speedUpOffset = function(){
            var num = Math.floor(Math.random() * 100)
            while(num > settings.speedOffset){
                num = Math.floor(Math.random() * 100)
            }
            while(num <= settings.speedOffset){
                return num/100 * settings.movementSpeed
            }
        }
        var movementSpeed = settings.movementSpeed - speedUpOffset()
        var moveItem = setInterval(function () {
            var $certainItem = $gameboard.find("#"+indicator)

            topPosition --
            $certainItem.css("top", topPosition + 'px')
            
            // destroy item when end of game 
            if(endOftheGame){
                clearInterval(moveItem);
                $certainItem.remove()
            }
            
            // when item hit roof
            if (topPosition === 0-parameters.itemSize) {
                endOftheGame = true;
                _game.finish()
            }

        }, movementSpeed)

        var getPoints = function(){
            points += Number(value);
            printScore()
        }

        //Give access
        this.clicked = false;
        this.indicator = indicator;
        this.color = colorItem;
        this.collectItem = function(){
            var $certainItem = $gameboard.find("#"+indicator)
            getPoints()
            TweenLite.to($certainItem, 0.3, {css: {scale: 1.3, opacity: 0}, onComplete: function(){
                clearInterval(moveItem)
                $certainItem.remove()
            }})
        }
    }

    function catchItem(e){
        var getItem = function(itemID){
            var getitem;
            itemsArrey.forEach(function(elem){
                if(elem.indicator == itemID)   getitem=elem;
            })
            return getitem
        }

        if($(e.target).hasClass("item")){
            var elemID = $(e.target).attr("id")
            var elem = getItem(elemID)
            if(elem.clicked === false){
                if(elem.color === _controler.color()){
                    elem.collectItem()
                    elem.clicked = true;
                }
            }
        }
    }

    function printScore(){
        $score.html(points)
        var animation = new TimelineLite()
        animation.to($score, .1, {css: {fontSize: 36}})
        animation.to($score, .1, {css: {fontSize: 18}})
    }

    function resetTime(){
        timeToEnd = settings.startTime
        printTime()
    }

    function printTime(){
        var display = timeToEnd <= 0 ? 0 : timeToEnd;
        $clock.html(display)
    }
    
    function difficultyCurveConstructor (){
        var numberOfSpam = 0;
        var orginalMovementSpeed = settings.movementSpeed
        var orginalspeedOffset = settings.speedOffset
        var orginalSpamItemsAmount = settings.spamItemsAmount

        function levelUp (){
            var integer_color = Number.isInteger(numberOfSpam / settings.modifier.buttonsColor)
            var integer_speed = Number.isInteger(numberOfSpam / settings.modifier.movementSpeed)
            var integer_offset = Number.isInteger(numberOfSpam / settings.modifier.speedOffset)
            var integer_amount = Number.isInteger(numberOfSpam / settings.modifier.spamItemsAmount)

            if(numberOfSpam >= 1 && integer_color){
                _controler.updateControls()
            }
            if(numberOfSpam > 1 && integer_speed){
                settings.movementSpeed --
                displaInfo("Speed Up!")
            }
            if(numberOfSpam > 1 && integer_offset){
                settings.speedOffset ++
            }
            if(numberOfSpam > 1 && integer_amount){
                settings.spamItemsAmount ++
                settings.startTime++
                displaInfo("More bubbles!")
            }

            function displaInfo(textValue){
                $info.html(textValue)
                TweenLite.fromTo($info, 2, {opacity: 1, scale: 1}, {opacity: 0, scale: 1.3})
            }
        }

        this.nextSpam = function(){
            numberOfSpam ++
            levelUp()    
        }
        this.restart = function(){
            numberOfSpam = 0
            settings.movementSpeed = orginalMovementSpeed
            settings.speedOffset = orginalspeedOffset
            settings.spamItemsAmount = orginalSpamItemsAmount
        }
    }

    function controlerConstructor(){
        var color = "none"
        
        function activeButton($btn, value, _color){
            color = _color
            if(typeof $btn === "object"){
                switch(value){
                    case "on":  if(!$btn.hasClass("active")) $btn.addClass("active"); break;
                    case "off": if($btn.hasClass("active"))  $btn.removeClass("active"); break;
                }
            }
        }
        function updateControls(){
            var animation = new TimelineLite()
            animation.to($allButtons, .3, {opacity: 0, scale: 1.5})
            animation.to($allButtons, .0, {scale: 0, onComplete: mixColors()})
            animation.to($allButtons, .2, {opacity: 1, scale: 1})
            
            function mixColors(){
                var colorDepo = [settings.color1, settings.color2, settings.color3, settings.color4]
                var btnDepo = [$button_q, $button_w, $button_e, $button_r]
                for(btn=0; btn<btnDepo.length; btn++){
                    for(colorNum=1; colorNum<=colorDepo.length; colorNum++){
                        var randomNum = Math.floor((Math.random() * 100) + 1);
                        if(randomNum <= (100/colorDepo.length)*colorNum){
                            btnDepo[btn].css("background-color", colorDepo[colorNum-1])
                            colorDepo.splice(colorNum-1,1)
                            break;
                        }
                    }
                }
            }
        }

        $(document).keydown(function(e){
            switch(e.which) {
                case 81: activeButton($button_q, "on", getColor($button_q)); break;
                case 87: activeButton($button_w, "on", getColor($button_w)); break;
                case 69: activeButton($button_e, "on", getColor($button_e)); break;
                case 82: activeButton($button_r, "on", getColor($button_r)); break;
                default: activeButton("none", "wrong button")
            }
            function getColor($btn){
                return $($btn).css("background-color")
            }
        })
        $(document).keyup(function(e){
            switch(e.which) {
                case 81: activeButton($button_q, "off", "none"); break;
                case 87: activeButton($button_w, "off", "none"); break;
                case 69: activeButton($button_e, "off", "none"); break;
                case 82: activeButton($button_r, "off", "none"); break;
                default: activeButton("none", "wrong button")
            }
        })
        
        this.color = function(){
            return color
        }
        this.updateControls = updateControls
    }
})()