import { highlightElements, CheckPopup, popupFade } from "./functions.js";
import { getcollectionsfunction, createcollectionfunction, deletecollectionsfunction} from "./keys.js";

const buttonscontainer = document.getElementById("outputbuttonscontainer");
buttonscontainer.style.display = "none";
const itemscontainer = document.getElementById("itemscontainer");
const deleteButton = document.getElementById("deletebutton");
const confirmDeleteButton = document.getElementById("confirmdelete");

// loading animation
const loader = document.getElementById("loader");
loader.style.display = "block";

var deleteMode = false;
let itemsToBeDeleted = []

// If user had edited a collection name, they will be redirected to this page with the "edited" sessionstorage item
// function will check if this sessionstorage item exists and display a popup
CheckPopup("edited", "Saved Edit");

// setup buttons
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
        img.src = "./graphics/delete-svgrepo-com.svg"

        deleteButton.title = "Delete items";
        confirmDeleteButton.style.display = "none";
    }
})

// delete button logic
confirmDeleteButton.addEventListener("click", e => {
    fetch(deletecollectionsfunction, {
        headers: {
            "collectionids":itemsToBeDeleted
            }
    }).then((response) => response.json())
    .then((data) => {
        console.log(data);
        window.location.reload();
    });
})

var displayForm = false;

// button that displays popupform
const popupFormButton = document.getElementById("popupformbutton");

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
    fetch(createcollectionfunction, {
        headers: {
            "userid":sessionStorage.getItem("key"),
            "collectionname":formValue.trim()
            }
    }).then((response) => response.json())
    .then((data) => {
        if (JSON.stringify(data) === JSON.stringify("Collection already exists")){
            const popup = document.getElementById("popup");
            popupFade(popup, "Already Exists");
        }
        else{
            window.location.reload();
        }
    }
    );
})


// retrive collection items
fetch(getcollectionsfunction, {
    headers: {
        "userid":sessionStorage.getItem("key"),
        "container":"collections"
        }
}).then((response) => response.json())
.then((data) => {
    loader.style.display = "none";
    buttonscontainer.style.display = "block";
    itemscontainer.style.display = "flex";

    // display message if user has not made any collections
    if (data === "No items Exist")
    {
        const messagecontainer = document.createElement("div");
        messagecontainer.classList.add("titlecontainer")

        const message = document.createElement("H2")
        message.classList.add("maintitle");
        message.textContent = "You have not created any collections";
        messagecontainer.appendChild(message);
        itemscontainer.style.border = "none";
        itemscontainer.appendChild(messagecontainer);
    }
    else {
        for (var x = 0; x < data.length; x++){

            // container
            const item = document.createElement("div");
            item.classList.add("collectionitem");

             // element (0) that contains collection title 
            const itemp = document.createElement("p");
            itemp.textContent = data[x].collection;
            item.appendChild(itemp);

            // hidden element (1) that contains collectionid 
            const pid = document.createElement("p");
            pid.textContent = data[x].id;
            pid.style.display = "none";
            item.appendChild(pid);

            item.addEventListener("click", e => {
                if (deleteMode === true){
                    itemsToBeDeleted = highlightElements(e, itemsToBeDeleted, 1);
                    console.log(itemsToBeDeleted);
                }
                else{
                    
                    // if user clicks on div
                    if (e.target.tagName.toLowerCase() === "div"){
                        // element 0 is collectiontitle
                        sessionStorage.setItem("currentcollectionname",e.target.children[0].textContent);
                        // element 1 is collectionid
                        sessionStorage.setItem("currentcollectionid",e.target.children[1].textContent);
                    }
                    // if user clicks on text
                    else{
                        sessionStorage.setItem("currentcollectionname",e.target.parentElement.children[0].textContent);
                        sessionStorage.setItem("currentcollectionid",e.target.parentElement.children[1].textContent);
                    }
                    window.location.replace("saved.html");
                }
            })

            itemscontainer.appendChild(item);
        }
    }
});
