import React, { Component } from 'react';
import KeyboardEventHandler from 'react-keyboard-event-handler';
import './App.css';

interface Props {}

interface CellData {
	letter: string;
	marked: boolean;
}

interface State {
	grid: CellData[][];
	cipher: {
		[letter: string]: string;
	};
	cursorRow: number;
	cursorColumn: number;
	cursorPlain: boolean;
}

const createEmptyGrid = () => {
	const gridText: CellData[][] = [];
	for (let r = 0; r < 12; r += 1) {
		gridText.push([]);
		for (let c = 0; c < 12; c += 1) {
			gridText[r].push({
				letter: '',
				marked: false,
			});
		}
	}
	return gridText;
};

class App extends Component<Props, State> {
	readonly state: Readonly<State> = {
		grid: createEmptyGrid(),
		cipher: {},
		cursorRow: 0,
		cursorColumn: 0,
		cursorPlain: false,
	};

	updateCell = (r: number, c: number, newCell: CellData) => {
		const { grid } = this.state;
		const newGrid: CellData[][] = [];
		grid.forEach((row, ri) => {
			newGrid.push([]);
			row.forEach((cell, ci) => {
				newGrid[ri].push((r === ri && c === ci) ? newCell : cell);
			});
		});
		this.setState({ grid: newGrid });
	}

	toggleMark = (r: number, c: number) => {
		const cell = this.state.grid[r][c];
		this.updateCell(r, c, {
			...cell,
			marked: !cell.marked,
		});
	}

	onClickCell = (cursorRow: number, cursorColumn: number, cursorPlain: boolean) => {
		if (cursorRow === this.state.cursorRow
			&& cursorColumn === this.state.cursorColumn
			&& cursorPlain === this.state.cursorPlain) {
			this.toggleMark(cursorRow, cursorColumn);
		} else {
			this.setState({
				cursorRow,
				cursorColumn,
				cursorPlain,
			});
		}
	}

	inputLetter = (letter: string) => {
		const {
			cursorRow,
			cursorColumn,
			cursorPlain,
			grid,
			cipher,
		} = this.state;
		const cell = grid[cursorRow][cursorColumn];
		if (cursorPlain) {
			if (cell.letter) {
				this.setState({
					cipher: {
						...cipher,
						[cell.letter]: letter,
					},
				});
			}
		} else {
			this.updateCell(cursorRow, cursorColumn, {
				...cell,
				letter,
			});
		}
		this.handleKey('right');
	}

	handleKey = (key: string) => {
		const {
			cursorRow,
			cursorColumn,
			cursorPlain,
		} = this.state;
		switch (key) {
			case 'up':
				if (cursorRow > 0) {
					this.setState({
						cursorRow: cursorRow - 1,
					});
				}
				break;
			case 'down':
				if (cursorRow < 11) {
					this.setState({
						cursorRow: cursorRow + 1,
					});
				}
				break;
			case 'left':
			case 'backspace':
			case 'delete':
				if (cursorColumn === 0) {
					if (cursorRow === 0) {
						this.setState({
							cursorRow: 11,
							cursorColumn: 11,
						});
					} else {
						this.setState({
							cursorRow: cursorRow - 1,
							cursorColumn: 11,
						});
					}
				} else {
					this.setState({
						cursorColumn: cursorColumn - 1,
					});
				}
				break;
			case 'right':
				if (cursorColumn === 11) {
					if (cursorRow === 11) {
						this.setState({
							cursorRow: 0,
							cursorColumn: 0,
						});
					} else {
						this.setState({
							cursorRow: cursorRow + 1,
							cursorColumn: 0,
						});
					}
				} else {
					this.setState({
						cursorColumn: cursorColumn + 1,
					});
				}
				break;
			case 'space':
				this.toggleMark(cursorRow, cursorColumn);
				break;
			case 'enter':
				this.setState({
					cursorPlain: !cursorPlain,
				});
				break;
			default:
				this.inputLetter(key);
		}
	}

	render() {
		const {
			grid,
			cipher,
			cursorRow,
			cursorColumn,
			cursorPlain,
		} = this.state;
		return (
			<div className="layout">
				<div className="grid">
					{grid.map((row, r) => (
						<div key={r} className="row">
							{row.map((cell, c) => {
								const classNames = ['cell'];
								if (cell.marked) {
									classNames.push('marked');
								}
								if (cursorRow === r && cursorColumn === c) {
									classNames.push(cursorPlain ? 'withCursorShadow' : 'withCursor');
								}
								return (
									<div
										key={c}
										className={classNames.join(' ')}
										onClick={() => this.onClickCell(r, c, false)}
									>
										{cell.letter}
									</div>
								);
							})}
						</div>
					))}
				</div>
				<div className="spacer"></div>
				<div className="grid">
					{grid.map((row, r) => (
						<div key={r} className="row">
							{row.map((cell, c) => {
								const classNames = ['cell'];
								if (cell.marked) {
									classNames.push('marked');
								}
								if (cursorRow === r && cursorColumn === c) {
									classNames.push(cursorPlain ? 'withCursor' : 'withCursorShadow');
								}
								return (
									<div
										key={c}
										className={classNames.join(' ')}
										onClick={() => this.onClickCell(r, c, true)}
									>
										{(cell.letter && cipher[cell.letter]) || ''}
									</div>
								);
							})}
						</div>
					))}
				</div>
				<KeyboardEventHandler
					handleKeys={[
						'alphabetic',
						'up',
						'down',
						'left',
						'right',
						'space',
						'backspace',
						'delete',
						'enter',
					]}
					onKeyEvent={this.handleKey}
				/>
			</div>
		);
	}
}

export default App;
