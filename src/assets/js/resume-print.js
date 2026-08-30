/**
 * The only JavaScript on the site, and it is optional.
 *
 * The résumé toolbar always carries a "Download PDF" link, which is a plain
 * anchor and needs no scripting. This adds a "Print" button beside it — but
 * only once we know printing is available, so no reader is ever offered a
 * control that does nothing.
 */
(function () {
  var toolbar = document.querySelector(".resume-toolbar");
  if (!toolbar || typeof window.print !== "function") return;

  var button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-secondary";
  button.textContent = "Print";
  button.addEventListener("click", function () {
    window.print();
  });
  toolbar.appendChild(button);
})();
