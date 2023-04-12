var root = document.getElementById("root");
document.addEventListener("DOMContentLoaded", titleMenu);

var QUESTIONS = [
  {
    question: "What is your name?",
    choices: ["Celine Dion", "Starlord", "Ferris Bueller", "J.K. Rowling"],
    correct: 0
  },
  {
    question: "What is my name?",
    choices: [
      "Dude, what?",
      "How should I know?",
      "Anonymous",
      "The least interesting human in the world."
    ],
    correct: 3
  },
  {
    question: "What is the point of this?",
    choices: [
      "I have no idea.",
      "We just havin' fun out here!",
      "Who cares?!",
      "Egypt"
    ],
    correct: 1
  }
];

var timer;
var currentQuestion;
var timerInterval;

function titleMenu() {
  var menu = document.createElement("header");
  var instructions = document.createElement("p");
  var startBtn = document.createElement("button");

  instructions.textContent = "Click the button below to begin!";
  instructions.id = "instructions";

  startBtn.textContent = "START";
  startBtn.id = "start-btn";
  startBtn.addEventListener("click", function () {
    teardownMenu();
    startQuiz();
  });

  menu.appendChild(instructions);
  menu.appendChild(startBtn);
  root.appendChild(menu);
}

function teardownMenu() {
  document.getElementById("instructions").remove();
  document.getElementById("start-btn").remove();
}

function startQuiz() {
  timer = 30;
  currentQuestion = 0;
  timerInterval = initTimer();
  quizStage();
  ask();
}

function initTimer() {
  var timerEl = document.createElement("p");
  timerEl.textContent = timer;
  timerEl.classList.add("timer");

  document.getElementById("scoreboard").appendChild(timerEl);

  var timerInterval = setInterval(function () {
    if (timer < 1) {
      clearInterval(timerInterval);
      // Pass false for loss
      endQuiz(false);
      return;
    }

    timer--;
    timerEl.textContent = timer;
  }, 1000);
  return timerInterval;
}

function quizStage() {
  var previousResult = document.getElementById("result");
  var scoreSection = document.getElementById("score-section");
  if (previousResult) previousResult.remove();
  if (scoreSection) scoreSection.remove();

  var container = document.createElement("main");
  var questionEl = document.createElement("h3");
  var answersSection = document.createElement("section");

  questionEl.id = "question-txt";
  answersSection.id = "answers-section";

  container.appendChild(questionEl);
  container.appendChild(answersSection);
  root.appendChild(container);
}

function ask() {
  var questionTxt = QUESTIONS[currentQuestion].question;
  var answers = QUESTIONS[currentQuestion].choices;
  document.getElementById("question-txt").textContent = questionTxt;

  populateAnswers(answers);
}

function populateAnswers(answersArr) {
  var answersSection = document.getElementById("answers-section");
  var previous = document.querySelectorAll(".answer-choice");

  if (previous.length) {
    document.getElementById("question-txt").textContent =
      QUESTIONS[currentQuestion].question;
    for (var el of previous) {
      el.remove();
    }
  }

  for (var choice of answersArr) {
    var answerEl = document.createElement("p");
    answerEl.classList.add("answer-choice");
    answerEl.textContent = choice;
    answersSection.appendChild(answerEl);
    answersSection.addEventListener("click", handleUserChoice);
  }
}

function handleUserChoice(e) {
  var el = e.target;

  if (!el.matches(".answer-choice")) return;

  var chosen = el.textContent;
  var correct = QUESTIONS[currentQuestion].correct;

  if (chosen === QUESTIONS[currentQuestion].choices[correct]) {
    timer += 5;
    currentQuestion += 1;

    if (currentQuestion === QUESTIONS.length) {
      clearInterval(timerInterval);
      // Pass true for win
      endQuiz(true);
      return;
    }

    populateAnswers(QUESTIONS[currentQuestion].choices);
  } else {
    timer -= 5;
  }
}
//
function displayResult(result) {
  var resultContainer = document.createElement("article");
  var scoreEl = document.createElement("section");
  var reportEl = document.createElement("h3");
  var restartBtn = document.createElement("button");
  var scoreLabel = document.createElement("span");

  scoreEl.textContent = timer;
  reportEl.textContent = result ? "YOU WIN!" : "YOU RAN OUT OF TIME!";
  restartBtn.textContent = "PLAY AGAIN";
  scoreLabel.textContent = "Score";
  resultContainer.id = "result";

  restartBtn.addEventListener("click", startQuiz);

  resultContainer.appendChild(reportEl);
  resultContainer.appendChild(scoreLabel);
  resultContainer.appendChild(scoreEl);
  displayInputs(resultContainer);
  resultContainer.appendChild(restartBtn);
  root.appendChild(resultContainer);
}
//
function displayInputs(container) {
  var initialsEl = document.createElement("input");
  initialsEl.placeholder = "Your initials";
  var submitBtn = document.createElement("button");
  submitBtn.textContent = "RECORD INITIALS";

  function handleScoreSubmit() {
    if (initialsEl.value.length === 0) return;
    var storage = StorageHandler("scores");
    storage.update({ initials: initialsEl.value, score: timer });
    displayHighScores();
  }

  submitBtn.addEventListener("click", handleScoreSubmit);

  container.appendChild(initialsEl);
  container.appendChild(submitBtn);
}
//
function endQuiz(result) {
  document.querySelector(".timer").remove();
  document.querySelector("main").remove();
  displayResult(result);
  displayHighScores();
}
//
function displayHighScores() {
  var previous = document.getElementById("score-section");
  if (previous) previous.remove();

  var container = document.createElement("section");
  container.id = "score-section";

  var clearBtn = document.createElement("button");
  clearBtn.textContent = "CLEAR SCORES";
  clearBtn.addEventListener("click", function () {
    StorageHandler("scores").reset();
    displayHighScores();
  });

  var history = StorageHandler("scores");
  var objArray = history.get();
  if (!objArray) return;

  for (var i = 0; i < objArray.length; i++) {
    var pairWrapper = document.createElement("div");
    var initialsEl = document.createElement("span");
    var scoreEl = document.createElement("span");

    initialsEl.textContent = objArray[i].initials;
    scoreEl.textContent = objArray[i].score;

    pairWrapper.appendChild(initialsEl);
    pairWrapper.appendChild(scoreEl);
    container.appendChild(pairWrapper);

    pairWrapper.classList.add("score-pair");
  }
  container.appendChild(clearBtn);
  root.appendChild(container);
}
//
function StorageHandler(keyName) {
  return {
    keyName,
    get: function () {
      return JSON.parse(localStorage.getItem(this.keyName));
    },
    set: function (newValue) {
      localStorage.setItem(this.keyName, JSON.stringify(newValue));
      return;
    },
    update: function (newItem) {
      var currentValue = this.get();

      if (!currentValue) {
        this.set([newItem]);
        return;
      }

      if (Array.isArray(currentValue) && currentValue.length > 0) {
        currentValue.push(newItem);
        this.set(currentValue);
        return;
      }

      return [];
    },
    reset: function () {
      localStorage.removeItem(this.keyName);
      return;
    }
  };
}
