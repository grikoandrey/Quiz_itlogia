import {CustomHttp} from "../services/custom-http";
import config from "../../config/config.js";
import {Auth} from "../services/auth.js";

export class Result {
    constructor() {

        this.init();
    }

    async init() {
        const id = Number(sessionStorage.getItem("id"));
        const userInfo = Auth.getUserInfo();
        // console.log(userInfo);
        if (!userInfo) {
            location.href = '#/';
        }

        try {
            const result = await CustomHttp.request(`${config.host}/tests/${id}/result?userId=${userInfo.userId}`);
            // console.log(result);
            if (result) {
                if (result.error) {
                    throw new Error(result.error);
                }
                document.getElementById('result__score').innerText = `${result.score}/${result.total}`;
                this.checkAnswers();
            }
        } catch (error) {
            console.log(error);
        }
    };

    checkAnswers() {
        document.getElementById('get-answers').onclick = () => {
            location.href = `#/checking`;
        }
    };
}
