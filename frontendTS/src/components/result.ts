import {CustomHttp} from "../services/custom-http";
import config from "../../config/config";
import {Auth} from "../services/auth";
import {UserInfoType} from "../types/user-info.type";
import {DefaultResponseType} from "../types/default-response.type";
import {PassTestResponseType} from "../types/pass-test-response.type";

export class Result {
    constructor() {

        this.init();
    }

    private async init(): Promise<void> {
        const id: number = Number(sessionStorage.getItem("id"));
        const userInfo: UserInfoType | null = Auth.getUserInfo();
        if (!userInfo) {
            location.href = '#/';
            return;
        }
        try {
            const result: DefaultResponseType | PassTestResponseType = await CustomHttp
                .request(`${config.host}/tests/${id}/result?userId=${userInfo.userId}`);
            if (result) {
                if ((result as DefaultResponseType).error !== undefined) {
                    throw new Error((result as DefaultResponseType).message);
                }
                const resultScoreElement: HTMLElement | null = document.getElementById('result__score');
                if (resultScoreElement) {
                    resultScoreElement.innerText = `${(result as PassTestResponseType).score}/${(result as PassTestResponseType).total}`;
                }
                this.checkAnswers();
            }
        } catch (error) {
            console.log(error);
        }
    };

    private checkAnswers(): void {
        const getAnswerElement: HTMLElement | null = document.getElementById('get-answers');
        if (getAnswerElement) {
            getAnswerElement.onclick = (): void => {
                location.href = `#/checking`;
            };
        }
    };
}
