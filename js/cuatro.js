window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.cuatro = (function(){
  "use strict";

  var C = 7, F = 6;
  var g, turno, terminado, ganadoras, api, $grid, $turno, nombres, tanteo;

  function idx(f, c){ return f*C + c; }

  function libre(c){
    for (var f = F-1; f >= 0; f--) if (!g[idx(f,c)]) return f;
    return -1;
  }

  // devuelve las cuatro casillas si hay línea desde (f,c)
  function linea(f, c){
    var quien = g[idx(f,c)];
    var dirs = [[0,1],[1,0],[1,1],[1,-1]];
    for (var d = 0; d < dirs.length; d++){
      var celdas = [idx(f,c)];
      for (var s = -1; s <= 1; s += 2){
        var ff = f + dirs[d][0]*s, cc = c + dirs[d][1]*s;
        while (ff >= 0 && ff < F && cc >= 0 && cc < C && g[idx(ff,cc)] === quien){
          celdas.push(idx(ff,cc));
          ff += dirs[d][0]*s; cc += dirs[d][1]*s;
        }
      }
      if (celdas.length >= 4) return celdas;
    }
    return null;
  }

  function tirar(c){
    if (terminado) return;
    var f = libre(c);
    if (f < 0) return;
    g[idx(f,c)] = turno + 1;

    var l = linea(f, c);
    if (l){
      ganadoras = l;
      terminado = true;
      tanteo[turno]++;
      api.guardar("cuatro.tanteo", tanteo);
      pintar();
      api.fin("Ganó " + nombres[turno],
        "Va " + tanteo[0] + " a " + tanteo[1] + ".",
        [{ txt:"Revancha", fn:function(){ arrancar(1 - turno); } }]);
      return;
    }
    if (g.every(Boolean)){
      terminado = true;
      pintar();
      api.fin("Empate", "No entra una más.", [{ txt:"Otra", fn:function(){ arrancar(0); } }]);
      return;
    }
    turno = 1 - turno;
    pintar();
  }

  function pintar(){
    var html = "";
    for (var f = 0; f < F; f++){
      for (var c = 0; c < C; c++){
        var v = g[idx(f,c)];
        var cls = "f" + (v ? " j" + v : "") + (ganadoras && ganadoras.indexOf(idx(f,c)) >= 0 ? " gana" : "");
        html += '<div class="' + cls + '" data-c="' + c + '"></div>';
      }
    }
    $grid.innerHTML = html;
    $turno.innerHTML = terminado
      ? "&nbsp;"
      : '<span class="pin j' + (turno+1) + '"></span> juega <b>' + nombres[turno] + "</b>" +
        '<em>' + tanteo[0] + " – " + tanteo[1] + "</em>";
  }

  function arrancar(empieza){
    g = new Array(F*C).fill(0);
    turno = empieza || 0;
    terminado = false;
    ganadoras = null;
    pintar();
  }

  function editarNombres(){
    var a = prompt("Nombre del rojo", nombres[0]);
    if (a === null) return;
    var b = prompt("Nombre del amarillo", nombres[1]);
    if (b === null) return;
    nombres = [a.trim() || "Rojo", b.trim() || "Amarillo"];
    api.guardar("cuatro.nombres", nombres);
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api;
      nombres = api.leer("cuatro.nombres", ["Rojo", "Amarillo"]);
      tanteo  = api.leer("cuatro.tanteo", [0, 0]);
      el.innerHTML =
        '<p class="turno" id="turnoC4"></p>' +
        '<div class="tablero gc4" id="gc4"></div>' +
        '<p class="aviso">Tocá la columna donde querés que caiga tu ficha.</p>';
      $grid = document.getElementById("gc4");
      $turno = document.getElementById("turnoC4");
      $grid.addEventListener("click", function(e){
        var c = e.target.closest(".f");
        if (c) tirar(+c.dataset.c);
      });
      api.accion("Nombres", editarNombres);
      api.accion("Reiniciar", function(){
        tanteo = [0, 0];
        api.guardar("cuatro.tanteo", tanteo);
        arrancar(0);
      });
      arrancar(0);
    },
    desmontar: function(){}
  };
})();
