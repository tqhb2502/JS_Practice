function validator(formSelector, onSubmitFunc) {

    let formElem = document.querySelector(formSelector);
    let formRules = {};

    /**
     * - Hợp lệ trả về `undefined`
     * - Không hợp lệ trả về thông báo lỗi
     */
    let ruleTests = {
        required: function (value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này';
        },
        email: function (value) {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return emailRegex.test(value) ? undefined : 'Vui lòng nhập email';
        },
        identical: function (value, id) {
            let elem = formElem.querySelector(`#${id}`);
            return value === elem.value ? undefined : 'Vui lòng nhập giá trị chính xác';
        },
        min: function (value, min) {
            return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} ký tự`;
        },
        max: function (value, max) {
            return value.length <= max ? undefined : `Vui lòng nhập tối đa ${max} ký tự`;
        }
    };

    function getFormGroup(elem, selector) {
        while (elem.parentElement) {
            if (elem.parentElement.matches(selector)) {
                return elem.parentElement;
            }
            elem = elem.parentElement;
        }
    }

    function validate(inputElem) {

        let groupElem = getFormGroup(inputElem, '.form-group');
        let messageElem = groupElem.querySelector('.form-message');
        let ruleInfos = formRules[inputElem.name];
        let errMessage;

        for (let ruleInfo of ruleInfos) {

            let [ruleName, ...args] = ruleInfo.split(':');

            switch (inputElem.type) {

                case 'checkbox':
                case 'radio':
                    let checkedElem = groupElem.querySelector(':checked');
                    if (checkedElem) {
                        errMessage = ruleTests[ruleName](inputElem.value, ...args);
                    } else {
                        errMessage = ruleTests[ruleName]('', ...args);
                    }
                    break;

                default:
                    errMessage = ruleTests[ruleName](inputElem.value, ...args);
            }

            if (errMessage) {
                messageElem.innerText = errMessage;
                groupElem.classList.add('invalid');
                break;
            }
        }

        if (!errMessage) {
            messageElem.innerText = '';
            groupElem.classList.remove('invalid');
        }

        return !errMessage;
    }

    function recover(inputElem) {
        let groupElem = getFormGroup(inputElem, '.form-group');
        let messageElem = groupElem.querySelector('.form-message');
        messageElem.innerText = '';
        groupElem.classList.remove('invalid');
    }
    
    if (formElem) {

        let inputElems = formElem.querySelectorAll('[name][rules]');
        
        // lưu tên các phần tử và các luật tương ứng
        for (let inputElem of inputElems) {

            formRules[inputElem.name] = inputElem.getAttribute('rules').split('|');

            inputElem.onblur = function () {
                validate(this);
            };

            inputElem.onchange = function () {
                validate(this);
            };

            inputElem.onfocus = function () {
                recover(this);
            }
        }

        // xử lý nộp form
        formElem.onsubmit = function (e) {

            e.preventDefault();

            let inputElems = formElem.querySelectorAll('[name][rules]');
            let isValid = true;

            for (let inputElem of inputElems) {
                isValid = validate(inputElem) && isValid;
            }

            if (isValid) {
                if (typeof onSubmitFunc === 'function') {

                    let enableInputs = formElem.querySelectorAll('[name]');
                    let outputData = Array.from(enableInputs).reduce(function (data, input) {

                        switch (input.type) {
                            
                            case 'checkbox':
                                if (data[input.name] === undefined) {
                                    data[input.name] = [];
                                }
                                if (input.checked) {
                                    data[input.name].push(input.value);
                                }
                                break;

                            case 'radio':
                                if (data[input.name] === undefined) {
                                    data[input.name] = '';
                                }
                                if (input.checked) {
                                    data[input.name] = input.value;
                                }
                                break;

                            case 'file':
                                data[input.name] = input.files;
                                break;
                            
                            default:
                                data[input.name] = input.value;
                        }

                        return data;
                    }, {});

                    onSubmitFunc(outputData);
                } else {
                    formElem.submit();
                }
            }
        };
    }
}