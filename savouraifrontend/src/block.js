// script will block access to page unless user is logged in
if (sessionStorage.getItem("key") === "null"){
    window.location.replace("error.html");
}