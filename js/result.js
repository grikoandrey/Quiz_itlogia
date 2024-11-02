(function () {
    const Result = {
        // getAnswers: null,

        init() {
            const url = new URL(location.href);
            let score = url.searchParams.get('score') || 0;
            let total = url.searchParams.get('total') || 0;
            document.getElementById('result__score').innerText = `${score}/${total}`;

            const that = this;

            this.getAnswers = document.getElementById('get-answers');
            this.getAnswers.onclick = function () {
                that.checkAnswers();
            }
        },

        checkAnswers: function () {
            location.href = `answers.html${location.search}`;
        }
    }
    Result.init();
})();