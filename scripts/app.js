'use strict';

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let ACTIVEHABBIT_ID;

/* page */
const page= {
    menu: document.querySelector('.menu__list'),
    header: {
        h1: document.querySelector('.h1'),
        progressPercent: document.querySelector('.progress__percent'),
        progressCoverBar: document.querySelector('.progress__cover-bar'),
    },
    content: {
        daysContainer: document.getElementById('days'),
        nextDay: document.querySelector('.habbit__day'),
        comment: document.querySelector('.habbit__comment'),
    },
    popup: {
        index: document.getElementById('add-habbit-popup'),
        iconField: document.querySelector('.popup__form input[name="icon"]')
    }
}

/* utils */

function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    const habbitArray = JSON.parse(habbitsString);
    if (Array.isArray(habbitArray)) {
        habbits = habbitArray;
    }
}

function togglePopUp() {
    if(page.popup.index.classList.contains('cover_hidden')) {
        page.popup.index.classList.remove('cover_hidden');
    } else {
        page.popup.index.classList.add('cover_hidden');
    }
}

function resetForm(form, fields) {
    for(const field of fields) {
        form[field].value = '';
    }
}

function validateForm(form, fields) {   
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        const fieldValue = formData.get(field);
        form[field].classList.remove('error');
        if (!fieldValue) {
            form[field].classList.add('error');
        }
        res[field] = fieldValue;
    }
    let isValid = true;
    for  (const field of fields) {
        if(!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
}

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

/* render */
function renderMenu(activeHabbit) {
    page.menu.innerHTML = '';
    for (const habbit of habbits) {
        const element = document.createElement('button');
        element.setAttribute('menu-habbit-id', habbit.id);
        element.classList.add('menu__item');
        element.addEventListener('click', () => rerender(habbit.id));
        element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name} Logo" />`;
        // Если это активная привычка, добавляем класс 'menu__item_active'
        if (activeHabbit.id === habbit.id) {
            element.classList.add('menu__item_active');
        };
        page.menu.appendChild(element);
    }
}

function renderHead(activeHabbit) {
    page.header.h1.innerText = activeHabbit.name;
    const progress = activeHabbit.days.length / activeHabbit.target > 1
    ? 100
    : activeHabbit.days.length / activeHabbit.target * 100;
    page.header.progressPercent.innerText = progress.toFixed(0) + `%`;
    page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function renderContent(activeHabbit) {
    page.content.daysContainer.innerText = ``;
    for (const index in activeHabbit.days) {
        const element = document.createElement('div');
        element.classList.add('habbit');
        element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
            <div class="habbit__comment">${activeHabbit.days[index].comment}</div>
            <button class="habbit__delete" onclick="deleteDay(${index})">
                <img src="./images/delete.svg" alt="Delete day ${Number(index) + 1}" />
            </button>`;
            page.content.daysContainer.appendChild(element);
    }
    page.content.nextDay.innerHTML = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
    ACTIVEHABBIT_ID = activeHabbitId;
    const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);
    if (!activeHabbit) {
        return;
    }
    document.location.replace(document.location.pathname + '#' + activeHabbitId);
    renderMenu(activeHabbit);
    renderHead(activeHabbit);
    renderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
    event.preventDefault();
    const data = validateForm(event.target, ['comment']);
    if (!data) {
        return;
    }
    habbits = habbits.map(habbit => {
        if (habbit.id === ACTIVEHABBIT_ID) {
            return {
                ...habbit,
                days: habbit.days.concat([{ comment: data.comment }]) // создаем копию массива days
            }
        }
        return habbit;
    });
    resetForm(event.target, ['comment']);
    rerender(ACTIVEHABBIT_ID);
    saveData();
}

function deleteDay(index) {
    habbits = habbits.map(habbit => {
        if (habbit.id === ACTIVEHABBIT_ID) {
            habbit.days.splice(index, 1);
            return {
                ...habbit,
                days: habbit.days
            };
        }
        return habbit;
    });
    rerender(ACTIVEHABBIT_ID);
    saveData();
}

/* working with habbits */

function setIcon(context, icon) {
    page.popup.iconField.value = icon;
    const activeIcon = document.querySelector('.icon.icon_active');
    activeIcon.classList.remove('icon_active');
    context.classList.add('icon_active');
}

function addHabbit(event) {
    event.preventDefault();
    const data = validateForm(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }
    const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
    habbits.push({
        id: maxId + 1,
        name: data.name,
        target: data.target,
        icon: data.icon,
        days: []
    })
    resetForm(event.target, ['name', 'target']);
    rerender(maxId + 1);
    togglePopUp();
    saveData();
}

function deleteHabbit(id) {
    id = ACTIVEHABBIT_ID;
    // Находим индекс привычки в массиве habbits
    const index = habbits.findIndex(habbit => habbit.id === id);
    // Если привычка с таким id найдена, удаляем ее из массива
    if (index !== -1) {
        habbits.splice(index, 1);
        const redirect = index - 1;
        // Перерендериваем интерфейс с новым списком привычек
        rerender(habbits[redirect].id);
        // Сохраняем изменения в localStorage
        saveData();
    }
}

/* init */
(() => {
    loadData();
    const hashId = Number(document.location.hash.replace('#', ''));
    const urlHabbtitId = habbits.find(habbit => habbit.id == hashId);
    if (urlHabbtitId) {
        console.log('hash submit')
        rerender(urlHabbtitId);
    }
    rerender(habbits[0].id);
})()
