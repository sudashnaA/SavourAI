// Title 
document.getElementById("maintitle").textContent = `Add to: ${sessionStorage.getItem("currentcollectionname")}`;

import { highlightElements } from "./functions.js";
import { getitemsfunction, getcollectionitemsfunction, addcollectionitemfunction } from "./keys.js";

let selectedItems = [];

const itemscontainer = document.getElementById("itemscontainer")
const loader = document.getElementById("loader");
loader.style.display = "block";

// Setup button functionality 

document.getElementById("returnbutton").addEventListener("click", e => {
    window.location.replace("saved.html");
})

// addbutton will add all selecteditems to collection
const addbutton = document.getElementById("addbutton");
addbutton.addEventListener("click", e =>{
    fetch(addcollectionitemfunction, {
        headers: {
            "userid":sessionStorage.getItem("key"),
            "collectionid":sessionStorage.getItem("currentcollectionid"),
            "recipeids":selectedItems
            }
    }).then((response) => response.json())
    .then((data) => {
       console.log(data);  
       window.location.replace("saved.html");
    });
})

// Get collection items from the azure function these are the items that are ALREADY in the collection

fetch(getcollectionitemsfunction, {
    headers: {
        "collectionid":sessionStorage.getItem("currentcollectionid")
        }
}).then((response) => response.json())
.then((data) => {
    let existingItems = [];
    if (data !== "No items Exist"){
        for (var x = 0; x < data.collectionitemdata.length; x++){
            // push collectionitem ids to existingitems array
            existingItems.push(String((data.collectionitemdata[x].id)));
        }
    }

    fetch(getitemsfunction, {
        headers: {
            "userid":sessionStorage.getItem("key"),
            "container":"recipes"
            }
    }).then((response) => response.json())
    .then((data) => {
        loader.style.display = "none";
        itemscontainer.style.display = "flex";
        displayDataAdd(data, existingItems);
    });
});

function displayStatusMessage(text){
    const message = document.createElement("H2")
    message.classList.add("maintitle");
    message.textContent = text;
    itemscontainer.style.border = "none";
    itemscontainer.appendChild(message);
}

function displayDataAdd(data, existingItems){
    if (data === "No items Exist"){
        displayStatusMessage("You have not saved any recipes");
    }
    else if (existingItems.length === data.length){
        displayStatusMessage("No items to add");
    }
    else {
        for (var x = 0; x < data.length; x++){
            // contains recipe text
            const result = JSON.parse(decodeURIComponent(data[x].recipe).replace(/\n/g,'\\n'));
            // recipeid
            const id = data[x].id;

            // display only if not already in the collection
            if (!(existingItems.includes(id))){
    
                const title = (result.slice(0,result.indexOf("\n"))).replace(/[+#*\n]|^\d+/g, " ").trim();
                
                // container for element
                const item = document.createElement("div");

                // title
                item.classList.add("saveditem");
                const itemp = document.createElement("p");
                itemp.textContent = title;
                item.appendChild(itemp);
                
                // hidden element which contains collectionitemid
                const pid = document.createElement("p");
                pid.textContent = id;
                pid.style.display = "none";
                item.appendChild(pid);
    
                item.addEventListener("click", e => {
                    selectedItems = highlightElements(e, selectedItems, 1);

                    
                    const addbuttoncontainer = document.getElementById("addbuttoncontainer")
                    
                    // if 1 or more items are selected display addbutton
                    if (selectedItems.length >= 1){
                    addbuttoncontainer.style.display = "block";
                    }
                    else{
                    addbuttoncontainer.style.display = "none";
                    }
                })
    
                itemscontainer.appendChild(item);
            }
        }
    }
}

