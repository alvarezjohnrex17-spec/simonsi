const buttonColours = ["red", "blue", "green", "yellow"];
const MAX_LEVEL = 10;
const gamePattern = [];
const userClickedPattern = [];
const sounds = {};

let level = 0;
let gameStarted = false;
let acceptingInput = false;
let sequenceTimer;
let responseTimer;
let sequenceRunId = 0;

buttonColours.concat("wrong").forEach(function (name) {
  sounds[name] = new Audio(`sounds/${name}.mp3`);
  sounds[name].preload = "auto";
});

$(function () {
  $(document).on("keydown", function () {
    if (!gameStarted) {
      startOver();
    }
  });

  $(".btn").on("click", function () {
    if (!gameStarted) {
      startOver();
      return;
    }

    if (!acceptingInput) {
      return;
    }

    const userChosenColour = $(this).attr("id");
    userClickedPattern.push(userChosenColour);
    playSound(userChosenColour);
    animatePress(userChosenColour);
    checkAnswer(userClickedPattern.length - 1);
  });
});

function nextSequence() {
  acceptingInput = false;
  $("#level-title").text(`Level ${++level}`);

  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  const currentRun = ++sequenceRunId;

  function showNextColour(index) {
    if (currentRun !== sequenceRunId) {
      return;
    }

    const colour = gamePattern[index];
    $(`#${colour}`).fadeOut(100).fadeIn(100);
    playSound(colour);

    if (index === gamePattern.length - 1) {
      acceptingInput = true;
      return;
    }

    sequenceTimer = window.setTimeout(function () {
      showNextColour(index + 1);
    }, 600);
  }

  showNextColour(0);
}

function checkAnswer(currentLevel) {
  if (userClickedPattern[currentLevel] !== gamePattern[currentLevel]) {
    gameOver();
    return;
  }

  if (userClickedPattern.length === gamePattern.length) {
    acceptingInput = false;
    const currentRun = sequenceRunId;
    responseTimer = window.setTimeout(function () {
      if (currentRun !== sequenceRunId || !gameStarted) {
        return;
      }

      if (level === MAX_LEVEL) {
        gameStarted = false;
        $("#level-title").text("You Win! Tap a Color or Press Any Key to Restart");
        return;
      }

      userClickedPattern.length = 0;
      nextSequence();
    }, 1000);
  }
}

function playSound(name) {
  const sound = sounds[name];
  if (!sound) {
    console.error(`No sound is configured for "${name}".`);
    return;
  }

  sound.currentTime = 0;
  sound.play().catch(function (error) {
    console.error(`Unable to play sounds/${name}.mp3:`, error);
  });
}

function animatePress(currentColour) {
  const button = $(`#${currentColour}`);
  button.addClass("pressed");
  window.setTimeout(function () {
    button.removeClass("pressed");
  }, 100);
}

function gameOver() {
  gameStarted = false;
  acceptingInput = false;
  window.clearTimeout(sequenceTimer);
  window.clearTimeout(responseTimer);
  sequenceRunId++;
  level = 0;
  gamePattern.length = 0;
  userClickedPattern.length = 0;

  playSound("wrong");
  $("body").addClass("game-over");
  $("#level-title").text("Game Over - Level 0. Tap a Color or Press Any Key to Restart");
  window.setTimeout(function () {
    $("body").removeClass("game-over");
  }, 200);
}

function startOver() {
  window.clearTimeout(sequenceTimer);
  window.clearTimeout(responseTimer);
  sequenceRunId++;
  gamePattern.length = 0;
  userClickedPattern.length = 0;
  level = 0;
  gameStarted = true;
  acceptingInput = false;
  $("body").removeClass("game-over");
  nextSequence();
}