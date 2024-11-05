(function () {
    const Form = {
        agreeElement: null,
        processElement: null,

        fields: [
            {
                name: 'name',
                id: 'name',
                element: null,
                regex: /^[а-я]+\s*$/i,
                valid: false,
            },
            {
                name: 'lastName',
                id: 'last-name',
                element: null,
                regex: /^[а-я]+\s*$/i,
                valid: false,
            },
            {
                name: 'email',
                id: 'email',
                element: null,
                regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                valid: false,
            },
        ],
        init() {
            const that = this;
            this.fields.forEach(item => {
                item.element = document.getElementById(item.id);

                item.element.onchange = function () {
                    that.validateField.call(that, item, this);
                }
            });
            this.processElement = document.getElementById('process');
            this.processElement.onclick = function () {
                that.processForm();
            }
            this.agreeElement = document.getElementById('agree');
            this.agreeElement.onchange = function () {
                that.validateForm();
            }
        },
        validateField (field, element) {
            if (!element.value || !element.value.match(field.regex)) {
                element.parentNode.style.borderColor = 'red';
                field.valid = false;
            } else {
                element.parentNode.removeAttribute('style');
                field.valid = true;
            }
            this.validateForm();
        },
        validateForm () {
            const validForm = this.fields.every(item => item.valid);
            const isValid = this.agreeElement.checked && validForm
            if (isValid) {
                this.processElement.removeAttribute('disabled');
            } else {
                this.processElement.setAttribute('disabled', 'disabled');
            }
            return isValid;
        },
        processForm() {
            if (this.validateForm()) {

                // let paramString = '';
                this.fields.forEach(item => {
                    // передача через адресную строку заменена на session Storage
                    // paramString += `${(!paramString ? '?' : '&')}${item.name}=${item.element.value}`;
                    sessionStorage.setItem(item.name, item.element.value);
                })
                // location.href = `choice.html${paramString}`;
                location.href = 'choice.html';
            }
        }
    };
    Form.init();
})();