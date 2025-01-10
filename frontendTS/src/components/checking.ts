import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizAnswerType, QuizQuestionType, QuizType} from "../types/quize.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Check {
    private quiz: QuizType | null;
    readonly questionsContainer: HTMLElement | null
    readonly id: number;
    readonly userInfo: UserInfoType | null

    constructor() {
        this.userInfo = Auth.getUserInfo();
        this.quiz = null;

        this.questionsContainer = document.getElementById('list-questions');
        this.id = Number(sessionStorage.getItem("id"));

        this.init();
    }

    private async init(): Promise<void> {
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }
        try {
            const result: DefaultResponseType | QuizType = await CustomHttp
                .request(`${config.host}/tests/${this.id}/result/details?userId=${userInfo.userId}`);
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                this.quiz = result as QuizType;
            }
            this.listAnswers();
        } catch (error) {
            return console.log("Ошибка:", error);
        }
    };

    private listAnswers(): void {
        if (!this.quiz) {
            return;
        }
        const getTestElement: HTMLElement | null = document.getElementById('test')
        if (getTestElement) {
            getTestElement.innerText = this.quiz.test.name;
        }

        const getDataElement: HTMLElement | null = document.getElementById('data')
        if (getDataElement && this.userInfo) {
            getDataElement.innerText = `${this.userInfo.fullName}, ${this.userInfo.email}`;
        }

        if (this.questionsContainer) {
            this.questionsContainer.innerHTML = '';
        }

        // Перебираем вопросы
        this.quiz.test.questions.forEach((questionData: QuizQuestionType, questionIndex: number) => {
            const questionElement: HTMLElement | null = document.createElement('div');
            questionElement.className = 'answer__question';

            // Заголовок вопроса
            const questionTitleElement: HTMLElement | null = document.createElement('div');
            questionTitleElement.className = 'answers__question-title';
            questionTitleElement.innerHTML = `<span>Вопрос ${questionIndex + 1}:</span> ${questionData.question}`;
            questionElement.appendChild(questionTitleElement);

            // Контейнер для ответов
            const optionsContainer: HTMLElement | null = document.createElement('div');
            optionsContainer.className = 'answers__question-options';

            // Перебираем ответы
            questionData.answers.forEach((answerData: QuizAnswerType) => {
                const optionElement: HTMLElement | null = document.createElement('div');
                optionElement.className = 'answers__question-option';

                // Уникальный ID для input и label
                const answerId: string = `answer-${questionIndex + 1}-${answerData.id}`;

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
            this.questionsContainer?.appendChild(questionElement);
        });
    }
}
