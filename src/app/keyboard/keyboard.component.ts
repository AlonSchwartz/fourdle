import { Component, OnInit } from '@angular/core';
import { keyObject, letterObject } from '../interfaces';
import { KeyboardService } from '../services/keyboard.service';
import { LayoutService } from '../services/layout.service';


@Component({
  selector: 'app-keyboard',
  templateUrl: './keyboard.component.html',
  styleUrls: ['./keyboard.component.css']
})
export class KeyboardComponent implements OnInit {

  constructor(private keyboard: KeyboardService, private layout: LayoutService) { }

  keyboardObject: keyObject[][] = this.keyboard.getKeyboardObject();
  wordle_0 = "green 270deg" //top left area
  wordle_2 = " red 180deg 270deg" //bottom left area
  wordle_1 = "purple 90deg" // top right area
  wordle_3 = "#f1cf38 90deg 180deg" //bottom right area

  colorPositions = ["90deg", "270deg", "180deg 270deg", "90deg 180deg"]
  defaultStyle = "conic-gradient(grey 0deg 360deg)"
  finishedKeysArray: Array<string[]> = [[], [], [], []]; //Each array stores the keys of according wordle that their style is done (array[0] is for wordle 0 etc)
  isPortrait: boolean = false; // If the player's device on portrait mode

  ngOnInit(): void {

    // Getting stored keyboard styles - if the player returned playing, after playing earlier and closed the window
    this.keyboard.lettersObjectSubject.subscribe(response => {
      this.applyKeyStyle(response[0], response[1])
    })

    this.layout.screenLayoutObserver.subscribe(isPortrait => {
      if (isPortrait) {
        this.isPortrait = true;
      }
      else {
        this.isPortrait = false;
      }
    })
  }

  /** Emits the clicked key to keyboard service */
  emitKey(key: any) {
    this.keyboard.deliverKey(key)
  }

  /**
   * Applying key styles, for given keys, based on given letter statusses.
   * @param lettersStatuses the letters with their statuses
   * @param wordleID the ID of the wordle that delivered these letters.
   */
  applyKeyStyle(lettersStatuses: letterObject[], wordleID: number) {
    let lettersMap = this.keyboard.mapLetters(lettersStatuses);

    lettersMap.forEach((status, letter) => {
      let letterPosition = this.findLetterPosition(letter)
      if (letterPosition === [-1]) {
        return;
      }
      let style = this.keyboardObject[letterPosition[0]][letterPosition[1]].style;
      let gradientData = style.slice(15, style.length - 1)
      let gradientDataArray = gradientData.split(", ") // will always be at this form: wordle1, wordle3, wordle2, wordle0
      let newStyle = ""

      if (status === "inPlace") {
        newStyle = this.prepareKeyStyle(gradientDataArray, "green", wordleID)
        this.finishedKeysArray[wordleID].push(letter)
      }
      else if (status === "wrongPlace") {
        newStyle = this.prepareKeyStyle(gradientDataArray, "#f1cf38", wordleID)
      }
      else if (status === "notExists") {
        newStyle = this.prepareKeyStyle(gradientDataArray, "#BEBEBE", wordleID)
      }
      this.keyboardObject[letterPosition[0]][letterPosition[1]].style = newStyle;
    })


    // Changing final letters to have the same style as their regular form
    this.keyboardObject[0][5].style = this.keyboardObject[2][5].style
    this.keyboardObject[0][6].style = this.keyboardObject[2][6].style
    this.keyboardObject[1][8].style = this.keyboardObject[1][3].style
    this.keyboardObject[1][9].style = this.keyboardObject[0][7].style
    this.keyboardObject[2][9].style = this.keyboardObject[2][7].style

  }

  /**
   *  Preparing the style for each key
   * @param oldStyleArr the old style of the key, in the form of [wordle1, wordle3, wordle2, wordle0]
   * @param color the new color that we need to apply
   * @param wordleID uses us to know which part of the key we need to change
   * @returns the new key style
   */
  prepareKeyStyle(oldStyleArr: string[], color: string, wordleID: number) {
    if (wordleID == 0) {
      let newStyleArr = oldStyleArr[3].split(" ")
      if (newStyleArr[0] != "green")
        newStyleArr[0] = color;
      let tempString = newStyleArr.join(" ");
      oldStyleArr[3] = tempString
    }
    else if (wordleID == 1) {
      let newStyleArr = oldStyleArr[0].split(" ")
      if (newStyleArr[0] != "green")
        newStyleArr[0] = color;
      let tempString = newStyleArr.join(" ");
      oldStyleArr[0] = tempString;
    }
    else if (wordleID == 2) {
      let newStyleArr = oldStyleArr[2].split(" ")
      if (newStyleArr[0] != "green")
        newStyleArr[0] = color;
      let tempString = newStyleArr.join(" ");
      oldStyleArr[2] = tempString;
    }
    else if (wordleID == 3) {
      let newStyleArr = oldStyleArr[1].split(" ")
      if (newStyleArr[0] != "green")
        newStyleArr[0] = color;
      let tempString = newStyleArr.join(" ");
      oldStyleArr[1] = tempString;
    }
    let newStyle = "conic-gradient(" + oldStyleArr.join(", ") + ")"
    return newStyle
  }

  /**
   * Finds a letter position on the keyboard.
   * @param letter the letter we are searching
   * @returns letters position, or [-1] if not found
   */
  findLetterPosition(letter: string): number[] {
    for (let i = 0; i < this.keyboardObject.length; i++) {
      for (let j = 0; j < this.keyboardObject[i].length; j++) {
        if (this.keyboardObject[i][j].key == letter) {
          let position = [i, j]
          return position;
        }
      }
    }
    return [-1];
  }
}
