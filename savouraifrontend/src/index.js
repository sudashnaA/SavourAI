const form = document.querySelector('#form')
const username = document.querySelector('#username');
const password = document.querySelector('#password');

import { createaccountfunction } from "./keys.js";
import { popupFade } from "./functions.js";

// signup form submit
form.addEventListener('submit',(e)=>{
    if(!validateInputs()){
        e.preventDefault();
    }
    else{ 
        fetch(createaccountfunction,{
            headers: {
                "username":username.value.trim(),
                "password":btoa(password.value.trim()),
              }
        })
        .then((response) => response.text()) // Fetch response as plain text
        .then((data) => {
            console.log(data);
            if (data.slice(0,4) === 'User'){
                setError("Username already exists");
            }
            else{
                // userid
                let key = data.slice(0,data.indexOf("?"));
                sessionStorage.setItem("key", key);
                sessionStorage.setItem("username", username.value.trim());
                setSuccess();
                // redirect to main page after 1s
                setTimeout(() => {
                    window.location.replace("main.html");
                }, 1000);
            }
        })
    }
})

function validateInputs(){
    const usernameVal = username.value.trim()
    const passwordVal = password.value.trim();
    let success = true;

    if(usernameVal===''){
        success=false;
        setError('Username is required');
    }

    if(passwordVal === ''){
        success= false;
        setError('Password is required');
    }
    else if(passwordVal.length < 8){
        success = false;
        setError('Password must be atleast 8 characters');
    }

    return success;
}

function setError(message){
    const errormsg = document.getElementById('errormsg');
    errormsg.classList.add('error');
    errormsg.textContent = message;
}

function setSuccess(){
    const errormsg = document.getElementById('errormsg');
    errormsg.textContent = '';
    errormsg.classList.remove('error');
    const popup = document.getElementById("popup");
    popupFade(popup, "Success, Redirecting...");
}