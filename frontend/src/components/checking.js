import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth.js";

export class Check {
    constructor() {

        this.userInfo = Auth.getUserInfo();
        this.quiz = null;

        this.questionsContainer = document.getElementById('list-questions');
        this.id = Number(sessionStorage.getItem("id"));

        this.init();
    }

    async init() {

        try {
            const result = await CustomHttp.request(`${config.host}/tests/${this.id}/result/details?userId=${this.userInfo.userId}`);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                this.quiz = result;
            }
            this.listAnswers(this.quiz);
        } catch (error) {
            return console.log("Ошибка:", error);
        }
    };

    listAnswers() {
        if (!this.quiz) {
            return;
        }
        document.getElementById('test').innerText = this.quiz.test.name;
        document.getElementById('data').innerText = `${this.userInfo.fullName}, ${this.userInfo.email}`;

        this.questionsContainer.innerHTML = '';

        // Перебираем вопросы
        this.quiz.test.questions.forEach((questionData, questionIndex) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'answer__question';

            // Заголовок вопроса
            const questionTitleElement = document.createElement('div');
            questionTitleElement.className = 'answers__question-title';
            questionTitleElement.innerHTML = `<span>Вопрос ${questionIndex + 1}:</span> ${questionData.question}`;
            questionElement.appendChild(questionTitleElement);

            // Контейнер для ответов
            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'answers__question-options';

            // Перебираем ответы
            questionData.answers.forEach((answerData) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'answers__question-option';

                // Уникальный ID для input и label
                const answerId = `answer-${questionIndex + 1}-${answerData.id}`;

                // Создаем радио-кнопку (disabled, так как это результат)
                const inputElement = document.createElement('input');
                inputElement.type = 'radio';
                inputElement.id = answerId;
                inputElement.name = `answer-${questionIndex + 1}`;
                inputElement.disabled = true;

                if (answerData.selected) {
                    inputElement.checked = true; // Отмечаем правильный ответ
                }
                optionElement.appendChild(inputElement);

                // Label для радио-кнопки
                const labelElement = document.createElement('label');
                labelElement.htmlFor = answerId;
                labelElement.innerText = answerData.answer;
                optionElement.appendChild(labelElement);

                // Устанавливаем классы для правильного/неправильного ответа
                if (answerData.correct === true) {
                    optionElement.classList.add('right'); // Класс для правильного ответа
                } else if (answerData.correct === false) {
                    optionElement.classList.add('wrong'); // Класс для выбранного, но неверного ответа
                }
                optionsContainer.appendChild(optionElement);
            });
            questionElement.appendChild(optionsContainer);
            this.questionsContainer.appendChild(questionElement);
        });
    }
}
