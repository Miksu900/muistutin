(function(){
  var q=document.getElementById("hae"); if(!q) return;
  var c=document.querySelectorAll("[data-n]");
  q.addEventListener("input",function(){
    var v=q.value.toLowerCase().trim();
    c.forEach(function(e){e.hidden=v&&e.getAttribute("data-n").toLowerCase().indexOf(v)<0});
  });
})();
