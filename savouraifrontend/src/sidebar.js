class sidebar extends HTMLElement {
    constructor() {
        super();
    };

    connectedCallback() {
        this.innerHTML = `
        <div id="sidebarcontainer">
        <div id="sidebar" class="sidebar">
            <a href="javascript:void(0)" id="closebtn" class="closebtn">&times;</a>
            <a id="mainnav" href="main.html">Generate Recipes</a>
            <a id="savednav" href="saved.html">Saved Recipes</a>
            <a id="collections" href="collections.html">Collections</a>
            <a id="recipeoftheday" href="recipeoftheday.html">Recipe of the Day</a>
            <a id="settingsnav" href="settings.html">Settings</a>
            <a id="logout" href="index.html">Logout</a>
        </div>
        <button id="openbtn" class="openbtn">&#9776;</button>
        </div>
        `;
    }
}

customElements.define('sidebar-component', sidebar);

const openbtn = document.getElementById("openbtn");
const closebtn = document.getElementById("closebtn");
const logoutbtn = document.getElementById("logout");

/* Set the width of the sidebar to 250px and the left margin of the page content to 250px */
function openNav() {
    document.getElementById("sidebar").style.width = "200px";
    document.getElementById("container2").style.marginLeft = "200px";
    openbtn.style.display = "none";
}

/* Set the width of the sidebar to 0 and the left margin of the page content to 0 */
function closeNav() {
    document.getElementById("sidebar").style.width = "0";
    document.getElementById("container2").style.marginLeft = "0";
    openbtn.style.display = "block";
}

openbtn.addEventListener("click", (e)=>{
    openNav();
})

closebtn.addEventListener("click", (e)=>{
    closeNav();
})

logoutbtn.addEventListener("click", (e) =>{
    sessionStorage.setItem("key", null);
})

document.getElementById("savednav").addEventListener("click", e => {
    sessionStorage.setItem("currentcollectionid",null);
    sessionStorage.setItem("currentcollectionname",null);
    sessionStorage.setItem("currentcollectionitemid",null);
})

const page = window.location.href.split("/").pop();

// "active" class will change the sidebar element to green
// display the current page as green on the sidebar
if (page === "main.html"){
    document.getElementById("mainnav").classList.add("active");
}
else if (page === "saved.html"){
    if (sessionStorage.getItem("currentcollectionname") !== "null"){
        document.getElementById("collections").classList.add("active");
    }
    else{
        document.getElementById("savednav").classList.add("active");
    }
}
else if (page === "settings.html"){
    document.getElementById("settingsnav").classList.add("active");
}
else if (page === "collections.html"){
    document.getElementById("collections").classList.add("active");
}
else if (page === "recipeoftheday.html"){
    document.getElementById("recipeoftheday").classList.add("active");
}
