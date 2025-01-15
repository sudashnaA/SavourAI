// will display popup with selected text
function popupFade(element, text)
{
    popup.textContent = text
    element.classList.remove("fadeOut");
    element.classList.add("fadeIn");
    setTimeout(() => {
        element.classList.remove("fadeIn");   
        element.classList.add("fadeOut");     
    }, 1000);
}

// will check a sessionvariable and if it is true it will display a popup
function CheckPopup(sessionvar, text){
    if (sessionStorage.getItem(sessionvar) === "true"){
        sessionStorage.setItem(sessionvar,null);
        popupFade(popup, text);
    }
}

// takes recipe string and displays it properly on the page
function formatRecipeData(element, obj, typewriter){
    obj = decodeURIComponent(obj);
    const dataformat = obj.split(/\r?\n/).filter(function(s){return s})
    for (var x = 0; x < dataformat.length; x++){
        const firstChar = dataformat[x].substring(0,1);
        if (firstChar === "*" || firstChar === "#")
        {
            const titleContainer = document.createElement("div");
            const title = document.createElement("H2");
            title.textContent = dataformat[x].replace(/[+#*\n]|^\d+/g, " ");
            if (typewriter){
                title.classList.add("typewriter");
            }

            titleContainer.appendChild(title);
            element.appendChild(titleContainer);
        }
        else{
            const text = document.createElement("p");
            text.textContent = dataformat[x].replace(/[+*\n]|^\d+/g, " ");
            if (typewriter){
                text.classList.add("typewriter");
            }

            element.appendChild(text);
        }
    }
}

// used to highlight elements for any multi select features
// takes an array of selected items and event
// elementid is used to select the correct hidden element
function highlightElements(e, selectedItems, elementid){
    let selectedRecipeID;
    let target;
    // if container is clicked
    if (e.target.tagName.toLowerCase() === "div"){
        selectedRecipeID = e.target.children[elementid].textContent;
        target = e.target;
        }
    // if recipe title is clicked
    else{
        selectedRecipeID = e.target.parentElement.children[elementid].textContent;
        target = e.target.parentElement;
    }

    // item was already selected so deselect it
    if (selectedItems.includes(selectedRecipeID)){
        target.classList.remove("selecteditem");
        selectedItems = selectedItems.filter(e => e !== selectedRecipeID);
    }
    // select item
    else{
        target.classList.add("selecteditem");
        selectedItems.push(selectedRecipeID);
    }
    return selectedItems;
}

import { saverecipefunction } from "./keys.js";

// saves recipe by calling azure function
async function saveRecipe(button, popup){
    await fetch(saverecipefunction,{
        headers: {
            "recipe":sessionStorage.getItem("currentrecipe"),
            "userid":sessionStorage.getItem("key"),
            "Access-Control-Allow-Origin":"*"
            }
    })
    .then((response) => response.json()) // Fetch response as json
    .then((data) => {
        button.disabled = true;
        popupFade(popup, "Saved Recipe");
    });
}

export {popupFade, formatRecipeData, highlightElements, saveRecipe, CheckPopup}