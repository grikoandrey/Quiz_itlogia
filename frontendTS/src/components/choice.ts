import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {QuizListType} from "../types/quiz-list.type";
import {TestResultType} from "../types/test-result.type";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";

export class Choice {
    private quizzes: QuizListType[] = [];
    private testResult: TestResultType[] | null = null;

    constructor() {
        this.init();
    }

    private async init(): Promise<void> {
        try {
            this.quizzes = await CustomHttp.request(`${config.host}/tests`);
        } catch (error) {
            console.log("Ошибка:", error);
            return;
        }

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (userInfo) {
            try {
                const result: DefaultResponseType | TestResultType[] = await CustomHttp.request(`${config.host}/tests/results?userId=${userInfo.userId}`);
                if (result) {
                    if ((result as DefaultResponseType).error !== undefined) {
                        throw new Error((result as DefaultResponseType).message);
                    }
                    this.testResult = result as TestResultType[];
                }
            } catch (error) {
                console.log("Ошибка:", error);
                return;
            }
        }
        this.processQuizzes();
    }

    private processQuizzes(): void {
        const choiceOptionsElement: HTMLElement | null = document.getElementById('choice__details');

        if (this.quizzes && this.quizzes.length > 0 && choiceOptionsElement) {
            choiceOptionsElement.innerHTML = "";

            this.quizzes.forEach((quiz: QuizListType): void => {
                const that: Choice = this;
                const choiceOptionElement: HTMLElement | null = document.createElement('div');
                choiceOptionElement.className = 'choice__group';
                choiceOptionElement.setAttribute('data-id', quiz.id.toString());
                choiceOptionElement.onclick = function (e) {
                    e.preventDefault();
                    that.chooseQuiz(this as HTMLElement);
                }

                const choiceOptionTextElement: HTMLElement | null = document.createElement('div');
                choiceOptionTextElement.className = 'choice__group-text';
                choiceOptionTextElement.innerText = quiz.name;

                const choiceOptionArrowElement: HTMLElement | null = document.createElement('div');
                choiceOptionArrowElement.className = 'choice__group-arrow';

                if (this.testResult) {
                    const result: TestResultType | undefined = this.testResult.find(item => item.testId === quiz.id);
                    if(result) {
                        const choiceOptionResultElement: HTMLElement | null = document.createElement('div');
                        choiceOptionResultElement.className = 'choice__group-result';
                        choiceOptionResultElement.innerHTML = `<div>Результат</div><div>${result.score}/${result.total}</div>`;
                        choiceOptionElement.appendChild(choiceOptionResultElement);
                    }
                }

                const choiceOptionImageElement: HTMLElement | null = document.createElement('img');
                choiceOptionImageElement.setAttribute('src', 'images/arrow.png');
                choiceOptionImageElement.setAttribute('alt', 'arrow');

                choiceOptionArrowElement.appendChild(choiceOptionImageElement);
                choiceOptionElement.appendChild(choiceOptionTextElement);
                choiceOptionElement.appendChild(choiceOptionArrowElement);

                choiceOptionsElement.appendChild(choiceOptionElement);
            })
        }
    }

    private chooseQuiz(element: HTMLElement): void {
        const dataId: string | null = element.getAttribute('data-id');
        if (dataId) {
            sessionStorage.setItem('id', dataId);
            location.href = `#/test`;
        }
    }
}