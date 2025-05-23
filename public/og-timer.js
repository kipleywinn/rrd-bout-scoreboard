
/*const socket = new WebSocket(`ws://${window.location.host}`);
let timerDisplay = document.getElementById('timer');
let totalTime = 0; // in seconds
let countdown;
let isPaused = false;
*/
class Timer {

constructor(displayElement) {
  this.displayElement = displayElement;
  this.totalTime = 0;
  this.countdown = null;
  this.isPaused = false;
}

 formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

 updateDisplay() {
  this.displayElement.textContent = this.formatTime(this.totalTime);
}

 startTimer() {
  /*
  if (this.countdown || this.totalTime <= 0) return;
  this.isPaused = false;
  this.countdown = setInterval(() => {
    if (!this.isPaused && this.totalTime > 0) {
      this.totalTime--;
      this.updateDisplay();
    }
    if (this.totalTime <= 0) {
      clearInterval(this.countdown);
      this.countdown = null;
      this.updateDisplay();
    }
  }, 1000);
  */
  if (this.countdown || this.totalTime <= 0) {
    console.log('Timer not started. Countdown running or totalTime <= 0');
    console.log ("totalTime: " + this.totalTime + "countdown: " + this.countdown); // check totaltime and countdown
    return;
}
console.log('Timer started');
this.isPaused = false;
this.countdown = setInterval(() => {
    if (!this.isPaused && this.totalTime > 0) {
        this.totalTime--;
        this.updateDisplay();
    }
    if (this.totalTime <= 0) {
        clearInterval(this.countdown);
        this.countdown = null;
        this.updateDisplay(); // Final update at zero
    }
}, 1000);
}
 resumeTimer() {
  if (!this.countdown) {
    this.startTimer();
  }
  else {
  this.isPaused = false;}
}

 pauseTimer() {
  this.isPaused = true;
}

 resetTimer() {
  clearInterval(this.countdown);
  this.countdown = null;
  this.isPaused = false;
  this.totalTime = 0;
  this.updateDisplay();
}

 addMinute() {
  this.totalTime += 60;
  this.updateDisplay();
}

 subtractMinute() {
  if (this.totalTime >= 60) this.totalTime -= 60;
  else this.totalTime = 0;
  this.updateDisplay();
}

 addSecond() {
  this.totalTime += 1;
  this.updateDisplay();
}

 subtractSecond() {
  if (this.totalTime >= 1) this.totalTime -= 1;
  else this.totalTime = 0;
  this.updateDisplay();
}
}

export default Timer;