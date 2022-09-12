import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HelpDialogComponent } from '../dialogs/help-dialog/help-dialog.component';
import { StatisticsDialogComponent } from '../dialogs/statistics-dialog/statistics.component';
import { LocalStorageService } from '../services/local-storage.service';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(public dialog: MatDialog, private localStorage: LocalStorageService) { }
  className = '';
  @Output() isDarkMode = new EventEmitter<any>(); // For sending slider changes
  @Input() isChecked: boolean = true; // For receiving stored slider state

  ngOnInit(): void {
  }

  onSliderChange({ checked }: MatSlideToggleChange) {
    this.isDarkMode.emit(checked)
  }

  openHelpDialog() {
    const dialogRef = this.dialog.open(HelpDialogComponent, {
      width: "100vh",
      height: "80vh"
    })
  }

  openStatisticsDialog() {
    const dialogRef = this.dialog.open(StatisticsDialogComponent, {
      width: "100vh",
      data: {
        statistics: this.localStorage.getStatistics(),
        turnOfWinning: this.localStorage.getTurnOfWinning(),
        gameId: this.localStorage.getGameId()
      }
    })
  }

}
