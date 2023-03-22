function validator(option) {

    let formElem = document.querySelector(option.form);
    let rules = option.rules;
    let testCollection = {};

    // lấy phần tử form group
    function getFormGroup(elem, selector) {
        while (elem.parentElement) {
            if (elem.parentElement.matches(selector)) {
                return elem.parentElement;
            }
            elem = elem.parentElement;
        }
    }

    // kiểm tra xem phần tử (cụm phần tử) có hợp lệ hay không
    // hợp lệ --> true
    // không hợp lệ --> false
    function validate(selector) {

        let inputElem = formElem.querySelector(selector);
        let groupElem = getFormGroup(inputElem, option.groupSelector);
        let messageElem = groupElem.querySelector(option.messageSelector);
        let errMessage;
        let tests = testCollection[selector];

        for (let i = 0; i < tests.length; i++) {

            switch (inputElem.type) {

                case 'radio':
                case 'checkbox':
                    let checkedElem = formElem.querySelector(selector + ':checked');
                    if (checkedElem) {
                        errMessage = tests[i](checkedElem.value);
                    } else {
                        errMessage = tests[i]('');
                    }
                    break;

                default:
                    errMessage = tests[i](inputElem.value);
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

    // loại bỏ thông báo lỗi
    function recover(inputElem) {

        let groupElem = getFormGroup(inputElem, option.groupSelector);
        let messageElem = groupElem.querySelector(option.messageSelector);

        messageElem.innerText = '';
        groupElem.classList.remove('invalid');
    }

    if (formElem) {

        // xử lý nộp form
        formElem.onsubmit = function (e) {

            e.preventDefault();

            let isValid = true;

            // kiểm tra tất cả các phần tử
            for (let selector in testCollection) {
                if (!validate(selector)) {
                    isValid = false;
                }
            }

            // trả về kết quả
            if (isValid) {

                if (typeof option.outputData === 'function') {

                    let enableInputs = formElem.querySelectorAll('[name]');
                    let outputData = Array.from(enableInputs).reduce((output, input) => {

                        switch (input.type) {

                            case 'radio':
                                if (output[input.name] === undefined) {
                                    output[input.name] = '';
                                }
                                if (input.checked) {
                                    output[input.name] = input.value;
                                }
                                break;

                            case 'checkbox':
                                if (output[input.name] === undefined) {
                                    output[input.name] = [];
                                }
                                if (input.checked) {
                                    output[input.name].push(input.value);
                                }
                                break;

                            case 'file':
                                output[input.name] = input.files;
                                break;

                            default:
                                output[input.name] = input.value;
                        }

                        return output;
                    }, {});

                    option.outputData(outputData);
                } else {
                    formElem.submit();
                }
            }
        }

        // lấy các phần tử và các luật tương ứng của nó
        rules.forEach(function (rule) {
            if (Array.isArray(testCollection[rule.selector])) {
                testCollection[rule.selector].push(rule.test);
            } else {
                testCollection[rule.selector] = [rule.test];
            }
        });

        // thêm hàm lắng nghe cho các phần tử
        for (let selector in testCollection) {

            let inputElems = formElem.querySelectorAll(selector);

            Array.from(inputElems).forEach(function (inputElem) {

                inputElem.onchange = function () {
                    validate(selector);
                };

                inputElem.onblur = function () {
                    validate(selector);
                };

                inputElem.onfocus = function () {
                    recover(this);
                };
            });
        }
    }
}

// hợp lệ trả về `undifined`
// không hợp lệ trả về thông báo lỗi
validator.isRequired = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này';
        }
    };
};

validator.isEmail = function (selector) {
    return {
        selector: selector,
        test: function (value) {
            let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return emailRegex.test(value) ? undefined : 'Trường này phải là email';
        }
    };
};

validator.minLength = function (selector, min) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : `Vui lòng nhập ít nhất ${min} ký tự`;
        }
    };
};

validator.isIdentical = function (form, password, passwordConfirm) {

    let formElem = document.querySelector(form);
    let passwordElem = formElem.querySelector(password);

    return {
        selector: passwordConfirm,
        test: function (value) {
            return value === passwordElem.value ? undefined : 'Mật khẩu không chính xác';
        }
    };
};