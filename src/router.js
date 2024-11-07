import {Form} from "./components/registration.js";
import {Choice} from "./components/choice.js";
import {Test} from "./components/test.js";
import {Result} from "./components/result.js";
import {Check} from "./components/checking.js";

export class Router {
    constructor() {
        this.routes = [
            {
                route: '#/',
                title: 'Главная',
                template: 'templates/index.html',
                styles: 'css/index.css',
                load: () => {
                }
            },
            {
                route: '#/registration',
                title: 'Регистрация',
                template: 'templates/registration.html',
                styles: 'css/registration.css',
                load: () => {
                    new Form()
                }
            },
            {
                route: '#/choice',
                title: 'Выбор теста',
                template: 'templates/choice.html',
                styles: 'css/choice.css',
                load: () => {
                    new Choice()
                }
            },
            {
                route: '#/test',
                title: 'Тест',
                template: 'templates/test.html',
                styles: 'css/test.css',
                load: () => {
                    new Test()
                }
            },
            {
                route: '#/result',
                title: 'Результаты',
                template: 'templates/result.html',
                styles: 'css/result.css',
                load: () => {
                    new Result()
                }
            },
            {
                route: '#/checking',
                title: 'Проверка',
                template: 'templates/answers.html',
                styles: 'css/answers.css',
                load: () => {
                    new Check()
                }
            },
        ]
    }

    async openRoute() {
        const newRoute = this.routes.find((item) => {
            return item.route === window.location.hash;
        });

        if (!newRoute) {
            window.location.hash = '#/';
            return;
        }

        document.getElementById('content').innerHTML =
            await fetch(newRoute.template).then(res => res.text());
        document.getElementById('styles').setAttribute('href', newRoute.styles);
        document.getElementById('page-title').innerHTML = newRoute.title;
        newRoute.load();
    }
}