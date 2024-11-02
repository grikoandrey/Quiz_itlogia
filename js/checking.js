(function () {
    const Check = {
        // quiz: null,
        // name: '',
        // lastName: '',
        // email: '',
        // questionsContainer: null,

        init() {
            const url = new URL(location.href);

            this.name = url.searchParams.get("name");
            this.lastName = url.searchParams.get("lastName");
            this.email = url.searchParams.get("email");
            this.questionsContainer = document.getElementById('list-questions');
            const id = url.searchParams.get("id");
            this.userAnswers = url.searchParams.get("exit").split(',').map(Number);

            const xhr = new XMLHttpRequest();
            xhr.open("GET", `https://testologia.ru/get-quiz?id=${id}`, false);
            xhr.send();

            if (xhr.status === 200 && xhr.responseText) {
                try {
                    this.quiz = JSON.parse(xhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }

            const zhr = new XMLHttpRequest();
            zhr.open("GET", `https://testologia.ru/get-quiz-right?id=${id}`, false);
            zhr.send();

            if (zhr.status === 200 && zhr.responseText) {
                try {
                    this.rightAnswers = JSON.parse(zhr.responseText);
                } catch (e) {
                    location.href = 'index.html';
                }
            } else {
                location.href = 'index.html';
            }
            // console.log(this.quiz);
            // console.log(this.rightAnswers);
            // console.log(this.userAnswers);
            this.listAnswers();
            // this.showAnswers();
        },
        listAnswers() {
            document.getElementById('test').innerText = this.quiz.name;
            document.getElementById('data').innerText = `${this.name} ${this.lastName}, ${this.email}`;

            this.questionsContainer.innerHTML = '';

            // Перебираем каждый вопрос в массиве вопросов
            this.quiz.questions.forEach((data, questionIndex) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'answer__question';

                // Заголовок вопроса
                const questionTitleElement = document.createElement('div');
                questionTitleElement.className = 'answers__question-title';
                questionTitleElement.innerHTML = `<span>Вопрос ${questionIndex + 1}:</span> ${data.question}`;
                questionElement.appendChild(questionTitleElement);

                // Контейнер для ответов
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'answers__question-options';

                // Перебираем каждый ответ для текущего вопроса
                data.answers.forEach((answer, answerIndex) => {
                    const optionElement = document.createElement('div');
                    optionElement.className = 'answers__question-option';

                    // Уникальный ID для input и label
                    const answerId = `answer-${questionIndex + 1}-${answerIndex + 1}`;

                    // Создаем радио-кнопку
                    const inputElement = document.createElement('input');
                    inputElement.type = 'radio';
                    inputElement.id = answerId;
                    inputElement.name = `answer-${questionIndex + 1}`;
                    optionElement.appendChild(inputElement);

                    // Label для радио-кнопки
                    const labelElement = document.createElement('label');
                    labelElement.htmlFor = answerId;
                    labelElement.innerText = answer.answer;
                    optionElement.appendChild(labelElement);

                    // Проверка правильности ответа
                    const userAnswerId = this.userAnswers[questionIndex];
                    const correctAnswerId = this.rightAnswers[questionIndex];
                    // console.log(answerIndex);
                    // console.log(this.userAnswers);
                    if (answer.id === userAnswerId) { // проверяем, совпадает ли ID текущего ответа с выбранным пользователем
                        if (userAnswerId === correctAnswerId) {
                            optionElement.classList.add('right'); // Верный ответ
                        } else {
                            optionElement.classList.add('wrong'); // Неверный ответ
                        }
                    }

                    optionsContainer.appendChild(optionElement);
                });
                questionElement.appendChild(optionsContainer);
                this.questionsContainer.appendChild(questionElement);
            })
        },
    }
    Check.init();
})();