import { getrecipeofthedayfunction } from "./keys.js";
import { formatRecipeData, saveRecipe } from "./functions.js";

const outputDiv = document.getElementById("output");
const saveRecipeButton = document.getElementById("saverecipebutton");

saveRecipeButton.addEventListener("click", e =>{
    saveRecipe(saveRecipeButton, document.getElementById("popup"));
})

// fetch recipe and display it
fetch(getrecipeofthedayfunction)
.then((response) => response.json()) // Fetch response as plain text
.then((data) => {
    document.getElementById("loader").style.display = "none";
    document.getElementById("outputcontainer").style.display = "block";
    document.getElementById("maintitle").style.display = "block";

    // replace newline character so data formats properly
    const recipedata = JSON.parse(data[0].recipe.replace(/\n/g,'\\n'));
    sessionStorage.setItem("currentrecipe", JSON.stringify(recipedata));
    formatRecipeData(outputDiv, recipedata, false);
})