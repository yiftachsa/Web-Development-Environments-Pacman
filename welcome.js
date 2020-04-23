$(document).ready(function () {
    start();
});


var users = [];
//var passwords = [];


function start() {
    $("#sighInButtom").click(function (e) { signInFunction(); });
    $("#loginByttom").click(function (e) { loginFunction(); });
    $("#submit").click(function (e) { submitFunction(); });
    $("#connect").click(function (e) { connectFunction(); });
 //   users = localStorage.getItem('users');
 //   passwords = localStorage.getItem('passwords');
}

    function signInFunction() {
        //switchDevs
        $("#welcome").hide();
        $("#signIn").show();
    }



    function loginFunction() {
        //switchDevs
        $("#welcome").hide();
        $("#login").show();
    }

    function submitFunction() {
        let username = $("#username").val();
        let password = $("#password").val();
        let passwordCnfirm = $("#passwordConfirm").val();
        let fullname = $("#fullName").val();
        let email = $("#email").val();
        let birthday = $("#birthday").val();

        //add check if username already exsit
        if (username == "") {
            alert("Username must be filled out");
            return false;
        }
        if (checkUsernameExist == null)
        {
            alert("Username already exsit");
            return false;
        }
        if (password == "") {
            alert("Password must be filled out");
            return false;
        }

        if (!(password.match("^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d^a-zA-Z0-9].{5,50}$")) || password.length < 6) {
            alert("Password must be contains at least six charcter , one letter and one number");
            return false;
        }

        if (passwordCnfirm != password)
        {
            alert("Passwords does not math");
            return false;
        }

        if (fullname == "") {
            alert("Full name must be filled out");
            return false;
        }

        //maybe full name need to be seprtated to surname and last name
        if (/\d/.test(fullname)) {
            alert("Full name can not contains number");
            return false;
        }

        if (!ValidateEmail(email)) {
            alert("You have entered an invalid email address!")
            return false;
        }

        createUser(username, password);

        //switchDevs
        $("#signIn").hide();
        $("#welcome").show();

    }

    // storing input from sign in
    function createUser(username, password) {
        const user = { username, password };
        users.push(user);  //put it on the end of the array
        let myJSON = JSON.stringify(users);
        localStorage.setItem('users', myJSON);


        /*
        users.push(useusername);  //put it on the end of the array
        passwords.push(password);  //put it on the end of the array
        let myJSON = JSON.stringify(users);
        localStorage.setItem('users', myJSON);
        myJSON = JSON.stringify(passwords);
        localStorage.setItem('passwords', myJSON);
        */

    }

    function getUser(username, password) {
        //loops through each user in the array and checks the stored username and password against the one you're looking for
        return users.find(eachUser => {
            return eachUser.username === username && eachUser.password === password;
        });
    }

    function checkUsernameExist(username) {
        //loops through each user in the array and checks the stored username and password against the one you're looking for
        return users.find(eachUser => {
            return eachUser.username === username;
        });
    }


    function connectFunction() {

        users = localStorage.getItem('users');
        let username = $("#username").val();
        let password = $("#password").val();
        if (!getUser)
        {
            alert("Username or password are incorrect");
            return false;
        }
        //switchDevs
        $("#login").hide();
        $("#defsForm").show();

    }


    //JavaScript code to validate an email id
    function ValidateEmail(email) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return (true)
        }
        return (false)
    }

