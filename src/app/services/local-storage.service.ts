import { Injectable } from '@angular/core';
import { localStorageObject, statisticsObject } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  private localStorage = window.localStorage;
  private guessDistribution: Map<number, number> = this.createGuessDistributionMap();
  private statistics: statisticsObject = { played: 0, wins: 0, winsPercentage: 0, currentStreak: 0, highestStreak: 0, guessDistributionArray: [] }
  private gameId: number = -1;
  private turnOfWinning: string = "X"

  /**
   * Creates a map of number of <guess number, amount of wins at this guess>
   * 
   * For example, if the player have won the game 2 times in 5 guesses, the map will be
   *  <Key: 5, Value: 2>
   * 
  */
  createGuessDistributionMap() {
    let guess_dist = new Map();
    for (let i = 4; i <= 9; i++) {
      guess_dist.set(i, 0)
    }
    return guess_dist
  }

  setGameId(gameId: number) {
    this.gameId = gameId
  }
  getGameId(): number {
    return this.gameId;
  }
  setTurnOfWinning(turn: string) {
    this.turnOfWinning = turn
  }
  getTurnOfWinning(): string {
    return this.turnOfWinning;
  }

  getGuessDistribution() {
    return this.guessDistribution;
    //return this.statistics.guessDistributionArray;
  }

  /**
   * Saves the game state in local storage
   * @param gameState the game state
   */
  save(gameState: localStorageObject) {
    this.localStorage.setItem("game", JSON.stringify(gameState))
    this.gameId = gameState.gameId;
    this.turnOfWinning = gameState.turnOfWinning;
  }

  loadGameHistory() {
    let historyString = this.localStorage.getItem("game");
    if (historyString) {
      let gameHistory: localStorageObject;
      gameHistory = JSON.parse(historyString)
      this.gameId = gameHistory.gameId
      this.turnOfWinning = gameHistory.turnOfWinning;
    }
    return this.localStorage.getItem("game")
  }

  deleteHistory() {
    this.localStorage.removeItem("game")
  }

  updateStatistics(gameWon: boolean, turnOfWinning: number) {
    let statsString = this.localStorage.getItem("statistics");
    if (statsString) {
      let stats: statisticsObject;
      stats = JSON.parse(statsString);
      this.convertArrayStringToMap(stats.guessDistributionArray)
      this.statistics = stats;
    }

    if (gameWon) {
      this.statistics.wins += 1;
      let numberOfWins = this.guessDistribution.get(turnOfWinning)

      if (numberOfWins == undefined) {
        numberOfWins = 0;
      }
      this.guessDistribution.set(turnOfWinning, numberOfWins + 1)
      this.statistics.currentStreak++;

      if (this.statistics.currentStreak >= this.statistics.highestStreak) {
        this.statistics.highestStreak = this.statistics.currentStreak;
      }
    }
    else {
      this.statistics.currentStreak = 0;
    }
    // Calculating the winning percentage
    let percentageString = ((this.statistics.wins / (this.statistics.played + 1)) * 100).toFixed(0)
    this.statistics.winsPercentage = Number(percentageString)

    this.statistics.played = this.statistics.played + 1;
    this.statistics.guessDistributionArray = this.convertMapToArrayString(this.guessDistribution)
    this.localStorage.setItem("statistics", JSON.stringify(this.statistics))
  }

  getStatistics(): statisticsObject {
    let statsString = this.localStorage.getItem("statistics")

    if (statsString != null) {
      let savedStatistics: statisticsObject = JSON.parse(statsString);
      this.convertArrayStringToMap(savedStatistics.guessDistributionArray)
      this.statistics = savedStatistics;
    }

    return this.statistics;
  }

  convertMapToArrayString(map: Map<number, number>): string[] {
    let tempArr: string[] = [];
    map.forEach((value, key) => {
      tempArr[key] = value.toString();
    })
    return tempArr;
  }

  /**
   * Converts a given array of strings into map and stores it in guessDistribution
   */
  convertArrayStringToMap(array: string[]) {
    for (let i = 4; i <= 9; i++) {
      this.guessDistribution.set(i, Number(array[i]))
    }

  }
}
