const choicesEl = document.getElementById("choices");
const messageEl = document.getElementById("message");
const scoreEl = document.getElementById("score");
const dogEl = document.getElementById("dog");
const nextBtn = document.getElementById("nextBtn");
const targetTimeEl = document.getElementById("targetTime");

let current = null;
let score = 0;
let locked = false;
let audioContext = null;

function createClockElement(time) {
  const clock = document.createElement("div");
  clock.className = "clock";

  const ticks = document.createElement("div");
  ticks.className = "ticks";
  for (let i = 0; i < 60; i += 1) {
    const tick = document.createElement("div");
    tick.className = "tick";
    if (i % 5 === 0) {
      tick.style.height = "12px";
      tick.style.width = "4px";
      tick.style.marginLeft = "-2px";
      tick.style.transformOrigin = "50% 130px";
      tick.style.transform = `translateY(-130px) rotate(${i * 6}deg)`;
    } else {
      tick.style.height = "6px";
      tick.style.width = "2px";
      tick.style.marginLeft = "-1px";
      tick.style.transformOrigin = "50% 130px";
      tick.style.transform = `translateY(-130px) rotate(${i * 6}deg)`;
    }
    ticks.appendChild(tick);
  }
  clock.appendChild(ticks);

  const numbers = [
    { n: 12, c: "n12" },
    { n: 3, c: "n3" },
    { n: 6, c: "n6" },
    { n: 9, c: "n9" }
  ];
  numbers.forEach(num => {
    const el = document.createElement("div");
    el.className = `number ${num.c}`;
    el.textContent = num.n;
    clock.appendChild(el);
  });

  const hourHand = document.createElement("div");
  hourHand.className = "hand hour";
  const minuteHand = document.createElement("div");
  minuteHand.className = "hand minute";

  const hourRotation = ((time.hour % 12) * 30) + (time.minute * 0.5);
  const minuteRotation = time.minute * 6;
  hourHand.style.transform = `rotate(${hourRotation}deg)`;
  minuteHand.style.transform = `rotate(${minuteRotation}deg)`;

  clock.appendChild(hourHand);
  clock.appendChild(minuteHand);

  const pin = document.createElement("div");
  pin.className = "pin";
  clock.appendChild(pin);

  return clock;
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
    button.appendChild(createClockElement(time));
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
  targetTimeEl.textContent = formatTime(current);
  renderChoices(current);
  messageEl.textContent = "おなじ じかんの とけいは どれ？";
}

nextBtn.addEventListener("click", newQuestion);
newQuestion();
