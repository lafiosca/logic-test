import React, { Component, ChangeEvent } from 'react';
import './App.css';

interface Props {}

enum Operation {
	None = -1,
	True = 0,
	False = 1,
	IsCorrect = 2,
	IsNotCorrect = 3,
	And = 4,
	Or = 5,
	Xor = 6,
	Nand = 7,
	Nor = 8,
}

enum Letter {
	None = -1,
	A = 0,
	B = 1,
	C = 2,
	D = 3,
	E = 4,
}

interface Choice {
	operation: Operation;
	letter1: Letter;
	letter2: Letter;
}

interface Question {
	choices: Choice[];
	solutions: boolean[][];
}

interface State {
	questions: Question[];
}

const niceOperationNames = [
	'Sky is blue',
	'Pigs can fly',
	'is correct',
	'is incorrect',
	'are correct',
	'either is correct (or both)',
	'exactly one is correct',
	'not both correct',
	'neither is correct',
];

const getOperationOptions = () => {
	const options: JSX.Element[] = [];
	for (const k in Operation) {
		if (isNaN(Number(k))) {
			const v = Operation[k];
			options.push((
				<option key={k} value={v}>{Number(v) >= 0 ? niceOperationNames[v] : '--'}</option>
			));
		}
	}
	return options;
};

const getLetterOptions = (operation: Operation, letterNum: number) => {
	const options: JSX.Element[] = [];
	for (const k in Letter) {
		if (isNaN(Number(k))) {
			const v = Letter[k];
			const vNum = Number(v);
			const opNum = Number(operation);
			if (vNum === -1 || (letterNum === 1 && opNum >= 2) || (letterNum === 2 && opNum >= 4)) {
				options.push((
					<option key={k} value={v}>{k}</option>
				));
			}
		}
	}
	return options;
};

const initializeQuestions = () => {
	const questions: Question[] = [];
	for (let i = 0; i < 12; i += 1) {
		const choices: Choice[] = [];
		for (let j = 0; j < 5; j += 1) {
			choices.push({
				operation: Operation.None,
				letter1: Letter.None,
				letter2: Letter.None,
			});
		}
		questions.push({
			choices,
			solutions: [],
		});
	}
	return questions;
};

const isChoiceValid = (choice: Choice, c: number, truthTable: boolean[]) => {
	let targetTruth: boolean | null = null;
	switch (choice.operation) {
		case Operation.True:
			targetTruth = true;
			break;
		case Operation.False:
			targetTruth = false;
			break;
		case Operation.IsCorrect:
			if (choice.letter1 !== Letter.None) {
				targetTruth = truthTable[choice.letter1];
			}
			break;
		case Operation.IsNotCorrect:
			if (choice.letter1 !== Letter.None) {
				targetTruth = !truthTable[choice.letter1];
			}
			break;
		case Operation.And:
			if (choice.letter1 !== Letter.None && choice.letter2 !== Letter.None) {
				targetTruth = truthTable[choice.letter1] && truthTable[choice.letter2];
			}
			break;
		case Operation.Or:
			if (choice.letter1 !== Letter.None && choice.letter2 !== Letter.None) {
				targetTruth = truthTable[choice.letter1] || truthTable[choice.letter2];
			}
			break;
		case Operation.Xor:
			if (choice.letter1 !== Letter.None && choice.letter2 !== Letter.None) {
				targetTruth = truthTable[choice.letter1]
					? !truthTable[choice.letter2]
					: truthTable[choice.letter2];
			}
			break;
		case Operation.Nand:
			if (choice.letter1 !== Letter.None && choice.letter2 !== Letter.None) {
				targetTruth = !truthTable[choice.letter1] || !truthTable[choice.letter2];
			}
			break;
		case Operation.Nor:
			if (choice.letter1 !== Letter.None && choice.letter2 !== Letter.None) {
				targetTruth = !truthTable[choice.letter1] && !truthTable[choice.letter2];
			}
			break;
	}
	return (targetTruth === null) || (truthTable[c] === targetTruth);
};

class App extends Component<Props, State> {
	readonly state: Readonly<State> = {
		questions: initializeQuestions(),
	};

	solve = (q: number) => {
		const { choices } = this.state.questions[q];
		const solutions: boolean[][] = [];
		for (let s = 1; s <= 26; s += 1) {
			const truthTable = [
				s >> 4 === 1,
				s % 16 >> 3 === 1,
				s % 8 >> 2 === 1,
				s % 4 >> 1 === 1,
				s % 2 === 1,
			];
			console.log(`truthTable for ${s}: ${JSON.stringify(truthTable)}`);
			let valid = true;
			for (let c = 0; valid && c < 5; c += 1) {
				valid = isChoiceValid(choices[c], c, truthTable);
			}
			if (valid) {
				console.log(`${s} is valid`);
				solutions.push(truthTable);
			}
		}
		this.setState({
			questions: this.state.questions.map((question, oq) =>
				(oq !== q) ? question : {
					...question,
					solutions,
				}),
		});
	}

	selectOperation = (q: number, c: number, e: ChangeEvent<HTMLSelectElement>) => {
		this.setState(
			{
				questions: this.state.questions.map((question, oq) => {
					if (oq !== q) {
						return question;
					}
					const newChoices = question.choices.map((choice, oc) => {
						if (oc !== c) {
							return choice;
						}
						return {
							operation: Number(e.target.value),
							letter1: Letter.None,
							letter2: Letter.None,
						};
					});
					return {
						...question,
						choices: newChoices,
					};
				}),
			},
			() => this.solve(q),
		);
	}

	selectLetter = (
		q: number,
		c: number,
		letterNum: number,
		e: ChangeEvent<HTMLSelectElement>,
	) => {
		this.setState(
			{
				questions: this.state.questions.map((question, oq) => {
					if (oq !== q) {
						return question;
					}
					const newChoices = question.choices.map((choice, oc) => {
						if (oc !== c) {
							return choice;
						}
						return {
							operation: choice.operation,
							letter1: letterNum === 1 ? Number(e.target.value) : choice.letter1,
							letter2: letterNum === 2 ? Number(e.target.value) : choice.letter2,
						};
					});
					return {
						...question,
						choices: newChoices,
					};
				}),
			},
			() => this.solve(q),
		);
	}

	renderChoice = (choice: Choice, q: number, c: number) => {
		const {
			operation,
			letter1,
			letter2,
		} = choice;
		return (
			<div className="choice" key={c}>
				<select
					id="operation"
					value={operation}
					onChange={(e) => this.selectOperation(q, c, e)}
				>
					{getOperationOptions()}
				</select>
				<select
					id="letter1"
					value={letter1}
					onChange={(e) => this.selectLetter(q, c, 1, e)}
					disabled={operation < 2}
				>
					{getLetterOptions(operation, 1)}
				</select>
				<select
					id="letter2"
					value={letter2}
					onChange={(e) => this.selectLetter(q, c, 2, e)}
					disabled={operation < 4}
				>
					{getLetterOptions(operation, 2)}
				</select>
			</div>
		);
	}

	renderQuestion = (question: Question, q: number) => {
		const { choices, solutions } = question;
		return (
			<div key={q} className="question">
				<div className="choices">
					<div className="questionNumber">Question #{q + 1}</div>
					{choices.map((choice, c) => this.renderChoice(choice, q, c))}
				</div>
				<div className="solutions">
					<div className="solutionsTitle">Solutions</div>
					{solutions.length < 5 && solutions.map((solution) => {
						const binary = solution.map((b) => b ? '1' : '0').join('');
						const index = parseInt(binary, 2);
						const letter = String.fromCharCode(index + 64);
						return (
							<div className="solution" key={binary}>{binary} {letter}</div>
						);
					})}
				</div>
			</div>
		);
	}

	render() {
		const {
			questions,
		} = this.state;
		return (
			<div className="layout">
				{questions.map(this.renderQuestion)}
			</div>
		);
	}
}

export default App;
