window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.tateti = (function(){
  "use strict";

  var LINEAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  var g, turno, terminado, gana, api, $grid, $turno, nombres, tanteo;

  function ganador(){
    for (var i = 0; i < LINEAS.length; i++){
      var l = LINEAS[i];
      if (g[l[0]] && g[l[0]] === g[l[1]] && g[l[1]] === g[l[2]]) return l;
    }
    return null;
  }

  function jugar(i){
    if (terminado || g[i]) return;
    g[i] = turno + 1;
    var l = ganador();
    if (l){
      gana = l; terminado = true;
      tanteo[turno]++;
      api.guardar("tateti.tanteo", tanteo);
      pintar();
      api.fin("Ganó " + nombres[turno], "Va " + tanteo[0] + " a " + tanteo[1] + ".",
        [{ txt:"Revancha", fn:function(){ arrancar(1 - turno); } }]);
      return;
    }
    if (g.every(Boolean)){
      terminado = true;
      tanteo[2]++;
      api.guardar("tateti.tanteo", tanteo);
      pintar();
      api.fin("Empate", "Van " + tanteo[2] + " empates.",
        [{ txt:"Otra", fn:function(){ arrancar(1 - turno); } }]);
      return;
    }
    turno = 1 - turno;
    pintar();
  }

  function pintar(){
    var html = "";
    for (var i = 0; i < 9; i++){
      var cls = "tt" + (g[i] ? " j" + g[i] : "") + (gana && gana.indexOf(i) >= 0 ? " gana" : "");
      html += '<div class="' + cls + '" data-i="' + i + '">' +
              (g[i] ? (g[i] === 1 ? "✕" : "◯") : "") + "</div>";
    }
    $grid.innerHTML = html;
    $turno.innerHTML = terminado
      ? "&nbsp;"
      : '<span class="pin j' + (turno+1) + '"></span> juega <b>' + nombres[turno] + "</b>" +
        '<em>' + tanteo[0] + " – " + tanteo[1] +
        (tanteo[2] ? " · " + tanteo[2] + " empates" : "") + "</em>";
  }

  function arrancar(empieza){
    g = new Array(9).fill(0);
    turno = empieza || 0;
    terminado = false; gana = null;
    pintar();
  }

  function editarNombres(){
    var a = prompt("Nombre de las cruces", nombres[0]);
    if (a === null) return;
    var b = prompt("Nombre de los círculos", nombres[1]);
    if (b === null) return;
    nombres = [a.trim() || "Cruces", b.trim() || "Círculos"];
    api.guardar("tateti.nombres", nombres);
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api;
      nombres = api.leer("tateti.nombres", ["Cruces", "Círculos"]);
      tanteo  = api.leer("tateti.tanteo", [0, 0, 0]);
      el.innerHTML =
        '<p class="turno" id="turnoTt"></p>' +
        '<div class="tablero gtt" id="gtt"></div>' +
        '<p class="aviso">Empieza el que perdió la anterior.</p>';
      $grid = document.getElementById("gtt");
      $turno = document.getElementById("turnoTt");
      $grid.addEventListener("click", function(e){
        var c = e.target.closest(".tt");
        if (c) jugar(+c.dataset.i);
      });
      api.accion("Nombres", editarNombres);
      api.accion("Reiniciar", function(){
        tanteo = [0, 0, 0];
        api.guardar("tateti.tanteo", tanteo);
        arrancar(0);
      });
      arrancar(0);
    },
    desmontar: function(){}
  };
})();
