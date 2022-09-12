export interface letterObject {
    letter: string,
    status: string
}

export interface keyObject {
    key: string,
    style: string
}

export interface responseObject {
    isDailyWord: boolean,
    lettersStatuses: Array<letterObject>
}

export interface Tile {
    cols: number;
    rows: number;
    text: string;
}

export interface localStorageObject {
    gameId: number;
    guesses: wordleObject[],
    keyboard: keyObject[][],
    turnOfWinning: string;
}

export interface wordleObject {
    guesses: letterObject[][];
    wordleId: number;
    solved: boolean;
    gameOver: boolean;
    currentGuess: number;
}

export interface statisticsObject {
    played: number;
    wins: number;
    winsPercentage: number;
    currentStreak: number;
    highestStreak: number;
    guessDistributionArray: string[];
}