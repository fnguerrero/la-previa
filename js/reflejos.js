window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.reflejos = (function(){
  "use strict";

  var META = 3;
  var estado, reloj, desde, puntos, api, $zona, $centro, nombres;

  function texto(){
    if (estado === "listo")     return "Tocá tu lado cuando se ponga verde";
    if (estado === "esperando") return "Ahora no…";
    if (estado === "ya")        return "¡YA!";
    return "";
  }

  function pintar(){
    $zona.className = "duelo " + estado;
    $centro.innerHTML =
      '<span class="tanteo">' + puntos[0] + " – " + puntos[1] + "</span>" +
      "<span class=\"msg\">" + texto() + "</span>";
    document.querySelectorAll(".mitad .nom").forEach(function(el, i){
      el.textContent = nombres[i] + "  ·  " + puntos[i];
    });
  }

  function armar(){
    estado = "esperando";
    pintar();
    clearTimeout(reloj);
    reloj = setTimeout(function(){
      estado = "ya";
      desde = performance.now();
      pintar();
    }, 1400 + Math.random()*4000);
  }

  function tocar(quien){
    if (estado === "ya"){
      var ms = Math.round(performance.now() - desde);
      puntos[quien]++;
      estado = "listo";
      clearTimeout(reloj);
      if (puntos[quien] >= META) return ganar(quien, ms);
      pintar();
      $centro.querySelector(".msg").textContent =
        nombres[quien] + " en " + ms + " ms. Tocá para seguir.";
      return;
    }
    if (estado === "esperando"){
      clearTimeout(reloj);
      var otro = 1 - quien;
      puntos[otro]++;
      estado = "listo";
      if (puntos[otro] >= META) return ganar(otro, null);
      pintar();
      $centro.querySelector(".msg").textContent =
        nombres[quien] + " se adelantó. Punto para " + nombres[otro] + ".";
      return;
    }
    armar();   // estaba en reposo: arranca la ronda
  }

  function ganar(quien, ms){
    estado = "listo";
    pintar();
    api.fin("Ganó " + nombres[quien],
      ms ? "Cerró con " + ms + " ms de reacción." : "Se llevó la última por adelantada.",
      [{ txt:"Revancha", fn:arrancar }]);
  }

  function arrancar(){
    clearTimeout(reloj);
    puntos = [0, 0];
    estado = "listo";
    pintar();
  }

  function editarNombres(){
    var a = prompt("Nombre de abajo", nombres[0]);
    if (a === null) return;
    var b = prompt("Nombre de arriba", nombres[1]);
    if (b === null) return;
    nombres = [a.trim() || "Abajo", b.trim() || "Arriba"];
    api.guardar("reflejos.nombres", nombres);
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api;
      nombres = api.leer("reflejos.nombres", ["Abajo", "Arriba"]);
      el.innerHTML =
        '<div class="duelo" id="duelo">' +
          '<button class="mitad arriba" data-q="1"><span class="nom"></span></button>' +
          '<div class="centro" id="centroRf"></div>' +
          '<button class="mitad abajo" data-q="0"><span class="nom"></span></button>' +
        "</div>" +
        '<p class="aviso">Uno de cada lado del teléfono. Gana el primero que llega a ' + META + '.</p>';
      $zona = document.getElementById("duelo");
      $centro = document.getElementById("centroRf");
      $zona.addEventListener("pointerdown", function(e){
        var m = e.target.closest(".mitad");
        if (m) { e.preventDefault(); tocar(+m.dataset.q); }
      });
      api.accion("Nombres", editarNombres);
      api.accion("Reiniciar", arrancar);
      arrancar();
    },
    desmontar: function(){ clearTimeout(reloj); }
  };
})();
