document.addEventListener(`DOMContentLoaded`, () => {
    const inputs = document.getElementsByTagName(`input`);

    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i].type == `checkbox` || inputs[i].type == `radio`) {
            continue;
        }
        const input: HTMLInputElement = inputs[i];

        setupInputs(input);

        input.addEventListener(`input`, inputOnInput);
        input.addEventListener(`invalid`, (e) => {
            console.log(e);
        });
        setTimeout(() => {
            inputOnInput(input);
        }, 0);
    }
});

function setupInputs (input: HTMLInputElement, parameter: string = `placeholder`): void {
    const inputOn = {
        focus: function (event: Event) {
            const input: HTMLInputElement = <HTMLInputElement>event.target;
            const container = <HTMLDivElement>input.parentElement;
            container.classList.add(`focus`);
        },
        blur: function (event: Event) {
            const input: HTMLInputElement = <HTMLInputElement>event.target;
            const container = <HTMLDivElement>input.parentElement;
            container.classList.remove(`focus`);
        }
    };
    const inputContainer: HTMLDivElement = document.createElement(`div`);
    const span = document.createElement(`span`);
    span.classList.add(`placeholder`);
    inputContainer.className = input.className;
    inputContainer.classList.add(`inputContainer`);
    span.innerHTML = input.placeholder ?? ``;

    input.removeAttribute(`class`);

    // eslint-disable-next-line no-unused-expressions
    input.parentElement?.replaceChild(inputContainer, input);
    inputContainer.appendChild(input);
    inputContainer.appendChild(span);

    if (input.type == `password`) {
        const passwordEyeOnChange: (connectedInputs: string[]) => any = (connectedInputs: string[]) => {
            const toggleVisibility: (eye: HTMLInputElement, input: HTMLInputElement)=>void = (eye, input): void => {
                if (eye.checked) {
                    eye.title = `Hide password`;
                    input.type = `text`;
                } else {
                    eye.title = `Show password`;
                    input.type = `password`;
                }
            };
            const getInputElement: (identification: string) => (HTMLInputElement | HTMLInputElement[]) = (identification) => {
                let element: any = document.getElementsByName(identification);
                if (!element) {
                    element = document.getElementById(identification);
                    if (!element) {
                        element = document.getElementsByClassName(identification);
                        if (!element) {
                            element = document.querySelectorAll(identification);
                        }
                    }
                }
                return element;
            };
            return function (event: Event) {
                const defaultEye = <HTMLInputElement>event.target ?? event;
                const defaultInput = <HTMLInputElement>defaultEye.parentElement?.childNodes[0];

                toggleVisibility(defaultEye, defaultInput);
                connectedInputs.forEach(identification => {
                    let input = getInputElement(identification);
                    if (typeof input == `object` && (<HTMLInputElement[]>input).length > 1) {
                        const inputs = <HTMLInputElement[]>input;

                        for (let i = 0; i < inputs.length; i++) {
                            const input = <HTMLInputElement>inputs[i];
                            if (!input) {
                                console.log(`ds`);
                            }
                            const eye = <HTMLInputElement>(<HTMLDivElement>input.parentElement).childNodes[2];
                            if (eye.checked != defaultEye.checked) {
                                eye.click();
                            }
                        }
                    } else {
                        if (typeof input == `object` && typeof (<HTMLInputElement[]>input).length != `undefined`) {
                            input = <HTMLInputElement>(<HTMLInputElement[]>input)[0];
                        } else {
                            input = <HTMLInputElement>input;
                        }
                        if (!input) {
                            return;
                        }
                        const eye = <HTMLInputElement>(<HTMLDivElement>input.parentElement).childNodes[2];
                        if (eye.checked != defaultEye.checked) {
                            eye.click();
                        }
                    }
                });
            };
        };
        const inputPasswordOnInput: (event: Event) => void = (event: Event): void => {
            const input = <HTMLInputElement>event.target ?? event;
            const eye = <HTMLInputElement>input.parentElement?.childNodes[2];
            if (input.value == `` && eye.checked) {
                eye.click();
            }
        };
        const showPasswordEye = document.createElement(`input`);
        showPasswordEye.type = `checkbox`;
        showPasswordEye.classList.add(`showPassword`);
        showPasswordEye.title = `Show password`;
        showPasswordEye.tabIndex = -1;
        showPasswordEye.addEventListener(`change`, passwordEyeOnChange(input.getAttribute(`data-eye-connect`)?.trim().split(`,`) ?? []));
        inputContainer.appendChild(showPasswordEye);

        input.addEventListener(`input`, inputPasswordOnInput);
    }

    input.addEventListener(`focus`, inputOn.focus);
    input.addEventListener(`blur`, inputOn.blur);
    if (input.autocomplete == ``) { input.autocomplete = `on`; }
}

function inputOnInput (event: (Event|HTMLInputElement)): void {
    const input = <HTMLInputElement>(<Event>event).target ?? event;
    input.setAttribute(`data-filled`, input.value != `` ? `true` : `false`);
}
