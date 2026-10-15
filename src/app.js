(function(){
  var f=document.getElementById("mf"); if(!f) return;
  var T=JSON.parse(f.getAttribute("data-t"));
  var d=document.getElementById("mdate"), rep=document.getElementById("mrep"), out=document.getElementById("out");
  var tomorrow=new Date(Date.now()+864e5).toISOString().slice(0,10); d.min=tomorrow;
  function pad(n){return (n<10?"0":"")+n}
  function ymd(s){return s.replace(/-/g,"")}
  function ics(){
    var date=d.value; if(!date){out.textContent="Valitse ensin päivämäärä.";d.focus();return null}
    var title=document.getElementById("mtitle").value||T.nimi;
    var uid=Date.now()+"@muistutin";
    var dt=new Date(date+"T00:00:00"); var nx=new Date(dt.getTime()+864e5);
    var e=nx.getFullYear()+pad(nx.getMonth()+1)+pad(nx.getDate());
    var L=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Muistutin//FI","CALSCALE:GREGORIAN","BEGIN:VEVENT","UID:"+uid,"DTSTAMP:"+new Date().toISOString().replace(/[-:]/g,"").slice(0,15)+"Z","DTSTART;VALUE=DATE:"+ymd(date),"DTEND;VALUE=DATE:"+e,"SUMMARY:"+title.replace(/[,;\n]/g," ")];
    if(rep.checked) L.push("RRULE:FREQ=YEARLY");
    L.push("DESCRIPTION:Muistutin: "+T.nimi+". Tarkista ajankohta ja hoida asia.");
    T.off.forEach(function(o){L.push("BEGIN:VALARM","ACTION:DISPLAY","DESCRIPTION:"+title.replace(/[,;\n]/g," ")+" ("+o+" pv)","TRIGGER:-P"+o+"D","END:VALARM")});
    L.push("END:VEVENT","END:VCALENDAR");
    return {text:L.join("\r\n"),date:date,title:title};
  }
  document.getElementById("mics").onclick=function(){
    var r=ics(); if(!r) return;
    var b=new Blob([r.text],{type:"text/calendar"}); var a=document.createElement("a");
    a.href=URL.createObjectURL(b); a.download="muistutus-"+T.slug+".ics"; document.body.appendChild(a); a.click(); a.remove();
    out.textContent="Tiedosto ladattu. Avaa se, niin muistutus tallentuu kalenteriisi.";
  };
  document.getElementById("mgc").onclick=function(){
    var r=ics(); if(!r) return;
    var e=new Date(r.date+"T00:00:00"); var n=new Date(e.getTime()+864e5);
    var s=ymd(r.date), en=n.getFullYear()+pad(n.getMonth()+1)+pad(n.getDate());
    var u="https://calendar.google.com/calendar/render?action=TEMPLATE&text="+encodeURIComponent(r.title)+"&dates="+s+"/"+en+"&details="+encodeURIComponent("Muistutin: "+T.nimi)+(rep.checked?"&recur=RRULE:FREQ%3DYEARLY":"");
    window.open(u,"_blank","noopener");
    out.textContent="Google Kalenteri avautuu. Lisää muistutukset kalenteritapahtumaan itse.";
  };
  var q=document.getElementById("hae"); if(q){}
})();
