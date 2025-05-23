class Timer {

  constructor(displayElement) {
    this.displayElement = displayElement;
    this.totalTime = 0; // Start at 0 seconds
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
    if (this.countdown) {
      console.log('Timer is already running');
      return;
    }

    console.log('Timer started');
    this.isPaused = false;
    this.countdown = setInterval(() => {
      if (!this.isPaused) {
        this.totalTime++;
        this.updateDisplay();
      }
    }, 1000);
  }

  resumeTimer() {
    if (!this.countdown) {
      this.startTimer();
    } else {
      this.isPaused = false;
    }
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

  // These still work fine for a count-up timer:
  addMinute() {
    this.totalTime += 60;
    this.updateDisplay();
  }

  subtractMinute() {
    this.totalTime = Math.max(0, this.totalTime - 60);
    this.updateDisplay();
  }

  addSecond() {
    this.totalTime += 1;
    this.updateDisplay();
  }

  subtractSecond() {
    this.totalTime = Math.max(0, this.totalTime - 1);
    this.updateDisplay();
  }
}

export default Timer;
