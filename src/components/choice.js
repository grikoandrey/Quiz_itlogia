import {UrlManager} from "../utils/url-manager.js";

export class Choice {

    constructor() {
        this.quizzes = [];
        UrlManager.checkUserData();

        const xhr = new XMLHttpRequest();
        xhr.open("GET", 'https://testologia.ru/get-quizzes', false);
        xhr.send();

        if (xhr.status === 200 && xhr.responseText) {
            try {
                this.quizzes = JSON.parse(xhr.responseText);
            } catch (e) {
                location.href = '#/';
            }
            this.processQuizzes();
        } else {
            location.href = '#/';
        }
        // console.log(this.quizzes);
    }

    processQuizzes() {
        // console.log(this.quizzes);
        const choiceOptionsElement = document.getElementById('choice__details');
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
            // передача через адресную строку заменена на session Storage
            // location.href = `test.html${location.search}&id=${dataId}`;
            location.href = `#/test`;
        }
    }
}