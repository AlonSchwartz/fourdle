import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tile } from 'src/app/interfaces';
import { GameService } from 'src/app/services/game.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';



@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsDialogComponent implements OnInit {

  constructor(private localStorage: LocalStorageService, @Inject(MAT_DIALOG_DATA) public data: any, private _snackBar: MatSnackBar, private game: GameService) { }
  shareText: string = "";
  private readonly styleMap = new Map([
    ["inPlace", "🟩"],
    ["wrongPlace", "🟨"],
    ["notExists", "⬜"],
    ["", "⬛"],
  ])

  width = "50vh"
  countDown = {
    hours: "0",
    mins: "0",
    seconds: "0"
  }
  distWidth: string[] = this.calcWidth();
  gameEnded = this.game.isGameEnded();
  dailyWords: string[] = []
  solvedWordles: boolean[] = [];

  tiles: Tile[] = [
    { text: 'header', cols: 1, rows: 1 },
    { text: 'stats', cols: 1, rows: 2 },
    { text: 'dist-header', cols: 1, rows: 1 },
    { text: 'distribution', cols: 1, rows: 4 },
    { text: 'daily-words', cols: 0, rows: 0 },
    { text: 'share', cols: 0, rows: 0 },
    { text: 'timer-header', cols: 1, rows: 1 },
    { text: 'timer', cols: 1, rows: 1 },
  ];

  ngOnInit() {
    this.newGameCountdown()
    setInterval(() => {
      this.newGameCountdown()
    }, 1000)

    //dialog size configurations according to content
    if (this.data.statistics.guessDistributionArray.length == 0) {
      this.tiles.forEach(tile => {
        if (tile.text === "distribution") {
          tile.rows = 1;
        }
      })
    }
    this.width = "50vh"

    if (this.gameEnded) {
      this.tiles.forEach(tile => {
        if (tile.text === 'daily-words') {
          tile.cols = 1;
          tile.rows = 1;
        }
        if (tile.text === 'share') {
          tile.cols = 1;
          tile.rows = 2;
        }
      })
      this.dailyWords = this.game.getDailyWords();
      this.solvedWordles = this.game.getSolvedWordles();
      this.shareText = this.generateShareText();
    }
  }

  /**
   * Calculates the width of each bar in the distribution array
   * @returns an Array with each bar width
   */
  calcWidth(): string[] {
    let widthArr: string[] = [];
    let totalWins = this.data.statistics.wins;
    if (this.data.statistics.guessDistributionArray) {
      for (let winsAtXGuess of this.data.statistics.guessDistributionArray) {
        if (winsAtXGuess != null) {
          let widthString = ((winsAtXGuess / totalWins) * 100).toFixed(0)
          widthArr.push(widthString + "vmin")
        }
      }
    }

    return widthArr
  }

  /**
   * Checks if the users is using a mobile phone
   */
  checkIfMobile(): boolean {
    var isMobile = false;
    // device detection
    if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
      || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
      isMobile = true;
    }
    return isMobile;
  }

  newGameCountdown() {
    const currentDate = new Date();
    const tomorrowsDate = new Date(currentDate)
    tomorrowsDate.setDate(tomorrowsDate.getDate() + 1)
    tomorrowsDate.setHours(0, 0, 0, 0);

    let timeLeft = tomorrowsDate.getTime() - currentDate.getTime();

    let hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    this.countDown.hours = hours.toString();
    this.countDown.mins = minutes.toString();
    this.countDown.seconds = seconds.toString();

    // In order to show the user 1 digits numbers with 2 digits, we add 0 if needed
    if (seconds.toString().length == 1) {
      this.countDown.seconds = "0" + seconds.toString()
    }
    if (minutes.toString().length == 1) {
      this.countDown.mins = "0" + minutes.toString()
    }
    if (hours.toString().length == 1) {
      this.countDown.hours = "0" + hours.toString()
    }
  }

  openSnackBar() {
    this._snackBar.open("הועתק ללוח", "", {
      duration: 1000,
      verticalPosition: "bottom"
    });
  }

  shareToWhatsapp() {
    let text = this.shareText;
    text = encodeURIComponent(text)
    this.checkIfMobile() ? window.open("whatsapp://send?text=" + text)
      : window.open("https://web.whatsapp.com/send?text=" + text)
  }

  generateShareText(): string {
    let text = "";
    let textArray = [`וורדל מרובע | פורדל ${this.data.gameId}\r\nניסיון ${this.data.turnOfWinning} מתוך 9\r\n\r\n`]
    let wordles = this.game.getGuesses();

    //Converts all wordles guesses into sqaures, according to correctness of the guess letters
    let statusesObject: string[][][] = []
    wordles.forEach(wordle => {
      let wordleStylesArray: string[][] = []
      wordle.forEach(guess => {
        let guessStyleArray: string[] = []
        guess.forEach(letterObject => {
          let square = "";
          if (this.styleMap.has(letterObject.status)) {
            let mapItem = this.styleMap.get(letterObject.status)
            if (mapItem) {
              square = mapItem;
            }
          }
          guessStyleArray.push(square)
        })
        wordleStylesArray.push(guessStyleArray)
      })
      statusesObject.push(wordleStylesArray)
    })

    for (let i = 0; i < statusesObject[0].length; i++) {
      textArray.push(statusesObject[0][i].join() + " " + statusesObject[1][i].join() + "\r\n")
    }
    textArray.push("\r\n ")
    for (let i = 0; i < statusesObject[0].length; i++) {
      textArray.push(statusesObject[2][i].join() + " " + statusesObject[3][i].join() + "\r\n")
    }
    text = textArray.join().replace(/[ ]*,[]*|[]+/g, '')
    return text
  }

  deleteHistory() {
    this.localStorage.deleteHistory();
  }
}
