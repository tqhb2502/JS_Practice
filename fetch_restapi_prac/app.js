// main
var coursesAPI = 'http://localhost:3000/courses';

start();

// functions
function start() {
    getCourses(renderCourses);

    handleCreateButton();
}

function getCourses(cb) {
    fetch(coursesAPI)
        .then(function (response) {
            return response.json();
        })
        .then(cb);
}

function addCourse(data) {
    var option = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(coursesAPI, option)
        .then(function () {
            getCourses(renderCourses);
        });
}

function handleDeleteCourse(id) {
    var option = {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    };

    fetch(coursesAPI + '/' + id, option)
        .then(function () {
            getCourses(renderCourses);
        });
}

function modifyCourse(id, data) {
    var option = {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };

    fetch(coursesAPI + '/' + id, option)
        .then(function () {
            getCourses(renderCourses);
        });
}

function handleModifyCourse(id) {
    // cho tên và mô tả của khóa cần chỉnh sửa vào ô input tương ứng
    var nameInput = document.querySelector('input[name="name"]');
    var descriptionInput = document.querySelector('input[name="description"]');
    var courseName = document.querySelector('.course-item-' + id + ' > h4').innerText;
    var courseDes = document.querySelector('.course-item-' + id + ' > p').innerText;

    nameInput.value = courseName;
    descriptionInput.value = courseDes;

    // chuyển nút TẠO MỚI thành nút CHỈNH SỬA
    var createButton = document.getElementById('create-btn');

    var modifyButton = document.createElement('button');
    modifyButton.id = 'modify-btn';
    modifyButton.innerText = 'Chỉnh sửa';

    var buttonSection = document.getElementById('btn-section');
    buttonSection.removeChild(createButton);
    buttonSection.appendChild(modifyButton);

    // lắng nghe nút CHỈNH SỬA
    modifyButton.onclick = function () {
        var courseData = {
            name: nameInput.value,
            description: descriptionInput.value
        };

        modifyCourse(id, courseData);

        nameInput.value = '';
        descriptionInput.value = '';

        buttonSection.removeChild(modifyButton);
        buttonSection.appendChild(createButton);
    };
}

function renderCourses(courses) {
    var courseListBlock = document.getElementById('course-list');
    var htmlCodes = courses.map(function (course) {
        return `
            <li class="course-item-${course.id}">
                <h4>${course.name}</h4>
                <p>${course.description}</p>
                <button onclick="handleDeleteCourse(${course.id})">Xóa</button>
                <button onclick="handleModifyCourse(${course.id})">Sửa</button>
            </li>
        `;
    });
    courseListBlock.innerHTML = htmlCodes.join('');
}

function handleCreateButton() {
    var createButton = document.getElementById('create-btn');

    createButton.onclick = function () {

        var nameInput = document.querySelector('input[name="name"]');
        var descriptionInput = document.querySelector('input[name="description"]');

        var course = {
            name: nameInput.value,
            description: descriptionInput.value
        };

        addCourse(course);

        nameInput.value = '';
        descriptionInput.value = '';
    }
}