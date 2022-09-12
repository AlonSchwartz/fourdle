import { Component, HostListener, Input, OnInit } from '@angular/core';
import { GameService } from '../services/game.service';
import { letterObject } from '../interfaces';
import { KeyboardService } from '../services/keyboard.service';
import { LayoutService } from '../services/layout.service';


@Component({
  selector: 'wordle',
  templateUrl: './wordle.component.html',
  styleUrls: ['./wordle.component.css']

})
export class WordleComponent implements OnInit {

  constructor(private game: GameService, private keyboard: KeyboardService, private layout: LayoutService) { }

  maxGuesses: number = this.game.getMaxGuesses();
  guessLength: number = this.game.getGuessLength();
  guesses: Array<letterObject[]> = Array.from({ length: this.maxGuesses }, e => Array(this.guessLength));
  solved: boolean = false;
  gameOver: boolean = false;
  currentGuess: number = 0;
  letterIndex: number = 4;
  @Input() id = -1;

  isPortrait = false;

  ngOnInit(): void {
    this.layout.screenLayoutObserver.subscribe(isPortrait => {
      if (isPortrait) {
        this.isPortrait = true;
      } else {
        this.isPortrait = false;
      }
    })

    for (let i = 0; i < this.guesses.length; i++) {
      this.guesses[i] = this.createLetterObject();
    }

    // Triggering presses from virtual keyboard like they were a press from real keyboard
    this.keyboard.keySubject.subscribe(data => {
      let keyboardEvent = new KeyboardEvent('keyup', {
        key: data.key
      })
      this.keyEvent(keyboardEvent);
    })

    // If there is saved history from today's game, it will get and apply it here
    this.game.historyArr[this.id].subscribe(data => {
      if (data.wordleId != -1) {
        this.guesses = data.guesses
        this.solved = data.solved
        this.gameOver = data.gameOver
        this.currentGuess = data.currentGuess;
      }
    })
  }

  createLetterObject(): letterObject[] {
    let guessArr = [];
    for (let i = 0; i < this.guessLength; i++) {
      let temp: letterObject = { letter: "", status: "" }
      guessArr[i] = temp;
    }
    return guessArr;
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.gameOver) {
      /** Hebrew letters only */
      const pattern = /[\u0590-\u05FF]/

      if (event.key == "Enter") {
        let guessCopy = [...this.guesses[this.currentGuess]]
        let word = this.convertToWord(guessCopy);

        // In case its a 5 letters guess
        if (word.length == 5) {
          if (this.game.checkIfWordExists(word)) {
            let response = this.game.checkIfDailyWord(this.id, guessCopy, this.currentGuess)

            if (response.isDailyWord) {
              this.solved = true;
              this.gameOver = true;
            }
            else if (this.currentGuess == this.maxGuesses - 1) {
              //game over, didnt guessed all words
              this.gameOver = true;
              this.game.gameOver(this.id, this.currentGuess);
            }

            this.guesses[this.currentGuess] = response.lettersStatuses;
            this.keyboard.deliverKeyStyles(response.lettersStatuses, this.id)

            if (this.currentGuess < this.maxGuesses) {
              this.currentGuess++;
              this.letterIndex = 4;
            }
            this.game.saveLocal(this.guesses, this.id, this.solved, this.gameOver, this.currentGuess);
          }
        }
      }

      if (event.key == "Backspace") {
        if (this.letterIndex < 4) {
          this.letterIndex++;
          this.guesses[this.currentGuess][this.letterIndex].letter = ""
        }
        if (this.letterIndex == 0) {
          this.game.resetGuess()
        }
      }
      //Insert valid letters only, according to the pattern we declard at the beginning of the function
      else if (pattern.test(event.key)) {
        if (this.letterIndex >= 0) {
          this.guesses[this.currentGuess][this.letterIndex].letter = event.key;
          this.letterIndex--;
        }
        if (this.letterIndex == -1) {
          return;
        }
      }
    }
  }

  /**
   * Converts a given array of strings into a string
   * @param wordArray array of strings
   * @returns a string of the combined arrays
   */
  convertToWord(wordArray: Array<letterObject>) {
    let word = ""
    wordArray.reverse();
    for (let i = 0; i < wordArray.length; i++) {
      word += wordArray[i].letter
    }
    return word;
  }
}
