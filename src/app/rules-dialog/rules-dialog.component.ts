import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Groups } from '../shared/groups'

@Component({
  selector: 'app-rules-dialog',
  templateUrl: './rules-dialog.component.html',
  styleUrls: ['./rules-dialog.component.css']
})
export class RulesDialogComponent {
  valid: boolean = false;
  groups: {name: string, value: string}[]=[];

  constructor(public dialogRef: MatDialogRef<RulesDialogComponent>, @Inject(MAT_DIALOG_DATA) public selGroups: string[]) {
    for(let g of Groups.groups.values())
      this.groups.push(g);
    this.onGroupsChanged();
  }

  onGroupsChanged(): void {
    this.valid = this.selGroups.length > 1 || (this.selGroups.length > 0 && this.selGroups[0] != 'crosses');
  }
}
