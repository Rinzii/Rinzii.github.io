function expand(){
  $(this).toggleClass("on");
  $(".menu").toggleClass("active");
};
$(".button").on('click', expand);