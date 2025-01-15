import { highlightElements, CheckPopup, popupFade } from "./functions.js";
import { getitemsfunction, getcollectionitemsfunction, deletecollectionitemsfunction, deleterecipesfunction, editcollectionsfunction } from "./keys.js";
 
const itemscontainer = document.getElementById("itemscontainer");
const deleteButton = document.getElementById("deletebutton");
const confirmDeleteButton = document.getElementById("confirmdelete");
const buttonsContainer = document.getElementById("itembuttonscontainer");

var isCollection = false;

if (sessionStorage.getItem("currentcollectionname") !== "null"){
    isCollection = true;
    // if collection the img should be a minus button instead of delete button
    document.getElementById("deleteimg").src = "./graphics/remove-square-svgrepo-com.svg";
}

// if a saveditem has just been deleted or removed the page is redirected to saved.html and the sessionstorage item is set
// displays appropriate popup message
CheckPopup("deleted", "Deleted Recipe");
CheckPopup("Removed", "Removed Recipe");

// deletemode will be enabled when the deleteButton is clicked
let deleteMode = false;

let itemsToBeDeleted = [];

deleteButton.addEventListener("click", e => {
    const img = document.getElementById("deleteimg");
    if (deleteMode === false){
        deleteMode = true; 
        // change img to close img when delete mode has been enabled
        img.src = "./graphics/close-square-svgrepo-com.svg"
        deleteButton.title = "Cancel";
        confirmDeleteButton.style.display = "";
    }
    else{
        // selecteditem class makes the element blue, this will remove it once delete mode is disabled 
        Array.from(document.querySelectorAll('.selecteditem')).forEach(
            (el) => el.classList.remove('selecteditem')
        );
        itemsToBeDeleted = [];
        deleteMode = false;
        // change image to delete img when delete mode has been disabled
        if (isCollection){
            img.src = "./graphics/remove-square-svgrepo-com.svg"
        }
        else{
            img.src = "./graphics/delete-svgrepo-com.svg"
        }

        deleteButton.title = "Delete items";
        confirmDeleteButton.style.display = "none";
    }
})

// delete button logic
if (!isCollection){
    confirmDeleteButton.addEventListener("click", e => {
        fetch(deleterecipesfunction, {
            headers: {
                "recipeids":itemsToBeDeleted
                }
        }).then((response) => response.json())
        .then((data) => {
            window.location.reload();
        });
    })
}
else{
    confirmDeleteButton.addEventListener("click", e => {
        fetch(deletecollectionitemsfunction, {
            headers: {
                "collectionitemids":itemsToBeDeleted
                }
        }).then((response) => response.json())
        .then((data) => {
            window.location.reload();
        });
    })
}


// main logic:

// no collection
if (!isCollection)
    {
        fetch(getitemsfunction, {
            headers: {
                "userid":sessionStorage.getItem("key"),
                "container":"recipes"
                }
        }).then((response) => response.json())
        .then((data) => {
            stopLoadingAnimation(false);

            displayData(data,false);
        });
}
// collection
else{
    const returnButton = document.getElementById("returnbutton")
    const addToCollectionsButton = document.getElementById("addtocollectionsbutton");
    const popupFormButton = document.getElementById("popupformbutton");

    addToCollectionsButton.addEventListener("click", e => {
        window.location.replace("addtocollection.html");
    })

    returnButton.addEventListener("click", e => {
        window.location.replace("collections.html");
        // sessionstorage items used to know what collection was selected
        sessionStorage.setItem("currentcollectionid",null);
        sessionStorage.setItem("currentcollectionname",null);
    })

    var displayForm = false;
    
    popupFormButton.addEventListener("click", e => {
        const popupForm = document.getElementById("popupform")
        const img = document.getElementById("img");
        if (displayForm === false){
            // change img to be close img
            img.src = "./graphics/close-square-svgrepo-com.svg"
            popupForm.style.display = "block";
            displayForm = true;
        }
        else{
            // change img to be new img
            img.src = "./graphics/new-svgrepo-com.svg"
            popupForm.style.display = "none";
            displayForm = false;
        }
    })

    // submit button for form
    const popupFormSubmitButton = document.getElementById("popupformsubmit");

    popupFormSubmitButton.addEventListener("click", e => {
        e.preventDefault();

        // get collection name
        const formValue = document.getElementById("popupformtext").value;
        fetch(editcollectionsfunction, {
            headers: {
                "collectionid":sessionStorage.getItem("currentcollectionid"),
                "userid":sessionStorage.getItem("key"),
                "collectionname":formValue.trim()
                }
        }).then((response) => response.json())
        .then((data) => {
            if (JSON.stringify(data) === JSON.stringify("Collection Name already exists")){
                const popup = document.getElementById("popup");
                popupFade(popup, "Already Exists");
            }
            else{
                sessionStorage.setItem("edited", true);
                window.location.replace("collections.html");
            }
        }
        );
    })

    fetch(getcollectionitemsfunction, {
        headers: {
            "collectionid":sessionStorage.getItem("currentcollectionid")
            }
    }).then((response) => response.json())
    .then((data) => {
        stopLoadingAnimation(true);

        document.getElementById("maintitle").textContent = sessionStorage.getItem("currentcollectionname");
        displayData(data,true)
    })
}

// functions ------------------------------------------------------------------------------------------------

function displayData(data, collection){
    if (data === "No items Exist"){
        hideButtons();

        // Show user appropriate message if no items are available
        const messagecontainer = document.createElement("div");
        messagecontainer.classList.add("titlecontainer")

        const message = document.createElement("H2")
        message.classList.add("maintitle");
        if (collection){
            message.textContent = "This collection has no items";
        }
        else{
            message.textContent = "You have not saved any recipes";
        }
        
        messagecontainer.appendChild(message);
        itemscontainer.style.border = "none";
        itemscontainer.appendChild(messagecontainer);
    }
    else {
        if (collection){
            // if a collection is selected the getcollectionitems function is used which returns two json objects
            // collectionitemdata & collectionitemids
            for (var x = 0; x < data.collectionitemdata.length; x++){
                createElements(data.collectionitemdata[x], data.collectionitemids[x].id);
            }
        }
        else{
            for (var x = 0; x < data.length; x++){
                createElements(data[x], null);
            }
        }
    }
}

function createElements(itemdata, collectionitemid){
    let result;
    let id;

    // is the textcontent of the recipe
    result = JSON.parse(decodeURIComponent(itemdata.recipe).replace(/\n/g,'\\n'));
    // recipeid
    id = itemdata.id;

    // retrive title (first part of result)
    const title = (result.slice(0,result.indexOf("\n"))).replace(/[+#*\n]|^\d+/g, " ").trim();

    // container for the recipe
    const item = document.createElement("div");
    item.classList.add("saveditem");

    // title element (0)
    const itemp = document.createElement("p");
    itemp.textContent = title;
    item.appendChild(itemp);

    // hidden element (1) which contains the result as its textcontent
    // Used to store the recipe text to be used when the recipe is clicked
    const p = document.createElement("p");
    p.textContent = result;
    p.style.display = "none";
    item.appendChild(p);

    // hidden element (2) which contains the result as its textcontent
    // Used to store the recipe id to be used when the recipe is clicked
    const pid = document.createElement("p");
    pid.textContent = id;
    pid.style.display = "none";
    item.appendChild(pid);

    // hidden element (3) which contains the result as its textcontent
    // Used to store the collectionitemid to be used when the recipe is clicked
    const pcollectionitemid = document.createElement("p");
    pcollectionitemid.textContent = collectionitemid;
    pcollectionitemid.style.display = "none";
    item.appendChild(pcollectionitemid);

    item.addEventListener("click", e => {
        if (deleteMode === true){
            // if collection then the id needed is from hidden element 3
            if (isCollection){
                itemsToBeDeleted = highlightElements(e, itemsToBeDeleted, 3);
            }
            // if not the id needed is from hidden element 2
            else{
                itemsToBeDeleted = highlightElements(e, itemsToBeDeleted, 2);
            }
        }
        else{
            // container is clicked
            if (e.target.tagName.toLowerCase() === "div"){
                sessionStorage.setItem("currentrecipe",e.target.children[1].textContent);
                sessionStorage.setItem("currentrecipeid",e.target.children[2].textContent)
                if (collectionitemid != null){
                    sessionStorage.setItem("currentcollectionitemid",e.target.children[3].textContent)
                }
            }
            // recipe title is clicked
            else{
                sessionStorage.setItem("currentrecipe",e.target.parentElement.children[1].textContent);
                sessionStorage.setItem("currentrecipeid", e.target.parentElement.children[2].textContent);
                if (collectionitemid != null){
                    sessionStorage.setItem("currentcollectionitemid",e.target.parentElement.children[3].textContent)
                }
            }
            // redirect
            window.location.replace("saveditem.html");
        }
        
    })

    itemscontainer.appendChild(item);
}

function stopLoadingAnimation(collection){
    const loader = document.getElementById("loader");
    const returnButton = document.getElementById("returnbuttoncontainer");
    const addToCollectionsButton = document.getElementById("addtocollectionsbutton");
    // will hide loader and display content
    // used when data from azure function has been recieved
    loader.style.display = "none";
    itemscontainer.style.display = "flex";
    buttonsContainer.style.display = "block";

    if (collection){
        returnButton.style.display = "block";
        addToCollectionsButton.style.display = "inline";
    }
}

function hideButtons(){
    deleteButton.style.display = "none";
}

