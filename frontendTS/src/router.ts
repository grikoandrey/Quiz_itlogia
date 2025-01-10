import {Form} from "./components/registration";
import {Choice} from "./components/choice";
import {Test} from "./components/test";
import {Result} from "./components/result";
import {Check} from "./components/checking";
import {Auth} from "./services/auth";
import {RouteType} from "./types/route.type";
import {UserInfoType} from "./types/user-info.type";

export class Router {
    readonly contentElement: HTMLElement | null;
    readonly stylesElement: HTMLElement | null;
    readonly titleElement: HTMLElement | null;
    readonly profileElement: HTMLElement | null;
    readonly profileFullNameElement: HTMLElement | null;

    private routes: RouteType[];

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

    public async openRoute(): Promise<void> {
        const urlRoute: string = window.location.hash;
        if (urlRoute === '#/logout') {
            const result: boolean = await Auth.logout();
            if (result) {
                window.location.href = '#/';
                return;
            }
        }

        const newRoute: RouteType | undefined = this.routes.find((item) => {
            return item.route === urlRoute;
        });

        if (!newRoute) {
            window.location.href = '#/';
            return;
        }

        if(!this.contentElement || !this.stylesElement || !this.titleElement ||
            !this.profileElement || !this.profileFullNameElement) {
            if (urlRoute === '#/') {
                return
            } else {
                window.location.href = '#/';
                return;
            }
        }

        this.contentElement.innerHTML =
            await fetch(newRoute.template).then(res => res.text());
        this.stylesElement.setAttribute('href', newRoute.styles);
        this.titleElement.innerHTML = newRoute.title;

        const userInfo: UserInfoType | null = Auth.getUserInfo();
        const accessToken: string | null = localStorage.getItem(Auth.accessTokenKey);
        if (userInfo && accessToken) {
            this.profileElement.style.display = 'flex';
            this.profileFullNameElement.innerText = userInfo.fullName;
        } else {
            this.profileElement.style.display = 'none';
        }

        newRoute.load();
    }
}