import { formatRecipeData } from "./functions.js";
import { deleterecipesfunction, deletecollectionitemsfunction } from "./keys.js";
import { CheckPopup } from "./functions.js";

// if user edited a recipe they will be redirected to this page from
// editrecipe.js and the "edited" sessionstorage item will be set
// function will check for this and display appropriate message
CheckPopup("edited", "Saved Edits");

const outputDiv = document.getElementById("output");
const outputContainer = document.getElementById("outputcontainer");

outputContainer.style.display = "block";

// obj is the recipe string
const obj = sessionStorage.getItem("currentrecipe");
// display recipe 
formatRecipeData(outputDiv, obj, false);

const returnButton = document.getElementById("returnbutton");
const deleteButton = document.getElementById("deletebutton");
const removeButton = document.getElementById("removebutton");
const editButton = document.getElementById("editbutton");

// if user is on this page through a collection then the remove button is shown
if (sessionStorage.getItem("currentcollectionitemid") !== "null"){
    removeButton.style.display = "inline";
}

// removes recipe from collection
removeButton.addEventListener("click", e=> {
    let itemtodelete = [sessionStorage.getItem("currentcollectionitemid")];
    console.log(itemtodelete);
    fetch(deletecollectionitemsfunction, {
        headers: {
            "collectionitemids":itemtodelete
            }
    }).then((response) => response.json())
    .then((data) => {
        console.log(data);
        sessionStorage.setItem("removed","true");
        window.location.replace("saved.html");
    })
})

returnButton.addEventListener("click", e => {
    window.location.replace("saved.html");
    sessionStorage.setItem("currentcollectionitemid",null);
})

// deletes recipe from db and all collections
deleteButton.addEventListener("click", e => {
    fetch(deleterecipesfunction, {
        headers: {
            "recipeids":[sessionStorage.getItem("currentrecipeid")],
            }
    }).then((response) => response.json())
    .then((data) => {
        console.log(data);
        sessionStorage.setItem("deleted","true");
        window.location.replace("saved.html");
    })
})

editButton.addEventListener("click", e => {
    window.location.replace("editrecipe.html");
})