import { generaterecipefunction } from "./keys.js";

import { formatRecipeData, saveRecipe } from "./functions.js";

if (sessionStorage.getItem("key") === null){
    console.log("not logged in");
}

const ingredientsInput = document.getElementById("ingredients-input");
const extraRequestsInput = document.getElementById("extra-requests-input");
const customFoodInput = document.getElementById("custom-food-input");

const loader = document.getElementById("loader");
const outputcontainer = document.getElementById("outputcontainer");

const recipetypeselector = document.getElementById("recipe-type-input");

var randomMode = false;

// recipetype selector has two values, random and standard
// if random is selected the two text inputs ( contained within "group" div)
// need to be hidden
recipetypeselector.addEventListener("change", function(e) {
    const group = document.getElementById("group");

    if (recipetypeselector.value === "random"){
        randomMode = true;
        group.style.display = "none";
    }
    else{
        randomMode = false;
        group.style.display = "inline";
    }
})

const foodselector = document.getElementById("food-input");
foodselector.addEventListener("change", function(e) {
    // if custom show the text input for the custom food
    if (foodselector.value === "custom"){
        document.getElementById("custom-food").style.display = "block";
    }
    else{
        document.getElementById("custom-food").style.display = "none";
    }
})

const formbutton = document.getElementById('formbutton')
formbutton.addEventListener('click',(e)=>{
    clearError();

    var isValid = true;

    if (!randomMode){
        if (ingredientsInput.value.length === 0){
            setError("Must have atleast 1 Ingredient");
            isValid = false;
        }
    }
    if (foodselector.value === "custom" && customFoodInput.value.length === 0){
        setError("Custom food must not be empty");
        isValid = false
    }

    if (isValid){
        formbutton.style.display = "none";
        loader.style.display = "block";
        generateRecipe();
    }
})

const newRecipeButton = document.getElementById("newrecipebutton");
const rerollButton = document.getElementById("rerollbutton");
const saveRecipeButton = document.getElementById("saverecipebutton");

// setup button functions

newRecipeButton.addEventListener("click", (e) => {
    window.location.reload();
})

saveRecipeButton.addEventListener("click", (e) => {
    // saves recipe and shows popup
    saveRecipe(saveRecipeButton, document.getElementById("popup"));
})

// will use the same prompt to make a new recipe
rerollButton.addEventListener("click", (e) => {
    saveRecipeButton.disabled = false;
    loader.style.display = "block";
    outputcontainer.style.display = "none";
    const outputContent = document.getElementById("output");
    // clear output elements
    // these elements were created when the generateRecipe() funtion was called
    while (outputContent.lastElementChild) {
        outputContent.removeChild(outputContent.lastElementChild);
    }
    generateRecipe();
})

// functions ----------------------------------------------

function setError(message){
    const errormsg = document.getElementById('errormsg');
    errormsg.classList.add('error');
    errormsg.textContent = message;
}

function clearError(){
    const errormsg = document.getElementById('errormsg');
    errormsg.textContent = "";
}

function generateRecipe(){
    disableForm();
    
    const ingredients = ingredientsInput.value;
    const extraRequests = extraRequestsInput.value;
    const recipeType = recipetypeselector.value;

    let foodType = foodselector.value;
    if (foodselector.value === "custom"){
        foodType = customFoodInput.value;
    }

    fetch(generaterecipefunction,{
        headers: {
            "food":foodType,
            "ingredients":ingredients,
            "extra":extraRequests,
            "recipetype":recipeType
            }
    })
    .then((response) => response.text()) // Fetch response as plain text
    .then((data) => {
        loader.style.display = "none";
        const outputDiv = document.getElementById("output");
        // show output container
        outputcontainer.style.display = "block";
        // change newline characters from data to work properly
        const obj = JSON.parse(data.replace(/\n/g,'\\n'))
        sessionStorage.setItem("currentrecipe",data);

        // will display the recipe on the page
        // elements will be created in the output div to do this
        formatRecipeData(outputDiv, obj, true);
    })
}

function disableForm(){
    recipetypeselector.disabled = true;
    foodselector.disabled = true;
    ingredientsInput.disabled = true;
    extraRequestsInput.disabled = true;
    customFoodInput.disabled = true;
}