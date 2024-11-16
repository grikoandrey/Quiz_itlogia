import {CustomHttp} from "../services/custom-http.js";
import config from "../../config/config.js";
import {Auth} from "../services/auth";

export class Choice {
    constructor() {
        this.quizzes = [];
        this.testResult = null;

        this.init();
    }

    async init() {
        try {
            const result = await CustomHttp.request(`${config.host}/tests`);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.quizzes = result;
            }
        } catch (error) {
            return console.log("Ошибка:", error);
        }

        const userInfo = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result = await CustomHttp.request(`${config.host}/tests/results?userId=${userInfo.userId}`);
                if (result) {
                    if (result.error) {
                        throw new Error(result.error);
                    }
                    this.testResult = result;
                }
            } catch (error) {
                return console.log("Ошибка:", error);
            }
        }
        this.processQuizzes();
    }

    processQuizzes() {
        const choiceOptionsElement = document.getElementById('choice__details');

        choiceOptionsElement.innerHTML = "";

        if (this.quizzes && this.quizzes.length > 0) {
            this.quizzes.forEach((quiz) => {
                const that = this;
                const choiceOptionElement = document.createElement('div');
                choiceOptionElement.className = 'choice__group';
                choiceOptionElement.setAttribute('data-id', quiz.id);
                choiceOptionElement.onclick = function (e) {
                    e.preventDefault();
                    that.chooseQuiz(this);
                }

                const choiceOptionTextElement = document.createElement('div');
                choiceOptionTextElement.className = 'choice__group-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement = document.createElement('div');
                choiceOptionArrowElement.className = 'choice__group-arrow';

                const result = this.testResult.find(item => item.testId === quiz.id);
                if(result) {
                    const choiceOptionResultElement = document.createElement('div');
                    choiceOptionResultElement.className = 'choice__group-result';
                    choiceOptionResultElement.innerHTML = `<div>Результат</div><div>${result.score}/${result.total}</div>`;
                    choiceOptionElement.appendChild(choiceOptionResultElement);
                }

                const choiceOptionImageElement = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'arrow');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            })
        }
    }

    chooseQuiz(element) {
        const dataId = element.getAttribute('data-id');
        if (dataId) {
            sessionStorage.setItem('id', dataId);
            location.href = `#/test`;
        }
    }
}