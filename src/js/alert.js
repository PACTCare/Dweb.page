import { Cookie } from "./services/Cookie";

/**
 *
 * @param {string} title
 * @param {string} msg
 * @param {string} $true
 * @param {string} $false
 * @param {string} $link
 */
function Confirm(title, msg, $true, $false, $link) {
  var $content =
    "<div class='dialog-ovelay'>" +
    "<div class='dialog'><header>" +
    " <h2> " +
    title +
    " </h2> " +
    "<i class='fa fa-close'></i>" +
    "</header>" +
    "<div class='dialog-msg'>" +
    " <p> " +
    msg +
    " </p> " +
    "</div>" +
    "<footer>" +
    "<div class='controls'>" +
    " <button class='button button-danger doAction'>" +
    $true +
    "</button> " +
    " <button class='button button-default cancelAction'>" +
    $false +
    "</button> " +
    "</div>" +
    "</footer>" +
    "</div>" +
    "</div>";
  $("body").prepend($content);
  $(".doAction").click(function() {
    new Cookie().setCookie("AgreeToTerms", "alreadyAgreed", 365);
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(500, function() {
        $(this).remove();
      });
  });
  $(".cancelAction, .fa-close").click(function() {
    window.open($link, "_self"); /*new*/
    $(this)
      .parents(".dialog-ovelay")
      .fadeOut(500, function() {
        $(this).remove();
      });
  });
}

document.addEventListener("DOMContentLoaded", function() {
  const x = new Cookie().getCookie("AgreeToTerms");
  if (x !== "alreadyAgreed") {
    Confirm(
      "Welcome",
      "PACT is a confidential and free end-to-end encrypted file sharing service. <br> To continue, please agree to our <a href='https://pact.online/aboutv2.html?par=terms' target='_blank'>Terms of Service</a> and <a href='https://pact.online/aboutv2.html?par=privacy' target='_blank'>Privacy as well as Cookie Policy</a>.",
      "I agree",
      "Leave",
      "https://www.google.com"
    ); /*change*/
  }
});
