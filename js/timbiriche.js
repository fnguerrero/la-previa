window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.timbiriche = (function(){
  "use strict";

  var N = 5;              // cajas por lado (N+1 puntos)
  var PASO = 100 / N;     // el SVG va de 0 a 100 más un margen
  var h, v, cajas, turno, puntos, api, $svg, $turno, nombres, ultima;

  function arrancar(){
    h = []; v = []; cajas = [];
    var f, c;
    for (f = 0; f <= N; f++){ h.push(new Array(N).fill(false)); }
    for (f = 0; f < N; f++){ v.push(new Array(N+1).fill(false)); }
    for (f = 0; f < N; f++){ cajas.push(new Array(N).fill(0)); }
    turno = 0; puntos = [0, 0]; ultima = null;
    pintar();
  }

  function cerrada(f, c){
    return h[f][c] && h[f+1][c] && v[f][c] && v[f][c+1];
  }

  function trazar(tipo, f, c){
    var linea = tipo === "h" ? h : v;
    if (linea[f][c]) return;
    linea[f][c] = true;
    ultima = tipo + f + "_" + c;

    // ¿cerró alguna caja? el que cierra vuelve a jugar
    var gano = false;
    var vecinas = tipo === "h" ? [[f-1, c], [f, c]] : [[f, c-1], [f, c]];
    vecinas.forEach(function(p){
      var ff = p[0], cc = p[1];
      if (ff < 0 || ff >= N || cc < 0 || cc >= N) return;
      if (!cajas[ff][cc] && cerrada(ff, cc)){
        cajas[ff][cc] = turno + 1;
        puntos[turno]++;
        gano = true;
      }
    });

    if (!gano) turno = 1 - turno;
    pintar();

    if (puntos[0] + puntos[1] === N*N) terminar();
  }

  function terminar(){
    var quien = puntos[0] === puntos[1] ? null : (puntos[0] > puntos[1] ? 0 : 1);
    api.fin(quien === null ? "Empate" : "Ganó " + nombres[quien],
      puntos[0] + " cajas contra " + puntos[1] + ".",
      [{ txt:"Otra vez", fn:arrancar }]);
  }

  function pintar(){
    var s = "", f, c, x, y;

    // cajas ganadas
    for (f = 0; f < N; f++){
      for (c = 0; c < N; c++){
        if (cajas[f][c]){
          s += '<rect class="cj j' + cajas[f][c] + '" x="' + (c*PASO) + '" y="' + (f*PASO) +
               '" width="' + PASO + '" height="' + PASO + '" rx="2"/>';
        }
      }
    }
    // líneas horizontales
    for (f = 0; f <= N; f++){
      for (c = 0; c < N; c++){
        x = c*PASO; y = f*PASO;
        var idh = "h" + f + "_" + c;
        s += '<line class="ln' + (h[f][c] ? " puesta" : "") + (ultima === idh ? " nueva" : "") +
             '" x1="' + x + '" y1="' + y + '" x2="' + (x+PASO) + '" y2="' + y + '"/>' +
             '<line class="hit" data-t="h" data-f="' + f + '" data-c="' + c +
             '" x1="' + x + '" y1="' + y + '" x2="' + (x+PASO) + '" y2="' + y + '"/>';
      }
    }
    // líneas verticales
    for (f = 0; f < N; f++){
      for (c = 0; c <= N; c++){
        x = c*PASO; y = f*PASO;
        var idv = "v" + f + "_" + c;
        s += '<line class="ln' + (v[f][c] ? " puesta" : "") + (ultima === idv ? " nueva" : "") +
             '" x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y+PASO) + '"/>' +
             '<line class="hit" data-t="v" data-f="' + f + '" data-c="' + c +
             '" x1="' + x + '" y1="' + y + '" x2="' + x + '" y2="' + (y+PASO) + '"/>';
      }
    }
    // puntos
    for (f = 0; f <= N; f++){
      for (c = 0; c <= N; c++){
        s += '<circle class="pt" cx="' + (c*PASO) + '" cy="' + (f*PASO) + '" r="1.9"/>';
      }
    }
    $svg.innerHTML = s;

    $turno.innerHTML =
      '<span class="pin j' + (turno+1) + '"></span> juega <b>' + nombres[turno] + "</b>" +
      '<em>' + puntos[0] + " – " + puntos[1] + "</em>";
  }

  function editarNombres(){
    var a = prompt("Nombre del primero", nombres[0]);
    if (a === null) return;
    var b = prompt("Nombre del segundo", nombres[1]);
    if (b === null) return;
    nombres = [a.trim() || "Uno", b.trim() || "Dos"];
    api.guardar("timbiriche.nombres", nombres);
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api;
      nombres = api.leer("timbiriche.nombres", ["Uno", "Dos"]);
      el.innerHTML =
        '<p class="turno" id="turnoTb"></p>' +
        '<svg class="tablero gtb" id="gtb" viewBox="-6 -6 112 112"></svg>' +
        '<p class="aviso">Tocá entre dos puntos para trazar. El que cierra una caja vuelve a jugar.</p>';
      $svg = document.getElementById("gtb");
      $turno = document.getElementById("turnoTb");
      $svg.addEventListener("click", function(e){
        var l = e.target.closest(".hit");
        if (l) trazar(l.dataset.t, +l.dataset.f, +l.dataset.c);
      });
      api.accion("Nombres", editarNombres);
      api.accion("Reiniciar", arrancar);
      arrancar();
    },
    desmontar: function(){}
  };
})();
