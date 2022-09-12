import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { WordleComponent } from './wordle/wordle.component';
import { KeyboardComponent } from './keyboard/keyboard.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HeaderComponent } from './header/header.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatGridListModule } from '@angular/material/grid-list';
import { HelpDialogComponent } from './dialogs/help-dialog/help-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { StatisticsDialogComponent } from './dialogs/statistics-dialog/statistics.component';
import { ClipboardModule } from '@angular/cdk/clipboard'
import { LayoutModule } from '@angular/cdk/layout';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';




@NgModule({
  declarations: [
    AppComponent,
    WordleComponent,
    KeyboardComponent,
    HeaderComponent,
    HelpDialogComponent,
    StatisticsDialogComponent
  ],
  imports: [
    BrowserModule,
    MatSnackBarModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatGridListModule,
    MatDialogModule,
    ClipboardModule,
    LayoutModule,
    MatSlideToggleModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
