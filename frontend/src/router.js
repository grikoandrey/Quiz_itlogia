import {Form} from "./components/registration.js";
import {Choice} from "./components/choice.js";
import {Test} from "./components/test.js";
import {Result} from "./components/result.js";
import {Check} from "./components/checking.js";
import {Auth} from "./services/auth.js";

export class Router {
    constructor() {
        this.contentElement = document.getElementById("content");
        this.stylesElement = document.getElementById('styles');
        this.titleElement = document.getElementById('page-title');
        this.profileElement = document.getElementById('profile');
        this.profileFullNameElement = document.getElementById('profile-fullName');


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
                route: '#/signup',
                title: 'Регистрация',
                template: 'templates/signup.html',
                styles: 'css/registration.css',
                load: () => {
                    new Form('signup');
                }
            },
            {
                route: '#/login',
                title: 'Вход в систему',
                template: 'templates/login.html',
                styles: 'css/registration.css',
                load: () => {
                    new Form('login');
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
        const urlRoute = window.location.hash;
        if (urlRoute === '#/logout') {
            await Auth.logout();

            window.location.href = '#/';
            return;
        }

        const newRoute = this.routes.find((item) => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.hash = '#/';
            return;
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(res => res.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerHTML = newRoute.title;

        const userInfo = Auth.getUserInfo();
        const accessToken = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profileFullNameElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }


        newRoute.load();
    }
}