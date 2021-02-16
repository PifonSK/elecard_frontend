let itemList = [];
let defaultItemList;
let itemDelList = [];
const main__container = document.querySelector('.main__container');
const main__tree = document.querySelector('.main__tree');
const footer__pagination = document.querySelector('.footer__pagination');
const sort = document.querySelector('input[name="sort"]');
let perPageItems = 60;

document.addEventListener('DOMContentLoaded', checkStorage());

//проверяет записано ли что-то в localStorage
function checkStorage(){
    //если в localStorage есть записанное состояние каталога (storage), то пердать в массив это состояние и отобразить каталог
    //если в localStorage нет записанного каталога, то отобразить исходный каталог
    if(localStorage.getItem('storage')) {
        itemList = JSON.parse(localStorage.getItem('storage'));
        reloadList(perPageItems);
        displayTree(itemList);
    }else{
        loadList();
    };

    //если в localStorage есть записанное состояние сортировки (sort), то выбрать его
    //если в localStorage нет записанного состояния сортировки, то выбрать дефолтное
    if(localStorage.getItem('sort')) {
        let sortType = localStorage.getItem('sort');
        $(`input[value="${sortType}"]`).prop('checked', true);
    }else{
        $(`input[value="default"]`).prop('checked', true);
    };

    //если в localStorage есть записанное состояние вида (view), то выбрать его
    //если в localStorage нет записанного состояния вида, то выбрать карточки
    if(localStorage.getItem('view')) {
        let viewType = localStorage.getItem('view');
        $(`input[value="${viewType}"]`).prop('checked', true);
        if($("[name=view]:checked").val() === "tree"){
            showTree();
        };
    }else{
        $(`input[value="cards"]`).prop('checked', true);
    };

    //если в localStorage есть записанное состояние каталога удаленных элементов (delStorage), то передать его в массив itemDelList
    //если в localStorage нет записанного каталога, по передать в itemDelList пустой массив
    if(localStorage.getItem('delStorage')) {
        itemDelList = JSON.parse(localStorage.getItem('delStorage'));
    }else{
        itemDelList = [];
    };
};

//подключение JSON-каталога и передача в массив itemList
function loadList() {
    $.getJSON("http://contest.elecard.ru/frontend_data/catalog.json", function(catalog) {
        itemList = catalog; 
        localStorage.setItem('defaultStorage', JSON.stringify(itemList));
        localStorage.setItem('storage', JSON.stringify(itemList));
        reloadList(perPageItems);
    });
};

//очищает контейнер, затем заполняет его элементами из itemList
function displayList() {
    main__container.innerHTML = '';
    let currentPage = 0;    
    itemList.forEach(function(item, i) {
        let d = new Date(item.timestamp);
        let time = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + " " + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        let newItem = `
        <div class="main__item" id='item_${i}'>
            <div class="main__item-image" style="background-image: url(http://contest.elecard.ru/frontend_data/${item.image});"></div>
            <div class="main__item-description">
                <p><b>Имя:</b> ${item.image.split('/')[1]}</p>
                <p><b>Категория:</b> ${item.category}</p>
                <p><b>Дата:</b> ${time}</p>
                <p><b>Размер:</b> ${Math.round(item.filesize/1024)} КБ</p>
            </div>
            <button type="button" class="close main__item-close" aria-label="Close" onclick="deleteItem(this)">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        `;
        let newPage = `
            <div class="main__page" type="${currentPage}" id="page_${currentPage}"></div>
        `;
        if(i % perPageItems === 0){
            main__container.insertAdjacentHTML('beforeend', newPage);
            let main__page = document.querySelector(`#page_${currentPage}`);
            main__page.insertAdjacentHTML('beforeend', newItem);
            currentPage++;
        }else{
            let main__page = document.querySelector(`#page_${currentPage - 1}`);
            main__page.insertAdjacentHTML('beforeend', newItem);
        };
    });
};

//расчитывает и рендерит пагинацию
function createPagination(perPageItems){
    let totalPages = Math.ceil(itemList.length/perPageItems);
    let pagination = `
    <nav aria-label="...">
        <ul class="pagination">
            <div class="footer__paginationItems"></div>
        </ul>
    </nav>
    `;
    footer__pagination.innerHTML = pagination;
    const footer__paginationItems = document.querySelector('.footer__paginationItems');
    for(let n = 0; n < totalPages; n++){
        let paginationItem = `
        <li class="page-item" type="${n}" onclick="showPage(this)"><a class="page-link" href="#">${n+1}</a></li>
        `;
        footer__paginationItems.insertAdjacentHTML('beforeend', paginationItem);
    };
};

//при нажатии на item-close объект с полученным id удаляется из itemList, происходит отрисовка содержимого и новый
//массив с объектами записывается в localStorage
function deleteItem(elem){
    let m = $(elem).parents('.main__item').attr('id');
    itemList.forEach(function(item, i){ 
        if (`item_${i}` === m){
            $(`#item_${i}`).fadeTo(80, 0, function(){
                itemDelList.push(itemList[i]);
                itemList.splice(i, 1);
                displayList();
                createPagination(perPageItems);
                showPage($('.page-item[type="' + $(elem).parents('.main__page').attr('type') + '"]'));
                localStorage.setItem('storage', JSON.stringify(itemList));
                localStorage.setItem('delStorage', JSON.stringify(itemDelList));
            });
        };
    });
};

//переключение между страницами
function showPage(page) {
    $('.page-item').removeClass('active');
    $(page).addClass('active');
    $('.main__page').hide();
    $('.main__page[type="' + $(page).attr('type') + '"]').show();
};

//сброс переключателя страниц
function resetPagination(){
    $('.page-item[type="0"]').addClass('active');
    $('.main__page').hide();
    $('.main__page[type="0"]').show();
};

//обновление страницы с карточками и пагинации
function reloadList(perPageItems){
    displayList();
    createPagination(perPageItems);
    resetPagination();
};

//сортировка
if (document.querySelector('input[name="sort"]')) {
    document.querySelectorAll('input[name="sort"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
            let sortType = event.target.value;
            switch (sortType) {
                case "default":
                    itemList = JSON.parse(localStorage.getItem('defaultStorage'));
                    let diff = itemList.filter(x => !itemDelList.some(y => x.image === y.image));
                    itemList = diff;
                    break;
                case "category":
                    itemList.sort((a, b) => a.category > b.category ? 1 : -1);
                    break;
                case "date":
                    itemList.sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);
                    break;
                case "name":
                    itemList.sort((a, b) => a.image.split('/')[1] > b.image.split('/')[1] ? 1 : -1);
                    break;
                case "filesize":
                    itemList.sort((a, b) => a.filesize > b.filesize ? 1 : -1);
                    break;
            };
            localStorage.setItem("sort", event.target.value);
            localStorage.setItem("storage", JSON.stringify(itemList));
            reloadList(perPageItems);
        });
    });
};

//в зависимости от выбора чекбокса меняет отображение содержимого массива itemList
if (document.querySelector('input[name="view"]')) {
    document.querySelectorAll('input[name="view"]').forEach((elem) => {
        elem.addEventListener("change", function(event) {
            let sortType = event.target.value;
            if(sortType === "cards"){
                showCards();
            }else if(sortType === "tree"){
                showTree();
            };
            localStorage.setItem("view", event.target.value);
        });
    });
};

//отображает вид - "Карточки"
function showCards(){
    $('.main__tree').hide();
    $('.main__container').show();
    $('.footer__pagination').show();
    $('#header__sort').fadeTo(100, 1);
};

//отображает вид - "Дерево"
function showTree(){
    itemList = JSON.parse(localStorage.getItem('storage'));
    displayTree(itemList);
    $('.main__container').hide();
    $('.footer__pagination').hide();
    $('#header__sort').fadeTo(100, 0);
    $('.main__tree').show();
};

//по нажатию кнопки Сброс очищает localStorage, загружает исходный каталог и выодит на страницу элементы из itemList
function resetList() {
    localStorage.clear();
    checkStorage();
    setTimeout(showCards, 0);
};

//убирает лоадер после загрузки страницы
$(function startLoader(){
    $('.overlay').hide();
});

//записываем категории из itemList в Set
function getCategories(data) {
    let categories = new Set();
    $.each(data, function(key, item) {
        categories.add(item.category);
    });
    return categories;
};

//строим дерево
function displayTree(data){
    main__tree.innerHTML = '';
    let i=0;
    main__tree.insertAdjacentHTML('beforeend', `<ul><li><span class="show">Категории</span><ul id="main__category-root"></ul></li></ul>`);
    let categories = getCategories(data);
    categories.forEach((category)=>{
        let out = `<li><span class="show">${category}</span><ul id="main__category-${category}"></ul></li>`;
        document.getElementById('main__category-root').insertAdjacentHTML('beforeend', out);
        for (let item of data){
            if(category == item.category){
                let d = new Date(item.timestamp);
                let time = d.getDate() + '.' + (d.getMonth()+1) + '.' + d.getFullYear() + " " + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
                out = `
                <li><span class="hide">Item ${i++}</span>
                    <ul hidden>
                        <li class="last-li"><b>Миниатюра:</b><a class="main__item-thumbnail" style="background-image: url(http://contest.elecard.ru/frontend_data/${item.image});" href="http://contest.elecard.ru/frontend_data/${item.image}" target="_blank"></a></li>                    
                        <li class="last-li"><b>Имя:</b> ${item.image.split('/')[1]}</li>
                        <li class="last-li"><b>Категория:</b> ${item.category}</li>
                        <li class="last-li"><b>Дата:</b> ${time}</li>
                        <li class="last-li"><b>Размер:</b> ${Math.round(item.filesize/1024)} КБ</li>
                    </ul>
                </li>
                `;
                document.getElementById(`main__category-${category}`).insertAdjacentHTML('beforeend', out);
            };
        };
    });
};

//по клику на любом элементе main__tree сворачивает или разворачивает
main__tree.onclick = function(event){
    if (event.target.tagName != 'SPAN') return;
    let childrenList = event.target.parentNode.querySelector('ul');
    if (!childrenList) return;
    childrenList.hidden = !childrenList.hidden;
    if (childrenList.hidden){
        event.target.classList.add('hide');
        event.target.classList.remove('show');
    }else{
        event.target.classList.add('show');
        event.target.classList.remove('hide');
    };
};