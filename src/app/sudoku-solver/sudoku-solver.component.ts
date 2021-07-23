import { Component, DoCheck, OnInit, HostListener, HostBinding, IterableDiffers, IterableDiffer, QueryList, ViewChildren, ElementRef, Input } from '@angular/core';
import { SudokuService } from '../service/sudoku.service';
import { ClueStatus } from '../model/cluestatus';
import { AnswerStatus } from '../model/answerstatus';
import { SudokuSolution } from '../model/sudokusolution';
import { MatDialog } from '@angular/material/dialog';
import { RulesDialogComponent } from '../rules-dialog/rules-dialog.component';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Groups } from '../shared/groups';

@Component({
  selector: 'app-sudoku-solver',
  templateUrl: './sudoku-solver.component.html',
  styleUrls: ['./sudoku-solver.component.css']
})
export class SudokuSolverComponent implements DoCheck, OnInit {
  selGroups: string[];
  overlayGroups: string[];
  selNumber: string[];
  cells: string[];
  clues: string[];
  all: string[];
  cluesSet: boolean;
  pencil: boolean;
  pencilMarks: boolean[][];
  warning: string = '';
  canPlay: boolean = false;
  numbers: number[] = [1,2,3,4,5,6,7,8,9];
  differ: IterableDiffer<string>;
  @HostBinding("style.--sudoku-cell-size") @Input() sudokuCellSize: string = '40px';
  @ViewChildren('cellDiv') cellDivs!: QueryList<ElementRef>;

  constructor(iterableDiffers: IterableDiffers, private sudoku: SudokuService, public rulesDialog: MatDialog, private hostElement: ElementRef) {
    let emptyCells = JSON.stringify(new Array(81).fill(''));
    let emptyMarks = JSON.stringify(new Array(81).fill(false).map(() => new Array(9).fill(false)));
    this.selGroups = JSON.parse(localStorage.getItem('selGroups') || '["rows", "columns", "blocks"]');
    this.overlayGroups = JSON.parse(localStorage.getItem('overlayGroups') || '[]');
    this.selNumber = JSON.parse(localStorage.getItem('selNumber') || '[]');
    this.cells = JSON.parse(localStorage.getItem('cells') || emptyCells);
    this.clues = JSON.parse(localStorage.getItem('clues') || emptyCells);
    this.all = JSON.parse(localStorage.getItem('all') || emptyCells);
    this.cluesSet = JSON.parse(localStorage.getItem('cluesSet') || 'false');
    this.pencil = JSON.parse(localStorage.getItem('pencil') || 'false');
    this.pencilMarks = JSON.parse(localStorage.getItem('pencilMarks') || emptyMarks);
    this.differ = iterableDiffers.find(this.cells).create(undefined);
  }

  isClue(index: number): boolean {
    return this.clues[index]!='';
  }

  isError(index: number): boolean {
    return this.cluesSet && this.clues[index]=='' && this.cells[index]!='' && this.cells[index]!=this.all[index];
  }

  isBlockLeft(index: number): boolean {
    return index%3==0;
  }

  isBlockTop(index: number): boolean {
    return Math.floor(index/9)%3==0;
  }

  isNotPossible(index: number): boolean {
    if(this.overlayGroups.length == 0 || this.overlayGroups[0] != 'pencil' || this.selNumber.length == 0)
      return false;
    if(this.cells[index] != '')
      return true;
    let num = +this.selNumber[0];
    return !this.pencilMarks[index][num-1];
  }

  setClues(): void {
    this.clues = [...this.cells];
    this.cluesSet = true;
  }

  solve(): void {
    for (let i = 0; i < 81; i++)
      this.cells[i] = this.all[i];   
  }

  clearClues(): void {
    for(let cell of this.pencilMarks)
    cell.fill(false);
  }

  clear(): void {
    for (let i = 0; i < 81; i++)
      this.cells[i] = this.clues[i];
    if(this.cluesSet)
      this.clearClues();
  }

  reset(): void {
    this.cells = new Array(81).fill('');
    this.clues = new Array(81).fill('');
    this.all = new Array(81).fill('');
    this.clearClues();
    this.cluesSet = false;
    if(this.overlayGroups[0]='pencil')
      this.overlayGroups = [];
  }

  getCellsString(): string {
      let cellString = '';
      this.cells.forEach(function(cell) {
        if(cell==="")
          cellString += ".";
        else
          cellString += cell;
      });
    return cellString;
  }

  getGroupId(cell: number): string {
    if(this.overlayGroups.length == 0)
      return "0";
    let group = Groups.groups.get(this.overlayGroups[0]);
    if(group != undefined)
      return group.groups.substring(cell, cell+1);
    else
      return "0";
  }

  getGroupInitial(group: string): string|undefined {
    return Groups.groups.get(group)?.initial;
  }

  getGroupName(group: string): string|undefined {
    return Groups.groups.get(group)?.name;
  }

  generate(): void {
    this.sudoku.generate(this.selGroups).subscribe(data => {
      for(let i=0; i<81; i++)
        this.cells[i] = data.clues[i] == 0 ? '' : data.clues[i].toString();
      this.handleSolution(data);
    }, error => this.setCommunicationErrorWarning());
  }

  updateSolution() {
    this.sudoku.solve(this.getCellsString(), this.selGroups).subscribe(data => this.handleSolution(data), 
      error => this.setCommunicationErrorWarning());
  }

  handleSolution(data: SudokuSolution): void {
    if(data.clueStatus == ClueStatus.VALID && data.answerStatus == AnswerStatus.SOLVED){
      this.warning = '';
      this.all = [];
      data.all.forEach(cell => {this.all.push(cell.toString())});
      this.canPlay = true;
    } else {
      if(data.clueStatus == ClueStatus.INVALID) 
        this.warning = 'Clues violate Sudoku rules.';
      else if(data.answerStatus == AnswerStatus.MORE_THAN_ONE)
        this.warning = 'More than one solution.';
      else if(data.answerStatus == AnswerStatus.UN_SOLVABLE)
        this.warning = 'There are no valid solutions.';
      this.canPlay = false;
    }
  }

  setCommunicationErrorWarning(): void {
    this.warning = 'Error communicating with server.';
    this.canPlay = false;
  }

  updateLocalStorage(): void {
    localStorage.setItem('selGroups', JSON.stringify(this.selGroups));
    localStorage.setItem('overlayGroups', JSON.stringify(this.overlayGroups));
    localStorage.setItem('selNumber', JSON.stringify(this.selNumber));
    localStorage.setItem('cells', JSON.stringify(this.cells));
    localStorage.setItem('clues', JSON.stringify(this.clues));
    localStorage.setItem('all', JSON.stringify(this.all));
    localStorage.setItem('cluesSet', JSON.stringify(this.cluesSet));
    localStorage.setItem('pencil', JSON.stringify(this.pencil));
    localStorage.setItem('pencilMarks', JSON.stringify(this.pencilMarks));
  }

  trackByIndex(index: number, _obj: string): any {
    return index;
  }

  toggleGroupOverlay(event: MatButtonToggleChange): void {
    let toggle = event.source;
    if(toggle)
      this.overlayGroups = [toggle.value];
  }

  toggleNumberSelection(event: MatButtonToggleChange): void {
    let toggle = event.source;
    if(toggle)
      this.selNumber = [toggle.value];
  }

  onCellClick(index: number): void {
    if(!this.isClue(index) && this.selNumber.length != 0) {
      if(this.cluesSet && this.pencil) {
        if(this.cells[index] == '') {
          let num = +this.selNumber[0];
          this.pencilMarks[index][num-1] = !this.pencilMarks[index][num-1];
        }
      } else {
        if(this.cells[index] == this.selNumber[0])
          this.cells[index] = '';
        else
          this.cells[index] = this.selNumber[0];
      }
    }
  }

  onKey(event: KeyboardEvent, index: number): void {
    if(!this.isClue(index)) {
      if(event.key == '0' || event.key == 'Backspace' || event.key == 'Delete')
        this.cells[index] = '';
      else if(!isNaN(Number(event.key)) && event.key != ' ')
        this.cells[index] = event.key;
    }
    if(event.key.startsWith("Arrow")) {
      if(event.key== "ArrowUp" && index > 8)
        this.cellDivs.get(index-9)?.nativeElement.focus();
      else if(event.key== "ArrowDown" && index < 72)
        this.cellDivs.get(index+9)?.nativeElement.focus();
      else if(event.key== "ArrowLeft" && index%9 != 0)
        this.cellDivs.get(index-1)?.nativeElement.focus();
      else if(event.key== "ArrowRight" && index%9 != 8)
        this.cellDivs.get(index+1)?.nativeElement.focus();
    }
  }

  togglePencil(): void {
    this.pencil = !this.pencil;
  }

  removePencilMarks(val: string, cell: number): void {
    if(val != '') {
      let markPos = +val-1;
      this.selGroups.forEach(group => {
        let groupsStr = (Groups.groups.get(group)?.groups||'');
        for (var i = 0; i < groupsStr.length; i++) {
          if(groupsStr.charAt(i) != '0' && groupsStr.charAt(i) == groupsStr.charAt(cell))
            this.pencilMarks[i][markPos] = false;
        }
      });
    }
  }

  fillPencilMarks(): void {
    this.pencilMarks.forEach((marks, cell)=>marks.forEach((mark, index)=>marks[index]=this.clues[cell]==''));
    this.cells.forEach((val, cell) => this.removePencilMarks(val,cell));
  }

  openRulesDialog(): void {
    const dialogRef = this.rulesDialog.open(RulesDialogComponent, {
      width: '250px',
      data: this.selGroups
    });

    dialogRef.afterClosed().subscribe((result: string[]) => {
      if(result != undefined) {
        this.selGroups = result;
        if(this.overlayGroups.length > 0 && this.selGroups.indexOf(this.overlayGroups[0]) < 0)
          this.overlayGroups.pop();
        this.updateSolution();
      }
    });
  }

  ngDoCheck(): void {
    if(!this.cluesSet && this.differ.diff(this.cells)) {
      this.updateSolution();
    }
    this.updateLocalStorage();
  }

  ngOnInit() {
    let hostWidth = this.hostElement.nativeElement.getBoundingClientRect().width;
    this.sudokuCellSize = Math.min(40, Math.floor((hostWidth - 32 - 15 - 3 - 6)/9))+'px';
  }

  @HostListener('window:resize', ['$event.target']) onResize() { 
    let hostWidth = this.hostElement.nativeElement.getBoundingClientRect().width;
    this.sudokuCellSize = Math.min(40, Math.floor((hostWidth - 32 - 15 - 3 - 6)/9))+'px';
  }
}
