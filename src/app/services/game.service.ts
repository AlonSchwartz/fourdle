import { Injectable } from '@angular/core';
import { responseObject, letterObject, localStorageObject, wordleObject } from '../interfaces';
import { WORDS } from '../wordlist';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { StatisticsDialogComponent } from '../dialogs/statistics-dialog/statistics.component';
import { LocalStorageService } from './local-storage.service';
import { BehaviorSubject } from 'rxjs';
import { KeyboardService } from './keyboard.service';
import { HelpDialogComponent } from '../dialogs/help-dialog/help-dialog.component';


@Injectable({
  providedIn: 'root'
})

export class GameService {

  constructor(private _snackBar: MatSnackBar, public dialog: MatDialog, private localStorage: LocalStorageService, private keyboard: KeyboardService) {
    this.initiateGame();
  }

  private readonly maxGuesses: number = 9;
  private readonly guessLength: number = 5;
  private readonly dialogRef = this.dialog;
  private readonly lettersStatuses = ["inPlace", "wrongPlace", "notExists"];

  // Maps to indentify the final form of regular letters and vice versa 
  private readonly finalLettersMap = new Map([
    ["ם", "מ"],
    ["ן", "נ"],
    ["ץ", "צ"],
    ["ף", "פ"],
    ["ך", "כ"]
  ]);
  private readonly regularFormLetterMap = new Map([
    ["מ", "ם"],
    ["נ", "ן"],
    ["צ", "ץ"],
    ["פ", "ף"],
    ["כ", "ך"]
  ]);

  private dailyWords: Array<string> = [];
  private mappedDailyWords: Array<Map<string, number>> = [] // Each daily word mapped by <letter, occurrences>
  private playerGuess: { "word": string, "valid": boolean } = { word: "", valid: false };
  private solvedWordles: boolean[] = [false, false, false, false];
  private hasFinalLetters: boolean[] = [false, false, false, false];
  private gameEnded: boolean = false;
  private gameId = this.calcGameId();
  private gameData: localStorageObject = { gameId: this.gameId, guesses: [], keyboard: [], turnOfWinning: "X" }
  private wordleObj: wordleObject = { wordleId: -1, guesses: [], gameOver: false, solved: false, currentGuess: 0 }
  private guesses: letterObject[][][] = [] // Will store all wordles guesses and letter statuses

  // These behavior subjects will be used to deliver wordles states from local storage to the wordles 
  public wordle0_stateSubject = new BehaviorSubject<wordleObject>(this.wordleObj)
  public wordle1_stateSubject = new BehaviorSubject<wordleObject>(this.wordleObj)
  public wordle2_stateSubject = new BehaviorSubject<wordleObject>(this.wordleObj)
  public wordle3_stateSubject = new BehaviorSubject<wordleObject>(this.wordleObj)
  public historyArr = [this.wordle0_stateSubject, this.wordle1_stateSubject, this.wordle2_stateSubject, this.wordle3_stateSubject]

  getMaxGuesses() {
    return this.maxGuesses;
  }

  getGuessLength() {
    return this.guessLength;
  }

  isGameEnded() {
    return this.gameEnded;
  }

  getDailyWords() {
    return this.dailyWords;
  }

  getSolvedWordles() {
    return this.solvedWordles;
  }

  getGuesses() {
    return this.guesses;
  }

  resetGuess() {
    if (this.playerGuess.word !== "") {
      this.playerGuess.word = "";
      this.playerGuess.valid = false;
    }
  }

  checkIfWordExists(word: string): boolean {
    //Check if words exists only if the stored guess is empty.
    if (this.playerGuess.word == "") {
      this.playerGuess.word = word;
      this.playerGuess.valid = WORDS.includes(word);

      if (!this.playerGuess.valid) {
        this.NotifyWordNotValid();
      }
      return this.playerGuess.valid;
    }
    else {
      if (!this.playerGuess.valid) {
        this.NotifyWordNotValid();
      }
      return this.playerGuess.valid;
    }
  }

  NotifyWordNotValid() {
    this._snackBar.open("המילה לא קיימת במאגר", "", {
      duration: 1000,
      verticalPosition: "top",
      panelClass: ["wordNotFound"]
    });
  }

  /**
   * Mapping letters by <letter, number of occurrences>
   */
  mapLetters(word: string[]): Map<string, number> {
    let lettersMap = new Map();
    for (let i = 0; i < word.length; i++) {
      if (lettersMap.get(word[i])) {
        let occurrences = lettersMap.get(word[i]) + 1;
        lettersMap.set(word[i], occurrences)
      }
      else {
        lettersMap.set(word[i], 1)
      }
    }
    return lettersMap;
  }

  /**
   * Checks if the player's guess is the daily word
   * @param wordleID the ID of the wordle who sent the request
   * @param lettersObject the word, in the form of lettersObject
   * @param turn which turn is it
   * @returns responseObject with statuses for each letter, and if the word is the daily word of this wordleID
   */
  checkIfDailyWord(wordleID: number, lettersObject: Array<any>, turn: number): responseObject {
    let changedLetter = false;

    let responseObj: responseObject = { isDailyWord: false, lettersStatuses: [] }
    this.playerGuess.word === this.dailyWords[wordleID] ? responseObj.isDailyWord = true : responseObj.isDailyWord = false;
    if (this.playerGuess.word === this.dailyWords[wordleID]) {
      this.solved(wordleID, turn)
    }

    // Check if the player have entered a word with final letter, and act accordingly
    if (this.finalLettersMap.has(this.playerGuess.word.charAt(4))) {
      let letter = this.finalLettersMap.get(this.playerGuess.word.charAt(4))
      this.playerGuess.word = this.replaceFinalLetters(this.playerGuess.word, false)
      if (letter) {
        lettersObject[4].letter = letter
      }
      changedLetter = true;
    }
    // Check if daily word have a word with final letter, and act accordingly
    if (this.finalLettersMap.has(this.dailyWords[wordleID].charAt(4))) {
      this.dailyWords[wordleID] = this.replaceFinalLetters(this.dailyWords[wordleID], false)
      this.hasFinalLetters[wordleID] = true;
    }

    for (let i = 0; i < this.guessLength; i++) {
      if (this.playerGuess.word.charAt(i) === this.dailyWords[wordleID].charAt(i)) {
        lettersObject[i].status = this.lettersStatuses[0];
      }
      // Check if letter exists in the daily word
      else {
        this.dailyWords[wordleID].includes(this.playerGuess.word.charAt(i)) ?
          lettersObject[i].status = this.lettersStatuses[1] : lettersObject[i].status = this.lettersStatuses[2]
      }
    }
    lettersObject = this.checkAndFixDuplicates(this.playerGuess.word, wordleID, JSON.parse(JSON.stringify(lettersObject)))

    // We changed the final letter in daily word to regular letter, now changing it back
    if (this.hasFinalLetters.includes(true)) {
      let index = this.hasFinalLetters.findIndex(status => status == true)
      this.dailyWords[index] = this.replaceFinalLetters(this.dailyWords[index], true)
      this.hasFinalLetters[index] = false;
    }

    // We changed the final letter in player's guess to regular letter, now changing it back
    if (changedLetter) {
      this.playerGuess.word = this.replaceFinalLetters(this.playerGuess.word, true)
      lettersObject[4].letter = this.playerGuess.word.charAt(4)
      changedLetter = false;

    }

    responseObj.lettersStatuses = lettersObject.reverse();
    this.resetGuess();

    return responseObj;
  }

  /**
   * Switch letter from regular letter to final letter, or the opposite.
   * For example, switch the letter 'ם' to 'מ', 
   * or the letter 'נ' to 'ן'
   * @param word the word we are changing a letter in
   * @param toFinalLetter Is the change to final letter? 
   * @returns the updated word
   */
  replaceFinalLetters(word: string, toFinalLetter: boolean): string {
    let newWord = word.slice(0, 4)
    let letter;
    toFinalLetter ? letter = this.regularFormLetterMap.get(word.charAt(4)) : letter = this.finalLettersMap.get(word.charAt(4))

    if (letter) {
      newWord += letter;
    }
    word = newWord

    return word;
  }

  initiateGame() {
    this.checkHistory();
    this.dailyWords = this.chooseDailyWords()

    // Mapping daily words by <letter, occurrences>
    for (let i = 0; i < this.dailyWords.length; i++) {
      let dailyWord_splitted = this.dailyWords[i].split("")
      if (this.finalLettersMap.has(dailyWord_splitted[4])) {
        let letter = this.finalLettersMap.get(dailyWord_splitted[4])
        if (letter) {
          dailyWord_splitted[4] = letter;
        }
      }
      let lettersMap = this.mapLetters(dailyWord_splitted)
      this.mappedDailyWords[i] = lettersMap;

    }
  }

  /**
   * Checks if there are any letters which marked as "wrongPlace", but should have been marked as "notExists".
   * This situation can happen if any letter from the daily word have only 1 occurrence, but more than 1 occurrence in player's guess.
   * @param word player's guessed word
   * @param wordleID the ID of the wordle who sent this word
   * @param lettersObject object that contains the letters of the player's guess, and the status of each letter
   * @returns 
   */
  checkAndFixDuplicates(word: string, wordleID: number, lettersObject: Array<letterObject>) {
    let mappedGuess = this.mapLetters(word.split("")) // Player's guess

    mappedGuess.forEach((occurrences, letter) => {
      if (occurrences >= 1) {
        let letterOccurrencesInDailyWord = this.mappedDailyWords[wordleID].get(letter);
        if (letterOccurrencesInDailyWord !== undefined) {
          let maxChanges = occurrences - letterOccurrencesInDailyWord;
          if (occurrences > letterOccurrencesInDailyWord) {
            for (let i = lettersObject.length - 1; i >= 0; i--) {
              if (lettersObject[i].letter === letter && lettersObject[i].status === this.lettersStatuses[1]) {
                if (maxChanges > 0) {
                  lettersObject[i].status = this.lettersStatuses[2];
                  maxChanges--;
                }
              }
            }
          }
        }
      }
    })

    return lettersObject;
  }

  /**
   * Marks a given wordle as solved
   * @param wordleId the wordle ID
   * @param turn turn of winning
   */
  solved(wordleId: number, turn: number) {
    this.solvedWordles[wordleId] = true;

    //In case the player solved all wordles
    if (this.solvedWordles.every(solvedWordle => solvedWordle == true)) {
      this.gameEnded = true;//
      this.updateStats(true, turn)
      if (this.dialogRef.openDialogs.length == 0) {
        this.openDialog("statistics");
      }
    }
  }

  /**
   * Marks a given wordle as unplayable (game-over).
   * @param wordleId the wordle ID
   * @param turn turn of losing
   */
  gameOver(wordleId: number, turn: number) {
    // Open dialog with daily words
    this.solvedWordles[wordleId] = false;
    if (this.solvedWordles.indexOf(false) !== -1) {
      if (!this.gameEnded) {
        this.gameEnded = true;//
        this.updateStats(false, turn)
        if (this.dialogRef.openDialogs.length == 0) {
          this.openDialog("statistics");
        }
      }
    }
  }

  openDialog(dialogType: string) {
    if (dialogType === "statistics") {
      setTimeout(() => {
        if (this.dialogRef.openDialogs.length == 0) {
          this.dialogRef.open(StatisticsDialogComponent, {
            width: "100vh",
            data: {
              statistics: this.localStorage.getStatistics(),
              turnOfWinning: this.gameData.turnOfWinning,
              gameId: this.gameData.gameId
            }
          })
        }
      }, 1650)
    }
    else if (dialogType === "help") {
      this.dialogRef.open(HelpDialogComponent, {
        width: "100vh",
        height: "80vh"
      })
    }
  }

  updateStats(gameWon: boolean, turn: number) {
    this.localStorage.updateStatistics(gameWon, turn + 1)
  }

  calcGameId(): number {
    let today = new Date()
    let launchDate = new Date('09/01/2022')
    let dif = launchDate.getTime() - today.getTime()
    let days = Math.abs(Math.ceil(dif / (1000 * 3600 * 24)))
    return days;
  }

  /**
   * Prepring an object of the current state of a wordle, in order to save it in local storage
   * @param guesses the wordle game state
   * @param wordleId the wordle ID
   * @param solved is this wordle is solved
   * @param gameOver is this wordle is over
   * @param currentGuess the current guess
   */
  saveLocal(guesses: letterObject[][], wordleId: number, solved: boolean, gameOver: boolean, currentGuess: number) {
    let state: wordleObject = { guesses: guesses, wordleId: wordleId, solved: solved, gameOver: gameOver, currentGuess: currentGuess }
    this.gameData.guesses[wordleId] = state;
    let keyboardObject = this.keyboard.getKeyboardObject();
    this.gameData.keyboard = keyboardObject;
    this.guesses[wordleId] = guesses;

    if (this.solvedWordles.every(solvedWordle => solvedWordle == true)) {
      this.gameData.turnOfWinning = currentGuess.toString();
      this.localStorage.setTurnOfWinning(currentGuess.toString())//
    }
    this.localStorage.save(this.gameData)
  }

  /**
   * Checks if there is game history in local storage
   */
  checkHistory() {
    let gameHistoryString = this.localStorage.loadGameHistory()

    if (gameHistoryString != null) {
      let gameHistory: localStorageObject;
      gameHistory = JSON.parse(gameHistoryString)

      //In case the game history is from today's game
      if (gameHistory.gameId === this.gameId) {
        gameHistory.guesses.forEach((wordle, index) => {
          this.guesses[index] = wordle.guesses
          this.notifyWordles(wordle, wordle.wordleId)
          this.solvedWordles[wordle.wordleId] = wordle.solved;
        })

        this.gameData = gameHistory;
        this.localStorage.setTurnOfWinning(gameHistory.turnOfWinning) // If game isn't done yet, turn of winning will be 'X'
        this.keyboard.setKeyboardObject(this.gameData.keyboard)

        if (this.gameData.guesses.every(guess => guess.gameOver == true)) {
          this.gameEnded = true;
          this.openDialog("statistics");
        }
      }
      else {
        // game history is from different day, so it is not relevant anymore
        this.localStorage.deleteHistory()
      }
    }
    // In case there is no game history from today in local storage, check if there is any stats stored
    else {
      let stats = this.localStorage.getStatistics();
      if (stats.played == 0) {
        this.openDialog("help")
      }
    }
  }

  /**
   * Notifies wordle about saved game state, that this wordle needs to apply
   * @param guess saved game state
   * @param wordleId the wordle ID
   */
  notifyWordles(guess: wordleObject, wordleId: number) {
    this.historyArr[wordleId].next(guess)
  }

  /**
   * Takes 4 consecutives words, with a fixed formula based on GameID, so it will always takes the same 4 words for a given GameID.
   * @returns the choosen 4 daily words.
   */
  chooseDailyWords(): Array<string> {
    let dailyWords: string[] = []
    let wordsCopy = JSON.parse(JSON.stringify(WORDS))

    /**
     * We need to take every day 4 consecutives words, and to make sure we does not skip words 
     * AND that we are not taking words from yesterday.
     * Therefor, we do the following calculations:
     * 
     * each day since game launch we took 4 words, so (this.gameId - 1) * 4
     * Then we are checking if there is a remindar with WORDS.length, in case the number we got is bigger than the number of words.
     */
    let selectionIndex: number = ((this.gameId - 1) * 4) % WORDS.length

    dailyWords = wordsCopy.splice(selectionIndex, 4)
    if (selectionIndex + 3 > WORDS.length) {
      let wordsToAdd = 4 - dailyWords.length;
      dailyWords = dailyWords.concat(wordsCopy.splice(0, wordsToAdd))
    }
    return dailyWords;
  }
}