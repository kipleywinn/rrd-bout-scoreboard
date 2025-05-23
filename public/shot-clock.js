
class ShotClock {

  constructor(displayElementSC) {
    this.displayElementSC = displayElementSC;
    this.totalTimeSC = 24;
    this.countdownSC = null;
    this.isPausedSC = false;
  }
  
   updateDisplaySC() {
    this.displayElementSC.textContent = this.totalTimeSC;
  }
  
   startSC() {
    if (this.countdownSC || this.totalTimeSC <= 0) {
      console.log('Shotclock not started. CountdownSC running or totalTimeSC <= 0');
      console.log ("totalTimeSC: " + this.totalTimeSC + "countdownSC: " + this.countdownSC); // check totaltimeSC and countdownSC
      return;
    }

      console.log('ShotClock started');

      this.isPausedSC = false;
      this.countdownSC = setInterval(() => {
          if (!this.isPausedSC && this.totalTimeSC > 0) {
              this.totalTimeSC--;
              this.updateDisplaySC();
          }
          if (this.totalTimeSC <= 0) {
              clearInterval(this.countdownSC);
              this.countdownSC = null;
              this.updateDisplaySC(); // Final update at zero
          }
      }, 1000);
   }

   resumeSC() {
    if (!this.countdownSC) {
      this.startSC();
    }
    else {
    this.isPausedSC = false;}
  }
  
   pauseSC() {
    this.isPausedSC = true;
  }

   resetTo24SC() {
    clearInterval(this.countdownSC);
    this.countdownSC = null;
    this.totalTimeSC = 24;
    this.updateDisplaySC();
  }

   resetTo14SC() {
    clearInterval(this.countdownSC);
    this.countdownSC = null;
    this.totalTimeSC = 14;
    this.updateDisplaySC();
  }
  
   addSecondSC() {
    this.totalTimeSC += 1;
    this.updateDisplaySC();
  }
  
   subtractSecondSC() {
    if (this.totalTimeSC >= 1) this.totalTimeSC -= 1;
    else this.totalTimeSC = 0;
    this.updateDisplaySC();
  }
}
  
  export default ShotClock;