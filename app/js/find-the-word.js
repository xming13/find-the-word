var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var windowWidth = 0;
    var gameState;
    var gameTimer;
    var remainingTime;
    var score = 0;

    var dataArray = [{
        image: "images/egg.png",
        text: "egg",
        title: "I come first before chicken!",
        subtitle: "Some disagree."
    }, {
        image: "images/chicken.png",
        text: "chicken",
        title: "I come first before egg!",
        subtitle: "Most agree."
    }, {
        image: "images/mushroom.png",
        text: "mushroom",
        title: "Beware!",
        subtitle: "Mario's size doubles when consumed."
    }, {
        image: "images/apple.png",
        text: "apple",
        title: "I fell on Newton's head!",
        subtitle: "Snow White couldn't resist me!"
    }, {
        image: "images/banana.png",
        text: "banana",
        title: "I split",
        subtitle: "Minions love me!"
    }, {
        image: "images/carrot.png",
        text: "carrot",
        title: "Me!",
        subtitle: "or stick? >:D"
    }, {
        image: "images/orange.png",
        text: "orange",
        title: "A colour?\n a fruit?",
        subtitle: "The colour is the fruit.\nThe fruit is the colour."
    }, {
        image: "images/hellokitty.png",
        text: "hellokitty",
        title: "A cat without mouth?",
        subtitle: "never was a cat!"
    }, {
        image: "images/snoopy.png",
        text: "snoopy",
        title: "A dog?",
        subtitle: "Yes, Peanuts has confirmed"
    }, {
        image: "images/pig.png",
        text: "pig",
        title: "What is life?",
        subtitle: "Eat. Play. Sleep."
    }, {
        image: "images/fish.png",
        text: "fish",
        title: "Sea survival tips",
        subtitle: "Hunt the smaller ones!\nAvoid the bigger ones!"
    }];

    var range = _.range(_.size(dataArray));
    var currentData;
    var selectedLetters = [];

    var injectedStyleDiv;

    var ALL_LETTERS = [
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z'
    ];
    var GAME_STATE_ENUM = {
        INITIAL: "initial",
        START: "start",
        PAUSE: "pause",
        END: "end"
    };

    this.setupGrid = function() {
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

    };

    this.setupGameNode = function() {
        var self = this;

        this.setupGrid();

        remainingTime = 10.5;
        $("#timer-value").html(Math.floor(remainingTime))
            .removeClass("animated fadeIn");

        $("#image-to-guess").attr('src', currentData.image);

        swal({
            title: currentData.title,
            text: currentData.subtitle + "\n\n(" + currentData.text.length + "-letter word)",
            imageUrl: currentData.image,
            confirmButtonColor: '#c36fff',
            closeOnCancel: false
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

                    self.setupNextRound();
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
            } else {
                if (selectedLetters.length < currentData.text.split('').length) {
                    $(this).addClass("selected");

                    var selectedLetter = $(this.firstChild).html();
                    selectedLetters.push(selectedLetter);

                    $(this).attr("data-number", selectedLetters.length);

                    self.loadSelectedLetters();
                    self.checkResult();
                }
            }
        });
    };

    this.loadSelectedLetters = function() {
        $(".game-letters span").remove();

        _.each(selectedLetters, function(letter) {
            $(".game-letters").append("<span>" + letter + "</span>");
        });

        var correctAnswerLength = currentData.text.split('').length;
        var numEmpty = correctAnswerLength - selectedLetters.length;
        _.times(numEmpty, function() {
            $(".game-letters").append("<span>&nbsp;&nbsp;&nbsp;</span>");
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
            this.setupNextRound();
        } else {
            if (selectedLetters.length == currentData.text.split('').length) {
                $(".game-letters").addClass("animated shake answer-wrong");
                $('.game-letters').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                    $(this).removeClass("animated shake answer-wrong");
                });
            }
        }
    };

    this.setupNextRound = function() {
        var self = this;

        var gameGrid = $("ul.game-grid");
        $("#result")
            .width(gameGrid.width())
            .height(gameGrid.height())
            .show();

        _.delay(function() {
            $("#result").hide();

            if (_.size(range) > 0) {
                self.setupGameNode();
            } else {
                self.endGame();
            }
        }, 1000);
    };

    this.onResize = function() {
        if ($(window).width() != windowWidth) {
            windowWidth = $(window).width();

            if (injectedStyleDiv) {
                injectedStyleDiv.html("");
            }

            var lis = $(".game-grid").children("li");

            var liMaxWidth = _.max(lis, function(li) {
                return $(li).width();
            });
            var maxWidth = $(liMaxWidth).width();

            var styles = "<style>";
            styles += " ul.game-grid { width: " + (maxWidth * 4) + "px; } ";
            styles += " .game-grid li { height: " + maxWidth + "px; width: " + maxWidth + "px; } ";
            styles += " .game-grid li .content { font-size: " + (maxWidth * 0.5) + "px; } ";
            styles += " #result-content { font-size: " + (maxWidth * 0.8) + "px; } ";
            styles += " .game-letters span { font-size: " + (maxWidth * 0.2) + "px; margin-left: " + (maxWidth * 0.1) + "px; } ";
            styles += "</style>";

            if (injectedStyleDiv) {
                injectedStyleDiv.html(styles);
            } else {
                injectedStyleDiv = $("<div />", {
                    html: styles
                }).appendTo("body");
            }
        }
    };

    this.preloadImage = function() {

        _.each(dataArray, function(data) {
            var img = new Image();
            img.src = data.image;
        })
        var imgLove = new Image();
        imgLove.src = "images/love.png";
    };

    // Game status operation
    this.initGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.INITIAL;

        this.preloadImage();

        window.addEventListener("resize", this.onResize.bind(this), false);

        FastClick.attach(document.body, {
            tapDelay: 100
        });

        $(".btn-play").click(function() {
            self.startGame();
        });

        $(".btn-leaderboard").click(function() {
            self.showLeaderboard();
        });

        $(".icon-back").click(function() {
            $(".panel-game").hide();
            $(".panel-leaderboard").hide();
            $(".panel-main").show();
        });

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

        $(".panel-main").hide();
        $(".panel-game").show();
        $('html, body').animate({
            scrollTop: $(".panel-container").offset().top
        }, 'fast');

        // set to 0 to force resize
        windowWidth = 0;
        this.onResize();
        this.setupGameNode();
    };
    this.endGame = function() {
        gameState = GAME_STATE_ENUM.END;

        var self = this;

        $("#image-to-guess").attr('src', "images/word-grid.png");
        selectedLetters = [];
        currentData = {
            image: "images/word-grid.png",
            text: "GAMELOVER"
        };
        this.loadSelectedLetters();

        $(".game-grid").html("");

        var letters = ["G", "A", "M", "E", "O", "V", "E", "R", "L"];
        _.times(7, function() {
            letters.push("#");
        });
        _.each(_.shuffle(letters), function(letter) {
            $(".game-grid").append("<li><div class='content animated fadeIn'>" + letter + "</li>");
        });

        $("#timer").hide();
        $("#replay").show();
        $("#score-value").html(score);

        swal({
            title: "Congratulations!",
            text: "Your score is " + score + "! :D",
            imageUrl: "images/word-grid.png",
            confirmButtonColor: '#c36fff',
            closeOnConfirm: false
        }, function() {
            swal({
                title: "Thanks for playing!!!",
                imageUrl: "images/love.png",
                type: "input",
                text: "Write your name here! It will appear in the leaderboard!",
                confirmButtonColor: '#c36fff',
                closeOnConfirm: false
            }, function(playerName) {
                if (playerName == "") {
                    swal.showInputError("You need to write something! A nickname is fine too!");
                    return false;
                } else {
                    $.ajax({
                        method: "POST",
                        url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                        contentType: "application/json",
                        data: JSON.stringify({
                            game_id: 6,
                            username: playerName,
                            score: score
                        })
                    }).success(function(data) {
                        swal({
                            title: "Congratulations!",
                            text: "You are currently ranked " + data.rank_text + "!",
                            type: "success",
                            confirmButtonColor: '#c36fff'
                        });
                    }).fail(function() {
                        swal({
                            title: "Oops...",
                            text: "Something went wrong!",
                            type: "error",
                            confirmButtonColor: '#c36fff'
                        });
                    });
                }
            });
        });

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
            } else {
                if (selectedLetters.length < currentData.text.split('').length) {
                    $(this).addClass("selected");

                    var selectedLetter = $(this.firstChild).html();
                    selectedLetters.push(selectedLetter);

                    $(this).attr("data-number", selectedLetters.length);

                    self.loadSelectedLetters();
                    if (_.isEqual(selectedLetters, currentData.text.split(''))) {
                        swal({
                            title: "Thanks for playing again!!!",
                            imageUrl: "images/love.png"
                        });
                    } else {
                        if (selectedLetters.length == currentData.text.split('').length) {
                            $(".game-letters").addClass("animated shake answer-wrong");
                            $('.game-letters').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                                $(this).removeClass("animated shake answer-wrong");
                            });
                        }
                    }
                }
            }
        });
    };
    this.showLeaderboard = function() {
        $(".panel-main").hide();
        $(".panel-leaderboard").show();

        $(".highscore-list").html("");

        $.get("http://weiseng.redairship.com/leaderboard/api/1/highscore.json?game_id=6", function(data) {
            var numDummyData = 10 - data.length;
            for (var i = 0; i < numDummyData; i++) {
                data.push({
                    username: '----------',
                    score: 0
                });
            }

            _.each(data, function(highscore, index) {
                setTimeout(function() {
                    $(".highscore-list").append('<li class="animated slideInUp">' + (index + 1) + ': ' + highscore.username + ' - ' + highscore.score + '</li>');
                }, index * 200);
            });
        }).fail(function() {
            swal("Oops...", "Something went wrong!", "error");
        });
    };

    // Check game state
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

$(function() {
    XMing.GameStateManager.initGame();
});
