const mealsElem = document.getElementById('meals');
const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search-btn');
const favListContainer = document.getElementById('favList');
const mealPopup = document.getElementById('meal-popup');
const popupCloseBtn = document.getElementById('close-popup');
const mealInfoElem = document.getElementById('meal-info');

getRandomMeal();

fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
    const respData = await resp.json();
    const randomMeal = respData.meals[0];
    
    addMeal(randomMeal, true);
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);
    const respData = await resp.json();
    const meal = respData.meals[0];
    return meal;
}

async function getMealBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);
    const respData = await resp.json();
    const meals = respData.meals;
    return meals;
}

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
        <div class="meal-header">
            <h4 class="meal-name">${mealData.strMeal}</h4>
        </div>
        <div class="meal-img-wrapper">
            ${random ? `<span class="random">Random Recipe</span>` : ''}
            <img 
                src="${mealData.strMealThumb}" 
                alt="${mealData.strMeal}"
                class="meal-img"
            >
        </div>
        <div class="meal-body">
            <div class="descr-panel flex justify-center">
                <p class="descr-item area"><strong>Area</strong><br> ${mealData.strArea}</p>
                <p class="descr-item category"><strong>Category</strong><br> ${mealData.strCategory}</p>
            </div>
            <div class="btns-panel flex justify-between">
                <button class="btn fav-btn" title="Add to favorite">
                    <i class="fa-solid fa-heart"></i>
                </button>
                ${random ? `
                    <button class="btn next-btn" onclick="document.location.reload(true)">
                        Next <i class="fa-solid fa-angle-right"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
    const btn = meal.querySelector('.meal-body .fav-btn');
    const mealImg = meal.querySelector('.meal-img');
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            removeMealFromLS(mealData.idMeal);
            btn.classList.remove('active');
        } else {
            addMealToLS(mealData.idMeal);
            btn.classList.add('active');
        }
        fetchFavMeals();
    });
    mealImg.addEventListener('click', () => {
        showMealInfo(mealData);
    });
    meals.appendChild(meal);
}

function addMealToLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealFromLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));
    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    favListContainer.innerHTML = '';
    const mealIds = getMealsFromLS();
    const meals = [];
    for (let i=0; i<mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);
        addMealToFav(meal);
    }
}

function addMealToFav(mealData) {
    const favMeal = document.createElement('li');
    favMeal.classList.add('splide__slide');
    favMeal.innerHTML = `
        <img 
            src="${mealData.strMealThumb}" 
            width="80" 
            height="80" 
            alt="${mealData.strMeal}"
            class="fav-meal-img"
        >
        <h4 class="fav-meal-name">${mealData.strMeal}</h4>
        <button class="btn delete-btn">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;
    const btn = favMeal.querySelector('.delete-btn');
    btn.addEventListener('click', () => {
        removeMealFromLS(mealData.idMeal);
        fetchFavMeals();
    });
    const favMealImg = favMeal.querySelector('.fav-meal-img');
    favMealImg.addEventListener('click', () => {
        showMealInfo(mealData);
    });
    favListContainer.appendChild(favMeal);
}

searchBtn.addEventListener('click', async () => {
    if (searchTerm.value !== '') {
        mealsElem.innerHTML = '';
        const search = searchTerm.value;
        const meals = await getMealBySearch(search);
        if (meals) {
            meals.forEach(meal => {
                addMeal(meal);
            });
        }
    } else {
        return false;
    }
});

function showMealInfo(mealData) {
    mealInfoElem.innerHTML = '';
    console.log(mealData);
    const mealEl = document.createElement('div');
    const ingredients = [];
    for (let j = 1; j <= 20; j++) {
        if (mealData['strIngredient' + j]) {
            ingredients.push(`<strong>${mealData['strIngredient' + j]}</strong> <br> ${mealData['strMeasure' + j]}`);
        } else {
            break;
        }
    }
    mealEl.innerHTML = `
        <h2 class="popup-heading">${mealData.strMeal}</h2>
        <div class="popup-meal-info flex flex-center">
            <p class="area"><strong>Area:</strong> ${mealData.strArea}</p>
            <p class="category"><strong>Category:</strong> ${mealData.strCategory}</p>
        </div>
        <div class="popup-body flex justify-between">
            <div class="popup-img-wrapper">
                <img 
                    src="${mealData.strMealThumb}"
                    alt="${mealData.strMeal}"
                >
            </div>
            <div class="popup-ingredients-wrapper">
                <h3>Ingredients:</h3>
                <ul class="inredients-list flex wrap">
                    ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
                </ul>
            </div>
        </div>
        <p class="section-text">${mealData.strInstructions}</p>
        <a href="${mealData.strYoutube}" class="youtube-link" target="_blank">
            Watch on <i class="fa-brands fa-youtube"></i>
        </a>
    `;
    mealInfoElem.appendChild(mealEl);
    mealPopup.classList.add('active');
}

popupCloseBtn.addEventListener('click', () => {
    mealPopup.classList.remove('active');
})

// CAROUSEL
var splide = new Splide( '.splide', {
    type   : 'loop',
    perMove: 1,
  } );
splide.mount();