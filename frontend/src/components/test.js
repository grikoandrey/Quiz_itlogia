import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Test {
    constructor() {
        this.quiz = null;
        this.currentQuestionIndex = 1;
        this.questionTitleElement = null;
        this.optionsElement = null;
        this.nextButtonElement = null;
        this.prevButtonElement = null;
        this.passButtonElement = null;
        this.userResult = [];
        this.exit = [];

        this.barOptionsElement = null;

        this.init();
    }

    async init() {
        let testId = Number(sessionStorage.getItem("id"));

        try {
            const result = await CustomHttp.request(`${config.host}/tests/${testId}`);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.quiz = result;
                this.startQuiz();
            }
        } catch (error) {
            console.log("Ошибка:", error);
        }
    }

    startQuiz() {
        this.barOptionsElement = document.getElementById('progress-bar');
        this.questionTitleElement = document.getElementById('title');
        this.optionsElement = document.getElementById('options');
        this.nextButtonElement = document.getElementById('next');
        this.nextButtonElement.onclick = this.move.bind(this, 'next');
        this.passButtonElement = document.getElementById('pass');
        this.passButtonElement.onclick = this.move.bind(this, 'pass');

        document.getElementById('pre-title').innerText = this.quiz.name;

        this.prevButtonElement = document.getElementById('prev');
        this.prevButtonElement.onclick = this.move.bind(this, 'prev');

        this.prepareProgressBar();
        this.showQuestion();

        const timerElement = document.getElementById('timer');
        let seconds = 59;
        this.interval = setInterval(function () {
            seconds--;
            timerElement.innerText = seconds;
            if (seconds === 0) {
                clearInterval(this.interval);
                this.complete();
            }
        }.bind(this), 1000);
    }

    prepareProgressBar() {
        for (let i = 0; i < this.quiz.questions.length; i++) {
            const barItemElement = document.createElement('div');
            barItemElement.className = 'test__progress-bar-item ' + (i === 0 ? 'active' : '');

            const barItemCircleElement = document.createElement('div');
            barItemCircleElement.className = 'test__progress-bar-item-circle';

            const barItemTextElement = document.createElement('div');
            barItemTextElement.className = 'test__progress-bar-item-text';
            barItemTextElement.innerText = 'Вопрос ' + (i + 1);

            barItemElement.appendChild(barItemCircleElement);
            barItemElement.appendChild(barItemTextElement);

            this.barOptionsElement.appendChild(barItemElement);
        }
    }

    showQuestion() {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
        this.questionTitleElement.innerHTML = `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;

        this.optionsElement.innerHTML = '';
        const that = this;
        const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
        activeQuestion.answers.forEach(answer => {
            const answerOptionElement = document.createElement('div');
            answerOptionElement.className = 'test__question-option';

            const inputId = 'answer-' + answer.id
            const answerInputElement = document.createElement('input');
            answerInputElement.className = 'option-answer';
            answerInputElement.setAttribute('id', inputId);
            answerInputElement.setAttribute('type', 'radio');
            answerInputElement.setAttribute('name', 'answer');
            answerInputElement.setAttribute('value', answer.id);
            if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                answerInputElement.setAttribute('checked', 'checked');
            }

            answerInputElement.onchange = function () {
                that.chooseAnswer();
            }

            const answerLabelElement = document.createElement('label');
            answerLabelElement.setAttribute('for', inputId);
            answerLabelElement.innerText = answer.answer;

            answerOptionElement.appendChild(answerInputElement);
            answerOptionElement.appendChild(answerLabelElement);

            this.optionsElement.appendChild(answerOptionElement);
        });
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

    chooseAnswer() {
        this.nextButtonElement.removeAttribute('disabled');
        this.passButtonElement.classList.add('disabled')
    }

    move(action) {
        const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

        const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find((element) => {
            return element.checked;
        });

        let chosenAnswerId = null;
        if (chosenAnswer && chosenAnswer.value) {
            chosenAnswerId = Number(chosenAnswer.value);
        }

        const existingResult = this.userResult.find(item => {
            return item.questionId === activeQuestion.id
        });
        if (existingResult) {
            existingResult.chosenAnswerId = chosenAnswerId;
        } else {
            this.userResult.push({
                questionId: activeQuestion.id,
                chosenAnswerId: chosenAnswerId,
            });
        }

        if (action === 'next' || action === 'pass') {
            this.currentQuestionIndex++;
        } else {
            this.currentQuestionIndex--;
        }

        if (this.currentQuestionIndex > this.quiz.questions.length) {
            clearInterval(this.interval);
            this.complete();
            return;
        }

        Array.from(this.barOptionsElement.children).forEach((item, index) => {
            const currenItemIndex = index + 1;
            item.classList.remove('active');
            item.classList.remove('complete');

            if (currenItemIndex === this.currentQuestionIndex) {
                item.classList.add('active');
            } else if (currenItemIndex < this.currentQuestionIndex) {
                item.classList.add('complete');
            }
        })
        this.showQuestion();
    }

    async complete() {
        let testId = Number(sessionStorage.getItem("id"));

        const userInfo = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(`${config.host}/tests/${testId}/pass`, 'POST',
                {
                    userId: userInfo.userId,
                    results: this.userResult,
                });

            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                location.href = `#/result`;
            }
        } catch (error) {
            console.log(error);
        }
    }
}
