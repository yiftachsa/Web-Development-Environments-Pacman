/**
 * from: https://www.w3schools.com/howto/howto_css_modals.asp
 */ 
$(document).ready(function () {
    start();
});


function start() {

    var modal = document.getElementById("aboutModal");

    // Get the button that opens the modal
    var btn = document.getElementById("aboutMenuButton");

    // Get the <span> element that closes the modal
    var span = document.getElementById("spanId");

    // When the user clicks on the button, open the modal
    btn.onclick = function () {
        modal.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }



    /*
    let modal = $("#aboutModal");
    let button = $("#aboutMenuButton");
    let span = $("#spanId");

    button.click(function () { modal.style.display = "block"; });
    span.click(function () { modal.style.display = "none"; });
    $(window).click(function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
    */
    
}