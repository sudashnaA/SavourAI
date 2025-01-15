import { editrecipefunction } from "./keys.js";

const cancelButton = document.getElementById("canceleditbutton");
const saveButton = document.getElementById("saveeditbutton");
const output = document.getElementById("output");
document.getElementById("outputcontainer").style.display = "block";

// current recipe data
const obj = sessionStorage.getItem("currentrecipe");

// this function will take the data and display it on the page and all elements created will be editable
// all elements will be in the "output" div
formatRecipeDataEdit(output, obj);

// setup buttons
cancelButton.addEventListener("click", e => {
    window.location.replace("saveditem.html");
})

saveButton.addEventListener("click", e => {
    var contentList = [];

    // loop through "output" divs children
    const outputItems = output.children;
    const outputItemsArr = Array.from(outputItems);
    outputItemsArr.forEach((item) => {
        // all titles are contained within a titlecontainer div
        if (item.tagName === "DIV"){
            // titles need to have ** at the start and end of the string so they can be formatted correctly
            contentList.push("**" + item.textContent.trim() + "**");
        }
        else{
            contentList.push(item.textContent)
        }
    });
    // join
    sessionStorage.setItem("currentrecipe",contentList.join("\r\n"));
    // save edits using the azure function
    fetch(editrecipefunction,{
        headers: {
            "recipeid":sessionStorage.getItem("currentrecipeid"),
            "recipe":JSON.stringify(sessionStorage.getItem("currentrecipe")),
            "userid":sessionStorage.getItem("key")
            }
    })
    .then((response) => response.json()) // Fetch response as json
    .then((data) => {
        sessionStorage.setItem("edited",true);
        window.location.replace("saveditem.html");
    });
})

// functions ----------------------------------------

// modified version of formatRecipeData which will create content that has the editable property set to true
function formatRecipeDataEdit(element, obj){
    obj = decodeURIComponent(obj);
    const dataformat = obj.split(/\r?\n/).filter(function(s){return s})
    for (var x = 0; x < dataformat.length; x++){
        const firstChar = dataformat[x].substring(0,1);
        if (firstChar === "*" || firstChar === "#")
        {
            const titleContainer = document.createElement("div");
            const title = document.createElement("H2");
            title.contentEditable = true;
            title.textContent = dataformat[x].replace(/[+#*\n]|^\d+/g, " ");

            titleContainer.appendChild(title);
            element.appendChild(titleContainer);
        }
        else{
            const text = document.createElement("p");
            text.contentEditable = true;
            text.textContent = dataformat[x].replace(/[+*\n]|^\d+/g, " ");

            element.appendChild(text);
        }
    }
}