const hourHand = document.getElementById("hourHand");
const minuteHand = document.getElementById("minuteHand");
const choicesEl = document.getElementById("choices");
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");
const dogEl = document.getElementById("dog");
const nextBtn = document.getElementById("nextBtn");
const ticksEl = document.getElementById("ticks");

let current = null;
let score = 0;
let locked = false;
let audioContext = null;

function buildTicks() {
  const radius = 190;
  document.documentElement.style.setProperty("--clock-radius", `${radius}px`);
  ticksEl.innerHTML = "";
  for (let i = 0; i < 60; i += 1) {
    const tick = document.createElement("div");
    tick.className = "tick";
    tick.style.height = i % 5 === 0 ? "22px" : "11px";
    tick.style.width = i % 5 === 0 ? "6px" : "3px";
    tick.style.transform = `rotate(${i * 6}deg) translateY(-188px)`;
    ticksEl.appendChild(tick);
  }
}

function formatTime(time) {
  return `${time.hour}:${String(time.minute).padStart(2, "0")}`;
}

function randomTime() {
  const hour = Math.floor(Math.random() * 12) + 1;
  const minute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
  return { hour, minute };
}

function sameTime(a, b) {
  return a.hour === b.hour && a.minute === b.minute;
}

function makeWrongTime(answer, used) {
  let time = randomTime();
  while (sameTime(time, answer) || used.some((item) => sameTime(item, time))) {
    time = randomTime();
  }
  return time;
}

function shuffle(items) {
  return items
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.value);
}

function setClock(time) {
  const hourRotation = ((time.hour % 12) * 30) + (time.minute * 0.5);
  const minuteRotation = time.minute * 6;
  hourHand.style.transform = `rotate(${hourRotation}deg)`;
  minuteHand.style.transform = `rotate(${minuteRotation}deg)`;
}

function playChime() {
  audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime;
  [523.25, 659.25, 783.99].forEach((freq, index) => {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + index * 0.11);
    gain.gain.exponentialRampToValueAtTime(0.28, now + index * 0.11 + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.11 + 0.26);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start(now + index * 0.11);
    osc.stop(now + index * 0.11 + 0.3);
  });
}

function renderChoices(answer) {
  const choices = [answer];
  choices.push(makeWrongTime(answer, choices));
  choices.push(makeWrongTime(answer, choices));
  choicesEl.innerHTML = "";
  shuffle(choices).forEach((time) => {
    const button = document.createElement("button");
    button.className = "choice";
    button.type = "button";
    button.textContent = formatTime(time);
    button.addEventListener("click", () => choose(button, time));
    choicesEl.appendChild(button);
  });
}

function choose(button, time) {
  if (locked) return;
  if (sameTime(time, current)) {
    locked = true;
    score += 1;
    scoreEl.textContent = score;
    button.classList.add("correct");
    messageEl.textContent = "せいかい！いいこ！";
    dogEl.classList.remove("happy");
    void dogEl.offsetWidth;
    dogEl.classList.add("happy");
    playChime();
    window.setTimeout(newQuestion, 1200);
  } else {
    button.classList.add("wrong");
    messageEl.textContent = "もういちど みてみよう";
  }
}

function newQuestion() {
  locked = false;
  current = randomTime();
  setClock(current);
  renderChoices(current);
  messageEl.textContent = "この時計は なんじ？";
}

nextBtn.addEventListener("click", newQuestion);
buildTicks();
newQuestion();
