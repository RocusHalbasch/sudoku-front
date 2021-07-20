import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SudokuSolution } from '../model/sudokusolution';

@Injectable({
  providedIn: 'root'
})
export class SudokuService {
  private sudokuUrl: string = environment.sudokuUrl;

  constructor(private http: HttpClient) { }

  private getGroupsParams(groups: string[]): string[] {
    let params: string[] = [];
    for(let group of groups)
      params.push('groups='+group);
    return params;
  }

  public solve(board: string, groups: string[]): Observable<SudokuSolution> {
    let params = this.getGroupsParams(groups);
    params.push('solve='+board);
    return this.http.get<SudokuSolution>(this.sudokuUrl+'?'+params.join('&'));
  }

  public generate(groups: string[]): Observable<SudokuSolution> {
    return this.http.get<SudokuSolution>(this.sudokuUrl+'?'+this.getGroupsParams(groups).join('&'));
  }
}
