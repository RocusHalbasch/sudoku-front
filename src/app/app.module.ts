import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LayoutModule } from '@angular/cdk/layout';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { AppComponent } from './app.component';
import { SudokuService } from './service/sudoku.service';
import { SudokuSolverComponent } from './sudoku-solver/sudoku-solver.component';
import { RulesDialogComponent } from './rules-dialog/rules-dialog.component';

const routes: Routes = [
  { path: 'sudoku', component: SudokuSolverComponent },
  { path: '', redirectTo: 'sudoku', pathMatch: 'full' },
  { path: '**', redirectTo: 'sudoku', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    SudokuSolverComponent,
    RulesDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot(routes),
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    LayoutModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDialogModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatMenuModule
  ],
  providers: [SudokuService],
  bootstrap: [AppComponent]
})
export class AppModule { }
