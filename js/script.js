async function setUpQuiz() {
  const response = await fetch("questions.json");
  const data = await response.json();

  // ! Variables
  const quesCntEl = document.querySelector(".count span");
  const submitBtn = document.querySelector(".sumbit-btn");
  const resultContainer = document.querySelector(".result");
  const quizAppEl = document.querySelector(".quiz-app");
  const countdownEl = document.querySelector(".count-down");

  let quesCnt = 10;
  let crrQues = 1;
  quesCntEl.innerHTML = quesCnt - crrQues + 1;
  let rightAns = 0;
  let timer;

  // Bullets setup
  const bullets = document.querySelector(".bullets");
  for (let i = 0; i < quesCnt; i++) {
    const bullet = document.createElement("div");
    bullet.classList.add("bullet", `bullet-${i + 1}`);
    if (i === 0) bullet.classList.add("active");
    bullets.appendChild(bullet);
  }

  // Clone questions so we can splice them out
  const questions = [...data];

  // Load question
  function loadQuestion() {
    if (questions.length === 0) return;

    let randomQuestionIndex = Math.floor(Math.random() * questions.length);
    let randomQuestion = questions.splice(randomQuestionIndex, 1)[0];

    const ques = document.querySelector(".question");
    ques.innerHTML = randomQuestion["title"];

    // Remove the 'correct' class from any label that might have it from a previous question
    document
      .querySelectorAll(".answer label.correct")
      .forEach((label) => label.classList.remove("correct"));

    for (let i = 1; i <= 4; i++) {
      const answerLabel = document.querySelector(`label[for="answer-${i}"]`);
      const answerInput = document.querySelector(`#answer-${i}`);
      answerLabel.textContent = randomQuestion[`answer_${i}`];
      answerInput.value = randomQuestion[`answer_${i}`];
      if (answerLabel.textContent === randomQuestion["right_answer"]) {
        answerLabel.classList.add("correct");
      }
      answerInput.checked = false; // reset previous selection
    }

    startTimer();
  }

  // Timer function
  function startTimer() {
    let min = 0;
    let sec = 20;

    function updateCountdown() {
      countdownEl.innerHTML = `Time Left: <span class="min">${min} min</span> : 
                                <span class="sec">${sec} sec</span>`;
    }

    updateCountdown();
    clearInterval(timer);

    timer = setInterval(() => {
      const bullet = document.querySelector(`.bullet-${crrQues}`);
      const correctAnswer = document.querySelector(".answer .correct");
      if (sec === 0) {
        if (min === 0) {
          bullet.classList.add("wrong");
          correctAnswer.parentElement.classList.add("correct");
          countdownEl.innerHTML = `TIME IS UP! `;
          clearInterval(timer);
          crrQues++;
          quesCntEl.innerHTML = quesCnt - crrQues + 1;
          if (crrQues <= quesCnt) {
            setTimeout(() => {
              nextQuestion();
              correctAnswer.parentElement.classList.remove("correct");
              startTimer();
            }, 2000);
          } else {
            setTimeout(showResults, 2000);
          }
          return;
        }
        min--;
        sec = 59;
      } else {
        sec--;
      }

      updateCountdown();
    }, 1000);
  }

  // Show results
  function showResults() {
    quizAppEl.classList.add("finished");
    submitBtn.disabled = true;
    clearInterval(timer);
    countdownEl.style.display = "none";

    let finalMessageText = "";
    if (rightAns === quesCnt) {
      finalMessageText = "Excellent! You got a perfect score!";
    } else if (rightAns > quesCnt / 2) {
      finalMessageText = "Good job! You passed.";
    } else {
      finalMessageText = "You can do better. Keep practicing!";
    }

    resultContainer.innerHTML = `
      <div class="final-message">${finalMessageText}</div>
      <div class="score">
        You Scored <span class="correct">${rightAns}</span> out of <span class="total">${quesCnt}</span>
      </div>
      <button class="restart-btn">Restart Quiz</button>
    `;

    document.querySelector(".restart-btn").onclick = () => location.reload();
  }

  // Move to next question
  function nextQuestion() {
    document
      .querySelectorAll(".bullet")
      .forEach((b) => b.classList.remove("active"));
    if (crrQues <= quesCnt) {
      document.querySelector(`.bullet-${crrQues}`).classList.add("active");
      loadQuestion();
    }
  }
  // Submit button logic
  document.querySelector(".sumbit-btn").addEventListener("click", () => {
    const selected = document.querySelector(
      '.answer input[name="answer"]:checked'
    );
    const correctAnswer = document.querySelector(".answer .correct");
    const bullet = document.querySelector(`.bullet-${crrQues}`);
    if (selected) {
      selected.checked = false;
      if (selected.value === correctAnswer.textContent) {
        rightAns++;
        selected.parentElement.classList.add("correct");
        bullet.classList.add("correct");
      } else {
        selected.parentElement.classList.add("wrong");
        correctAnswer.parentElement.classList.add("correct");
        bullet.classList.add("wrong");
      }
      crrQues++;
      quesCntEl.innerHTML = quesCnt - crrQues + 1;
      if (crrQues <= quesCnt) {
        setTimeout(() => {
          document.querySelectorAll(".bullet").forEach((bullet) => {
            bullet.classList.remove("active");
          });
          const activeBullet = document.querySelector(`.bullet-${crrQues}`);
          activeBullet.classList.add("active");
          selected.parentElement.classList.remove("wrong");
          correctAnswer.parentElement.classList.remove("correct");
          loadQuestion();
        }, 2000);
      } else {
        setTimeout(showResults, 2000);
      }
    } else {
      console.log("No answer selected!");
    }
  });

  // Start quiz
  loadQuestion();
}

setUpQuiz();
