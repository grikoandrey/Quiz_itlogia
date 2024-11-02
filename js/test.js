(function () {
    const Test = {
        quiz: null,
        currentQuestionIndex: 1,
        questionTitleElement: null,
        optionsElement: null,
        nextButtonElement: null,
        prevButtonElement: null,
        passButtonElement: null,
        userResult: [],

        barOptionsElement: null,

        init() {
            checkUserData();
            checkUserId();

            const url = new URL(location.href);
            const testId = url.searchParams.get("id");
            const xhr = new XMLHttpRequest();
            xhr.open("GET", 'https://testologia.ru/get-quiz?id=' + testId, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
                this.startQuiz();
            } else {
                location.href = 'index.html';
            }
        },
        startQuiz() {
            // console.log(this.quiz);
            this.barOptionsElement = document.getElementById('progress-bar');

            this.questionTitleElement = document.getElementById('title');
            this.optionsElement = document.getElementById('options');
            this.nextButtonElement = document.getElementById('next');
            this.nextButtonElement.onclick = this.move.bind(this, 'next');
            this.passButtonElement = document.getElementById('pass');
            this.passButtonElement.onclick = this.move.bind(this, 'pass');

            document.getElementById('pre-title').innerText = this.quiz.name;

            this.prevButtonElement = document.getElementById('prev');
            this.prevButtonElement.onclick = this.move.bind(this, 'prev');

            this.prepareProgressBar();
            this.showQuestion();

            const timerElement = document.getElementById('timer');
            let seconds = 59;
            const interval = setInterval(function () {
                seconds--;
                timerElement.innerText = seconds;
                if (seconds === 0) {
                    clearInterval(interval);
                    this.complete();
                }
            }.bind(this), 1000);
        },

        prepareProgressBar() {
            // this.barOptionsElement.innerHTML = '';

            for (let i=0; i < this.quiz.questions.length; i++) {
                const barItemElement = document.createElement('div');
                barItemElement.className = 'test__progress-bar-item ' + (i === 0 ? 'active' : '');

                const barItemCircleElement = document.createElement('div');
                barItemCircleElement.className = 'test__progress-bar-item-circle';

                const barItemTextElement = document.createElement('div');
                barItemTextElement.className = 'test__progress-bar-item-text';
                barItemTextElement.innerText = 'Вопрос ' + (i + 1);
                // barItemTextElement.innerText = `Вопрос ${this.currentQuestionIndex + 1}`;

                barItemElement.appendChild(barItemCircleElement);
                barItemElement.appendChild(barItemTextElement);

                this.barOptionsElement.appendChild(barItemElement);
                // console.log(barItemTextElement.innerText);
            }
        },

        showQuestion() {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];
            this.questionTitleElement.innerHTML = `<span>Вопрос ${this.currentQuestionIndex}:</span> ${activeQuestion.question}`;

            this.optionsElement.innerHTML = '';
            const that = this;
            const chosenOption = this.userResult.find(item => item.questionId === activeQuestion.id);
            activeQuestion.answers.forEach(answer => {
                const answerOptionElement = document.createElement('div');
                answerOptionElement.className = 'test__question-option';

                const inputId = 'answer-' + answer.id
                const answerInputElement = document.createElement('input');
                answerInputElement.className = 'option-answer';
                answerInputElement.setAttribute('id', inputId);
                answerInputElement.setAttribute('type', 'radio');
                answerInputElement.setAttribute('name', 'answer');
                answerInputElement.setAttribute('value', answer.id);
                if (chosenOption && chosenOption.chosenAnswerId === answer.id) {
                    answerInputElement.setAttribute( 'checked', 'checked');
                }

                answerInputElement.onchange = function () {
                    that.chooseAnswer();
                }

                const answerLabelElement = document.createElement('label');
                answerLabelElement.setAttribute('for', inputId);
                answerLabelElement.innerText = answer.answer;

                answerOptionElement.appendChild(answerInputElement);
                answerOptionElement.appendChild(answerLabelElement);

                this.optionsElement.appendChild(answerOptionElement);
            });
            if (chosenOption && chosenOption.chosenAnswerId) {
                this.nextButtonElement.removeAttribute('disabled');
            } else {
                this.nextButtonElement.setAttribute('disabled', 'disabled');
            }

            if (this.currentQuestionIndex === this.quiz.questions.length) {
                this.nextButtonElement.innerText = 'Завершить';
            } else {
                this.nextButtonElement.innerText = 'Далее';
            }
            if (this.currentQuestionIndex > 1) {
                this.prevButtonElement.removeAttribute('disabled');
            } else {
                this.prevButtonElement.setAttribute('disabled', 'disabled');
            }
        },
        chooseAnswer() {
            this.nextButtonElement.removeAttribute('disabled');
        },
        move(action) {
            const activeQuestion = this.quiz.questions[this.currentQuestionIndex - 1];

            const chosenAnswer = Array.from(document.getElementsByClassName('option-answer')).find((element) => {
                return element.checked;
            });

            let chosenAnswerId = null;
            if (chosenAnswer && chosenAnswer.value) {
                chosenAnswerId = Number(chosenAnswer.value);
            }

            const existingResult = this.userResult.find(item => {
                return item.questionId === activeQuestion.id
            });
            if (existingResult) {
                existingResult.chosenAnswerId = chosenAnswerId;
            } else {
                this.userResult.push({
                    questionId: activeQuestion.id,
                    chosenAnswerId: chosenAnswerId,
                });
            }
            // console.log(this.userResult);

            if (action === 'next' || action === 'pass') {
                this.currentQuestionIndex++;
            } else {
                this.currentQuestionIndex--;
            }

            if (this.currentQuestionIndex > this.quiz.questions.length) {
                this.complete();
                return;
            }

            Array.from(this.barOptionsElement.children).forEach((item, index) => {
                const currenItemIndex = index +1;
                item.classList.remove('active');
                item.classList.remove('complete');

                if (currenItemIndex === this.currentQuestionIndex) {
                    item.classList.add('active');
                } else if (currenItemIndex < this.currentQuestionIndex) {
                    item.classList.add('complete');
                }
            })

            this.showQuestion();
        },
        complete() {
            const url = new URL(location.href);
            const id = url.searchParams.get("id");
            const name = url.searchParams.get("name");
            const lastName = url.searchParams.get("lastName");
            const email = url.searchParams.get("email");

            const xhr = new XMLHttpRequest();
            xhr.open("POST", `https://testologia.ru/pass-quiz?id=${id}`, false);
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            xhr.send(JSON.stringify({
                name: name,
                lastName: lastName,
                email: email,
                results: this.userResult
            }));

            if (xhr.status === 200 && xhr.responseText) {
                let result = null;
                try {
                    result = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
                if (result) {
                    // console.log(result);
                    location.href = `result.html?score=${result.score}&total=${result.total}`;
                }
            } else {
                location.href = 'index.html';
            }
        },
    }
    Test.init();
})();