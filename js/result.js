(function () {
    const Result = {

        init() {
            const url = new URL(location.href);
            let score = url.searchParams.get('score') || 0;
            let total = url.searchParams.get('total') || 0;
            document.getElementById('result__score').innerText = `${score}/${total}`;
        },
    }
    Result.init();
})();