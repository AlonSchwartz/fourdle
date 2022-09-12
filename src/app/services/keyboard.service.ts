import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { keyObject, letterObject } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {

  public keySubject = new Subject<keyObject>();
  public lettersObjectSubject = new Subject<[letterObject[], number]>();

  private readonly lettersRow1 = ["ק", "ר", "א", "ט", "ו", "ן", "ם", "פ", "Backspace"]
  private readonly lettersRow2 = ["ש", "ד", "ג", "כ", "ע", "י", "ח", "ל", "ך", "ף"]
  private readonly lettersRow3 = ["Enter", "ז", "ס", "ב", "ה", "נ", "מ", "צ", "ת", "ץ"]
  private keyboardObject = this.createKeyboard();

  private readonly finalLettersMap = new Map([
    ["ם", "מ"],
    ["ן", "נ"],
    ["ץ", "צ"],
    ["ף", "פ"],
    ["ך", "כ"]
  ]);

  constructor() { }

  /** Delivers the clicked key to subscribers */
  deliverKey(key: keyObject) {
    this.keySubject.next(key)
  }

  /** Deilvers key styles to subscribers */
  deliverKeyStyles(data: letterObject[], wordleID: number) {
    this.lettersObjectSubject.next([data, wordleID])
  }

  createKeyboard() {
    let row1: keyObject[] = []
    let row2: keyObject[] = []
    let row3: keyObject[] = []

    this.lettersRow1.forEach(letter => {
      let key: keyObject = { key: letter, style: `conic-gradient(grey 90deg, grey 90deg 180deg, grey 180deg 270deg, grey 270deg)` }
      row1.push(key)
    })
    this.lettersRow2.forEach(letter => {
      let key: keyObject = { key: letter, style: `conic-gradient(grey 90deg, grey 90deg 180deg, grey 180deg 270deg, grey 270deg)` }
      row2.push(key)
    })
    this.lettersRow3.forEach(letter => {
      let key: keyObject = { key: letter, style: `conic-gradient(grey 90deg, grey 90deg 180deg, grey 180deg 270deg, grey 270deg)` }
      row3.push(key)
    })

    let keyboardObj = [row1, row2, row3]
    return keyboardObj;
  }

  getKeyboardObject() {
    return this.keyboardObject;
  }

  setKeyboardObject(keyboardObject: keyObject[][]) {
    this.keyboardObject = keyboardObject;
  }

  /**
   * Mapping letters by <letter, status>. If the same letter have both "inPlace" and "wrongPlace" statuses, we keep only "wrongPlace"
   * Will help is easier for user to see that he didn't found all of that letter positions.
   * @param guess user guess
   * @returns Mapped guess
   */
  mapLetters(guess: letterObject[]): Map<string, string> {
    let lettersMap = new Map();
    // Check if guess have final letters and convert them to regular letters.
    guess = this.replaceFinalLetters(JSON.parse(JSON.stringify(guess)))
    for (let i = 0; i < guess.length; i++) {
      if (lettersMap.get(guess[i].letter)) {
        if (lettersMap.get(guess[i].letter) === "inPlace" && guess[i].status === "wrongPlace") {
          lettersMap.set(guess[i].letter, guess[i].status)
        }
        if (lettersMap.get(guess[i].letter) === "notExists" && (guess[i].status === "inPlace" || guess[i].status === "wrongPlace")) {
          lettersMap.set(guess[i].letter, guess[i].status)
        }

      }
      else {
        lettersMap.set(guess[i].letter, guess[i].status)
      }
    }
    return lettersMap;
  }

  /**
   * Switch letter from regular letter to final letter, or the opposite.
   * For example, switch the letter 'ם' to 'מ', 
   * or the letter 'נ' to 'ן'
   * @param word the word we are changing a letter in
   * @param toFinalLetter Is the change to final letter? 
   * @returns the updated word
   */
  replaceFinalLetters(guess: letterObject[]): letterObject[] {
    if (this.finalLettersMap.has(guess[0].letter)) {
      let letter = this.finalLettersMap.get(guess[0].letter);
      if (letter) {
        guess[0].letter = letter;
      }
    }

    return guess;
  }
}


