(function(){
  var K="mu-list";
  function load(){try{return JSON.parse(localStorage.getItem(K)||"[]")}catch(e){return []}}
  function save(a){try{localStorage.setItem(K,JSON.stringify(a));return true}catch(e){return false}}
  function today(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
  function nextDate(it){var d=new Date(it.date+"T00:00:00"),t=today();if(it.rep){while(d<t)d.setFullYear(d.getFullYear()+1)}return d}
  function days(it){return Math.round((nextDate(it)-today())/864e5)}
  function iso(d){return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
  function fmt(d){return d.getDate()+"."+(d.getMonth()+1)+"."+d.getFullYear()}
  function badge(){var c=document.getElementById("cnt"),n=load().length;if(c&&n){c.textContent=n;c.hidden=false}}
  badge();
  // Lisää listalle aihesivulla
  var b=document.getElementById("mlist");
  if(b){b.onclick=function(){
    var f=document.getElementById("mf"),T=JSON.parse(f.getAttribute("data-t")),d=document.getElementById("mdate"),o=document.getElementById("out");
    if(!d.value){o.textContent="Valitse ensin päivämäärä.";d.focus();return}
    var a=load();a.push({id:Date.now(),slug:T.slug,title:document.getElementById("mtitle").value||T.nimi,date:d.value,rep:document.getElementById("mrep").checked,off:T.off});
    if(save(a)){badge();o.innerHTML='Lisätty omalle listalle. <a href="/oma/">Näytä lista</a>'}else{o.textContent="Tallennus ei onnistunut tässä selaimessa."}
  }}
  // Oma lista -sivu
  var ol=document.getElementById("ol"); if(!ol) return;
  function icsAll(a){
    var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Muistutin//FI","CALSCALE:GREGORIAN"];
    a.forEach(function(it){var d=nextDate(it),e=new Date(d.getTime()+864e5);
      var t=it.title.replace(/[,;\n]/g," ");
      L.push("BEGIN:VEVENT","UID:"+it.id+"@muistutin","DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z","DTSTART;VALUE=DATE:"+iso(d).replace(/-/g,""),"DTEND;VALUE=DATE:"+iso(e).replace(/-/g,""),"SUMMARY:"+t);
      if(it.rep)L.push("RRULE:FREQ=YEARLY");
      (it.off||[14,3]).forEach(function(o){L.push("BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+t,"TRIGGER:-P"+o+"D","END:VALARM")});
      L.push("END:VEVENT")});
    L.push("END:VCALENDAR");return L.join("\r\n");
  }
  function draw(){
    var a=load().sort(function(x,y){return nextDate(x)-nextDate(y)});
    var all=document.getElementById("oall");
    if(!a.length){ol.innerHTML='<div class="box"><b>Lista on tyhjä.</b><p class="mut">Valitse alta asia ja lisää sille päivämäärä.</p></div>';all.hidden=true;return}
    all.hidden=false;
    ol.innerHTML=a.map(function(it){var n=days(it),cls=n<0?"late":n<=14?"soon":"";
      var txt=n<0?"Myöhässä "+(-n)+" pv":n===0?"Tänään":n===1?"Huomenna":n+" pv";
      return '<div class="item '+cls+'"><div><b>'+it.title.replace(/</g,"&lt;")+'</b><div class="mut">'+fmt(nextDate(it))+(it.rep?" · toistuu vuosittain":"")+'</div></div><div class="left">'+txt+'</div><button class="s x" data-id="'+it.id+'" aria-label="Poista">Poista</button></div>'}).join("");
    ol.querySelectorAll(".x").forEach(function(x){x.onclick=function(){save(load().filter(function(i){return String(i.id)!==x.getAttribute("data-id")}));badge();draw()}});
  }
  draw();
  document.getElementById("oall").onclick=function(){
    var bl=new Blob([icsAll(load())],{type:"text/calendar"}),a=document.createElement("a");
    a.href=URL.createObjectURL(bl);a.download="muistutukset.ics";document.body.appendChild(a);a.click();a.remove();
    document.getElementById("oout").textContent="Tiedosto ladattu. Avaa se, niin kaikki muistutukset tallentuvat kalenteriisi.";
  };
})();
