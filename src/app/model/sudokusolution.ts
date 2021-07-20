import { AnswerStatus } from './answerstatus';
import { ClueStatus } from './cluestatus';

export interface SudokuSolution {
	all: number[];
	clues: number[];
	answerStatus: AnswerStatus;
	clueStatus: ClueStatus;
}