var XMing = XMing || {};

XMing.GameStateManager = new function() {

    var windowWidth = 0;
    var gameState;
    var userData;
    var gameTimer;
    var remainingTime;
    var roundStartTime;
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
        title: "I split!",
        subtitle: "Minions love me!"
    }, {
        image: "images/carrot.png",
        text: "carrot",
        title: "Me!",
        subtitle: "or stick? >:D"
    }, {
        image: "images/orange.png",
        text: "orange",
        title: "A colour?\n A fruit?",
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
    var VERSION_NUMBER = 1;
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

        remainingTime = currentData.text.length + 3.5;

        $("#timer-value").html(Math.floor(remainingTime))
            .removeClass("animated fadeIn");

        $("#image-to-guess").attr('src', currentData.image);

        swal({
            title: currentData.title,
            text: currentData.subtitle + "\n\n(" + currentData.text.length + "-letter word)",
            imageUrl: currentData.image,
            closeOnCancel: false
        }, function() {
            roundStartTime = new Date();

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
                        .css("color", "#11BDFF");
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
                .css("color", "#0F0");

            var roundEndTime = new Date();
            var timeGiven = currentData.text.length + 3.0;
            var timeRemained = timeGiven - (roundEndTime.getTime() - roundStartTime.getTime()) / 1000;
            var scoreChanged = Math.ceil(timeRemained * 10);

            score += scoreChanged;
            $(".score-change")
                .html("+" + scoreChanged)
                .css("color", "#0F0");

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

        var imgPurpleEgg = new Image();
        imgPurpleEgg.src = "images/purple-egg.png";

        var imgBlueEgg = new Image();
        imgBlueEgg.src = "images/blue-egg.png";

        var imgNinjaEgg = new Image();
        imgNinjaEgg.src = "images/ninja-egg.png";
    };

    // Game status operation
    this.initGame = function() {
        var self = this;
        gameState = GAME_STATE_ENUM.INITIAL;

        window.addEventListener("resize", this.onResize.bind(this), false);

        FastClick.attach(document.body, {
            tapDelay: 100
        });

        this.preloadImage();

        userData = this.loadData();

        swal.setDefaults({
            confirmButtonColor: '#AA3BF5'
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

        this.checkPlayedEasterEgg();
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
            closeOnConfirm: false
        }, function() {
            var postingInProgress = false;
            swal({
                title: "Thanks for playing!!!",
                imageUrl: "images/love.png",
                type: "input",
                text: "Write your name here! It will appear in the leaderboard!",
                closeOnConfirm: false
            }, function(playerName) {
                if (playerName == "") {
                    swal.showInputError("You need to write something! A nickname is fine too!");
                    return false;
                }
                if (postingInProgress) {
                    return false;
                } else {
                    postingInProgress = true;
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
                            type: "success"
                        });
                        userData.username = playerName;
                        self.saveData(userData);
                    }).fail(function() {
                        swal({
                            title: "Oops...",
                            text: "Something went wrong!",
                            type: "error"
                        });
                    });
                }
            });
            $('.sweet-alert input[type=text]:first').val(userData.username);
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
                        if (!userData.easterEgg.word) {
                            userData.easterEgg.word = true;
                            self.saveData(userData);
                            swal({
                                title: 'Congratulations!',
                                text: 'You have found the Purple Egg!',
                                imageUrl: 'images/purple-egg.png'
                            });
                            $.ajax({
                                method: "POST",
                                url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                                contentType: "application/json",
                                data: JSON.stringify({
                                    game_id: 14,
                                    username: userData.uid,
                                    score: 1
                                })
                            });
                        } else {
                            swal({
                                title: 'Hello!',
                                text: 'You have collected the Purple Egg already!',
                                imageUrl: 'images/purple-egg.png'
                            });
                        }

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

        if (!userData.played.word) {
            userData.played.word = true;
            this.saveData(userData);
        }
    };
    this.showLeaderboard = function() {
        $(".panel-main").hide();
        $(".panel-leaderboard").show();
        $(".loader").show();

        $(".highscore-list").html("");

        if (!userData.leaderboard.word) {
            userData.leaderboard.word = true;
            this.saveData(userData);
            this.checkLeaderboardEasterEgg();
        }

        $.get("http://weiseng.redairship.com/leaderboard/api/1/highscore.json?game_id=6", function(data) {
            $(".loader").fadeOut(700);

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

    // Easter Egg
    this.checkPlayedEasterEgg = function() {
        if (!userData.easterEgg.allGames) {
            if (_.every(userData.played)) {
                userData.easterEgg.allGames = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Blue Egg!',
                    imageUrl: 'images/blue-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 13,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };
    this.checkLeaderboardEasterEgg = function() {
        if (!userData.easterEgg.allLeaderboard) {
            if (_.every(userData.leaderboard)) {
                userData.easterEgg.allLeaderboard = true;
                this.saveData(userData);
                swal({
                    title: 'Congratulations!',
                    text: 'You have found the Ninja Egg!',
                    imageUrl: 'images/ninja-egg.png'
                });
                $.ajax({
                    method: "POST",
                    url: 'http://weiseng.redairship.com/leaderboard/api/1/highscore.json',
                    contentType: "application/json",
                    data: JSON.stringify({
                        game_id: 15,
                        username: userData.uid,
                        score: 1
                    })
                });
            }
        }
    };

    // Local storage
    this.saveData = function(userData) {
        if (window.localStorage) {
            window.localStorage.setItem('data', btoa(encodeURIComponent(JSON.stringify(userData))));
        }
    };
    this.loadData = function() {
        if (window.localStorage) {
            var data = window.localStorage.getItem('data');
            if (data) {
                var parsedData = JSON.parse(decodeURIComponent(atob(data)));
                // make sure version is the same
                if (parsedData.version === VERSION_NUMBER) {
                    return parsedData;
                }
            }
        }

        var uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });

        var data = {
            played: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            leaderboard: {
                bunny: false,
                specialOne: false,
                mushrooms: false,
                word: false,
                numbers: false,
                squirrel: false
            },
            squirrel: {
                level: 0,
                inHallOfFame: false
            },
            easterEgg: {
                allGames: false,
                allLeaderboard: false,
                word: false,
                numbers: false,
                specialOne: false,
                mushrooms: false,
                squirrel: false
            },
            collectAll: false,
            uid: uid,
            username: '',
            version: VERSION_NUMBER
        };

        this.saveData(data);

        return data;
    };
};

$(function() {
    XMing.GameStateManager.initGame();
});
