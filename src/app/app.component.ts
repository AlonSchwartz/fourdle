import { Component, HostBinding, OnInit } from '@angular/core';
import { Tile } from './interfaces';
import { LayoutService } from './services/layout.service';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  desiredHeight: string = "15vh";
  @HostBinding('class') className = "";
  isDarkMode: boolean = false;

  constructor(private layout: LayoutService, private overlay: OverlayContainer) { }

  tiles: Tile[] = [
    { text: 'blank', cols: 1, rows: 6 },
    { text: 'game', cols: 8, rows: 5 },
    { text: 'blank', cols: 1, rows: 6 },
    { text: 'keyboard', cols: 8, rows: 1 },
  ];

  ngOnInit() {
    this.initLayoutObserver()
    let darkModeData = window.localStorage.getItem("isDarkMode")
    if (darkModeData) {
      this.isDarkMode = JSON.parse(darkModeData)
      if (this.isDarkMode) {
        this.className = "darkMode"
        this.switchMode(this.isDarkMode)
      }
    }
  }

  /**
   * Switching mode from light to dark mode, and vice versa
   * @param isDarkMode are we switching to dark mode
   */
  switchMode(isDarkMode: boolean) {
    const darkClassName = 'darkMode';
    this.className = isDarkMode ? darkClassName : '';
    if (isDarkMode) {
      this.overlay.getContainerElement().classList.add(darkClassName);
      document.body.style.setProperty('--main-background', '#303030');
      window.localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode))
    } else {
      this.overlay.getContainerElement().classList.remove(darkClassName);
      document.body.style.setProperty('--main-background', 'white');
      window.localStorage.setItem("isDarkMode", JSON.stringify(isDarkMode))
    }
  }

  /**
   * Configuring screen according to current layout
   */
  initLayoutObserver() {
    this.layout.screenLayoutObserver.subscribe(isLandscape => {
      if (isLandscape) {
        this.tiles.forEach(tile => {
          if (tile.text == "game") {
            tile.rows = 5
            this.desiredHeight = "13.5vh"
          }
          if (tile.text == "blank") {
            tile.rows = 5
          }
          if (tile.text == "keyboard") {
            tile.cols = 10
          }
        })
      }
      else {
        this.tiles.forEach(tile => {
          if (tile.text == "game") {
            tile.rows = 5
            this.desiredHeight = "15vh"
          }
          if (tile.text == "blank") {
            tile.rows = 6
          }
          if (tile.text == "keyboard") {
            tile.cols = 8
          }
        })
      }
    })
  }
}
