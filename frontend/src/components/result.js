export class Result {
    // getAnswers: null,

    constructor() {
        // const url = new URL(location.href);
        let score = sessionStorage.getItem('score') || 0;
        let total = sessionStorage.getItem('total') || 0;
        document.getElementById('result__score').innerText = `${score}/${total}`;

        const that = this;

        this.getAnswers = document.getElementById('get-answers');
        this.getAnswers.onclick = function () {
            that.checkAnswers();
        }
    }

    checkAnswers() {
        // передача через адресную строку заменена на session Storage
        // location.href = `answers.html${location.search}`;
        location.href = `#/checking`;
    }
}
