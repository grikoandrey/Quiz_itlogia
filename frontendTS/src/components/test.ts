import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizAnswerType, QuizQuestionType, QuizType} from "../types/quize.type";
import {UserResultType} from "../types/user-result.type";
import {DefaultResponseType} from "../types/default-response.type";
import {ActionTestType} from "../types/action-test.type";
import {UserInfoType} from "../types/user-info.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Test {
    private optionsElement: HTMLElement | null
    private nextButtonElement: HTMLElement | null
    private questionTitleElement: HTMLElement | null
    private prevButtonElement: HTMLElement | null
    private passButtonElement: HTMLElement | null
    private barOptionsElement: HTMLElement | null
    private quiz: QuizType | null;
    private currentQuestionIndex: number
    readonly userResult: UserResultType[];
    // private exit;
    private interval: number = 0;



    constructor() {
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passButtonElement = null;
        this.userResult = [];
        // this.exit = [];
        this.barOptionsElement = null;

        this.init();
    }

    private async init(): Promise<void> {
        let testId: number = Number(sessionStorage.getItem("id"));

        try {
            const result: DefaultResponseType | QuizType = await CustomHttp.request(`${config.host}/tests/${testId}`);
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.quiz = result as QuizType;
                this.startQuiz();
            }
        } catch (error) {
            console.log("Ошибка:", error);
        }
    }

    private startQuiz(): void {
        if (!this.quiz) return;
        this.barOptionsElement = document.getElementById('progress-bar');
        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        if (this.nextButtonElement) {
            this.nextButtonElement.onclick = this.move.bind(this, ActionTestType.next);
        }
        this.passButtonElement = document.getElementById('pass');
        if (this.passButtonElement) {
            this.passButtonElement.onclick = this.move.bind(this, ActionTestType.pass);
        }
        const preTitleElement: HTMLElement | null = document.getElementById('pre-title');
        if (preTitleElement) {
            preTitleElement.innerText = this.quiz.name;
        }


        this.prevButtonElement = document.getElementById('prev');
        if (this.prevButtonElement) {
            this.prevButtonElement.onclick = this.move.bind(this, ActionTestType.prev);
        }

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement: HTMLElement | null = document.getElementById('timer');
        let seconds: number = 59;
        const that: Test = this;
        this.interval = window.setInterval(function () {
            seconds--;
            if (timerElement) {
                timerElement.innerText = seconds.toString();
            }
            if (seconds === 0) {
                clearInterval(that.interval);
                that.complete();
            }
        }.bind(this), 1000);
    }

    private prepareProgressBar(): void {
        if (!this.quiz) return;
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const barItemElement: HTMLElement | null = document.createElement('div');
            barItemElement.className = 'test__progress-bar-item ' + (i === 0 ? 'active' : '');

            const barItemCircleElement: HTMLElement | null = document.createElement('div');
            barItemCircleElement.className = 'test__progress-bar-item-circle';

            const barItemTextElement: HTMLElement | null = document.createElement('div');
            barItemTextElement.className = 'test__progress-bar-item-text';
            barItemTextElement.innerText = 'Вопрос ' + (i + 1);

            barItemElement.appendChild(barItemCircleElement);
            barItemElement.appendChild(barItemTextElement);

            if (this.barOptionsElement) {
                this.barOptionsElement.appendChild(barItemElement);
            }
        }
    }

    private showQuestion(): void {
        if (!this.quiz) return;
        const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];
        if (this.questionTitleElement) {
            this.questionTitleElement.innerHTML = `<span>Вопрос ${this.currentQuestionIndex}:
                                                    </span> ${activeQuestion.question}`;
        }
        if (this.optionsElement) {
            this.optionsElement.innerHTML = '';
        }
        const that: Test = this;
        const chosenOption: UserResultType | undefined = this.userResult.find(item => item.questionId === activeQuestion.id);
        activeQuestion.answers.forEach((answer: QuizAnswerType) => {
            const answerOptionElement: HTMLElement | null = document.createElement('div');
            answerOptionElement.className = 'test__question-option';

            const inputId: string = 'answer-' + answer.id
            const answerInputElement: HTMLElement | null = document.createElement('input');
            answerInputElement.className = 'option-answer';
            answerInputElement.setAttribute('id', inputId);
            answerInputElement.setAttribute('type', 'radio');
            answerInputElement.setAttribute('name', 'answer');
            answerInputElement.setAttribute('value', answer.id.toString());
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                answerInputElement.setAttribute('checked', 'checked');
            }

            answerInputElement.onchange = function () {
                that.chooseAnswer();
            }

            const answerLabelElement: HTMLElement | null = document.createElement('label');
            answerLabelElement.setAttribute('for', inputId);
            answerLabelElement.innerText = answer.answer;

            answerOptionElement.appendChild(answerInputElement);
            answerOptionElement.appendChild(answerLabelElement);

            if (this.optionsElement) {
                this.optionsElement.appendChild(answerOptionElement);
            }
        });
        if (this.nextButtonElement && this.passButtonElement && this.prevButtonElement) {
            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
                this.passButtonElement.classList.add('disabled')
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
                this.passButtonElement.classList.remove('disabled');
            }

            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Далее';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        }
    }

    private chooseAnswer(): void {
        if (this.nextButtonElement && this.passButtonElement) {
            this.nextButtonElement.removeAttribute('disabled');
            this.passButtonElement.classList.add('disabled');
        }
    }

    private move(action: ActionTestType): void {
        if (!this.quiz) return;
        const activeQuestion: QuizQuestionType = this.quiz.questions[this.currentQuestionIndex - 1];

        const chosenAnswer: HTMLInputElement | undefined = Array.from(document.getElementsByClassName('option-answer'))
            .find((element) => {
            return (element as HTMLInputElement).checked;
        }) as HTMLInputElement;

        let chosenAnswerId: number | null= null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult: UserResultType | undefined = this.userResult.find(item => {
            return item.questionId === activeQuestion.id
        });
        if (chosenAnswerId) {
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                });
            }
        }

        if (action === ActionTestType.next || action === ActionTestType.pass) {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return;
        }

        if (this.barOptionsElement) {
            Array.from(this.barOptionsElement.children).forEach((item: Element, index: number): void => {
                const currenItemIndex: number = index + 1;
                item.classList.remove('active');
                item.classList.remove('complete');

                if (currenItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currenItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            })
        }
        this.showQuestion();
    }

    private async complete(): Promise<void> {
        let testId: number = Number(sessionStorage.getItem("id"));

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }

        try {
            const result: DefaultResponseType | PassTestResponseType = await CustomHttp.request(`${config.host}/tests/${testId}/pass`, 'POST',
                {
                    userId: userInfo.userId,
                    results: this.userResult,
                });

            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                location.href = `#/result`;
            }
        } catch (error) {
            console.log(error);
        }
    }
}
