var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var gameState;
    var score = 0;
    var gameTimer;
    var remainingTime;
    var dataArray = [{
        image: "images/egg.png",
        text: "egg"
    }, {
        image: "images/mushroom.png",
        text: "mushroom"
    }
    ];
    var range = _.range(_.size(dataArray));
    var currentData;
    var selectedLetters = [];
    var ALL_LETTERS = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'];

    // declare CONSTANTS
    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    this.init = function() {
        window.addEventListener("resize", this.onResize.bind(this), false);
        this.initGame();
    };

    this.loadData = function() {
        var self = this;

        var index = _.sample(range);
        range = _.without(range, index);

        selectedLetters = [];
        currentData = dataArray[index];
        var letters = currentData.text.split('');
        letters = _.shuffle(
            letters.concat(
                _.sample(
                    _.difference(ALL_LETTERS, letters), 16 - letters.length
                )
            )
        );

        $(".game-grid").html("");
        _.each(letters, function(letter) {
            $(".game-grid").append("<li><div class='content animated fadeIn'>" + letter + "</li>");
        });
        this.onResize();

        $('html, body').scrollTop($("#panel-container").offset().top);

        remainingTime = 999999;
        $("#timer-value").html(Math.ceil(remainingTime));
        $("#timer-value").removeClass("animated fadeIn");

        $("#image-to-guess").attr('src', currentData.image);

        swal({
            title: "Guess!",
            text: "a " + currentData.text.length + "-letter word",
            imageUrl: currentData.image
        }, function() {
            (function countdown() {
                remainingTime -= 0.5;
                $("#timer-value").html(Math.ceil(remainingTime));
                $("#timer-value").addClass("animated fadeIn");
                $("#score-value").html(score);

                if (remainingTime <= 0) {
                    clearTimeout(gameTimer);

                    $("#result-content")
                        .html("Time's up!")
                        .addClass('animated bounceIn')
                        .css("color", "rgba(17, 189, 255, 255)");
                    $("#timer-value").removeClass("animated fadeIn");

                    self.loadNextRound();
                } else {
                    gameTimer = setTimeout(countdown, 500);
                }
            })();
        });

        this.loadSelectedLetters();

        $("ul.game-grid li").click(function() {

            if ($(this).hasClass("selected")) {
                $(this).removeClass("selected");

                var selectedNumber = $(this).attr("data-number");
                selectedLetters.splice(selectedNumber - 1, 1);

                _.each(_.filter($("ul.game-grid li"), function(li) {
                    return $(li).attr("data-number") > selectedNumber;
                }), function(li) {
                    $(li).attr("data-number", parseInt($(li).attr("data-number")) - 1);
                });

                self.loadSelectedLetters();
            }
            else {
                $(this).addClass("selected");

                var selectedLetter = $(this.firstChild).html();
                selectedLetters.push(selectedLetter);

                $(this).attr("data-number", selectedLetters.length);

                self.loadSelectedLetters();
                self.checkResult();

//                if (selectedLetter == correctAnswer[nextCorrectAnswerIndex]) {
//                    nextCorrectAnswerIndex++;
//
//                    if (nextCorrectAnswerIndex >= correctAnswer.length) {
//
//                    }
                }
//                else {
//                $("#result-content")
//                    .html("Wrong!")
//                    .addClass('animated bounceIn')
//                    .css("color", "rgba(255, 0, 0, 255)");
//
//                score -= remainingTime * 10;
//                $(".score-change")
//                    .html("-" + remainingTime * 10)
//                    .css("color", "rgba(255, 0, 0, 255)");
//                }


//            }
        });
    };

    this.loadSelectedLetters = function() {
        $(".game-letters span").remove();

        _.each(selectedLetters, function(letter) {
            $(".game-letters").append("<span>" + letter + "</span>");
        });

        var correctAnswerLength = currentData.text.split('').length;
        var numEmpty =  correctAnswerLength - selectedLetters.length;
        _.times(numEmpty, function() {
            $(".game-letters").append("<span>&nbsp;&nbsp;&nbsp;&nbsp;</span>");
        });
    };

    this.checkResult = function() {
        if (_.isEqual(selectedLetters, currentData.text.split(''))) {
            $("#result-content")
                .html("Correct!")
                .addClass('animated bounceIn')
                .css("color", "rgba(0, 255, 0, 255)");

            score += remainingTime * 10;
            $(".score-change")
                .html("+" + remainingTime * 10)
                .css("color", "rgba(0, 255, 0, 255)");

            $("#timer-value").removeClass("animated fadeIn");
            $("#score-value").html(score);
            $(".score-change").animate({
                top: '-25px'
            }, {
                duration: 1000,
                complete: function() {
                    $(".score-change")
                        .html("")
                        .css("top", "-10px");
                }
            });
            clearTimeout(gameTimer);
            this.loadNextRound();
        }
    };

    this.loadNextRound = function() {
        var self = this;

        var gameGrid = $("ul.game-grid");
        $("#result")
            .width(gameGrid.width())
            .height(gameGrid.height())
            .show();

        _.delay(function() {
            $("#result").hide();

            if (_.size(range) > 0) {
                self.loadData();
            } else {
                self.endGame();
            }
        }, 1000);
    };

    this.onResize = function(event) {
        var lis = $(".game-grid").children("li");

        var liMaxWidth = _.max(lis, function(li) {
            return $(li).width();
        });
        var maxWidth = $(liMaxWidth).width();

        _.each(lis, function(li) {
            $(li).height(maxWidth);
        });
    };

    // game status operation
    this.initGame = function() {
        gameState = GAME_STATE_ENUM.INITIAL;

        var self = this;
        $(".icon-repeat").click(function() {
            self.startGame();
        });
    };

    this.startGame = function() {
        gameState = GAME_STATE_ENUM.START;
        score = 0;
        range = _.range(_.size(dataArray));
        $("#timer").show();
        $("#replay").hide();

        this.loadData();
    };

    this.endGame = function() {
        gameState = GAME_STATE_ENUM.END;

        var html = "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";

        html += "<li><div class='content'>G</div></li>";
        html += "<li><div class='content'>A</div></li>";
        html += "<li><div class='content'>M</div></li>";
        html += "<li><div class='content'>E</div></li>";

        html += "<li><div class='content'>O</div></li>";
        html += "<li><div class='content'>V</div></li>";
        html += "<li><div class='content'>E</div></li>";
        html += "<li><div class='content'>R</div></li>";

        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";
        html += "<li><div class='content'>#</div></li>";

        $(".game-grid").html(html);
        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);
        this.onResize();
        $('html, body').scrollTop($("#panel-container").offset().top);

        swal({ title: "Congratulations!",
            text: "Your score is " + score + "! :D",
            imageUrl: "images/oo0oo.png"
        });
    };

    // check game state
    this.isGameStateInitial = function() {
        return gameState == GAME_STATE_ENUM.INITIAL;
    };

    this.isGameStateStart = function() {
        return gameState == GAME_STATE_ENUM.START;
    };

    this.isGameStateEnd = function() {
        return gameState == GAME_STATE_ENUM.END;
    };
};