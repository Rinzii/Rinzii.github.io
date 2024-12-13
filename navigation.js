$(document).on('click', '.button', function() {
  console.log("Button clicked!"); 
  $(this).toggleClass("on");
  $(".menu").toggleClass("active");
});
