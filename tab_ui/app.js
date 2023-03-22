var tabs = document.querySelectorAll('.tab-item');
var panes = document.querySelectorAll('.tab-pane');

var defaultActiveTab = document.querySelector('.tab-item.active');
var line = document.querySelector('.line');

line.style.left = defaultActiveTab.offsetLeft + 'px';
line.style.width = defaultActiveTab.offsetWidth + 'px';

tabs.forEach((tab, index) => {

    var pane = panes[index];

    tab.onclick = function () {

        document.querySelector('.tab-item.active').classList.remove('active');
        document.querySelector('.tab-pane.active').classList.remove('active');

        line.style.left = this.offsetLeft + 'px';
        line.style.width = this.offsetWidth + 'px';

        this.classList.add('active');
        pane.classList.add('active');
    };
});