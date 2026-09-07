window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.naval = (function(){
  "use strict";

  var N = 8;
  var FLOTA = [4, 3, 3, 2, 2];        // 14 celdas por jugador
  var api, cont, tab, disparos, fase, quien, nombres, ganador;

  function idx(f, c){ return f*N + c; }

  // ---------- acomodar ----------
  function acomodar(){
    var grilla = new Array(N*N).fill(0);
    var barcos = [];
    FLOTA.forEach(function(largo, n){
      var puesto = false, intentos = 0;
      while (!puesto && intentos < 500){
        intentos++;
        var horiz = Math.random() < .5;
        var f = Math.floor(Math.random() * (horiz ? N : N - largo + 1));
        var c = Math.floor(Math.random() * (horiz ? N - largo + 1 : N));
        var celdas = [], libre = true;
        for (var k = 0; k < largo; k++){
          var ff = f + (horiz ? 0 : k), cc = c + (horiz ? k : 0);
          if (grilla[idx(ff, cc)]) { libre = false; break; }
          celdas.push(idx(ff, cc));
        }
        if (!libre) continue;
        celdas.forEach(function(i){ grilla[i] = n + 1; });
        barcos.push({ largo:largo, celdas:celdas, tocadas:0 });
        puesto = true;
      }
    });
    return { grilla:grilla, barcos:barcos };
  }

  function barcoDe(j, i){
    var n = tab[j].grilla[i];
    return n ? tab[j].barcos[n-1] : null;
  }

  function hundidos(j){
    return tab[j].barcos.filter(function(b){ return b.tocadas >= b.largo; }).length;
  }

  function perdio(j){
    return tab[j].barcos.every(function(b){ return b.tocadas >= b.largo; });
  }

  // ---------- pantallas ----------
  function pantallaAcomodar(j){
    fase = "acomodar"; quien = j;
    cont.innerHTML =
      '<p class="turno">Tu flota, <b>' + nombres[j] + "</b></p>" +
      '<div class="tablero gnv propio" id="gnv"></div>' +
      '<div class="dosbot">' +
        '<button class="btn fantasma" id="mezclar">Acomodar de nuevo</button>' +
        '<button class="btn" id="listo">Listo</button>' +
      "</div>" +
      '<p class="aviso">Se acomoda sola. Mezclá hasta que te guste y pasá el teléfono.</p>';
    pintarPropio(j);
    document.getElementById("mezclar").addEventListener("click", function(){
      tab[j] = acomodar();
      pintarPropio(j);
    });
    document.getElementById("listo").addEventListener("click", function(){
      if (j === 0) pantallaAcomodar(1);
      else pantallaPasar(0);
    });
  }

  function pintarPropio(j){
    var html = "";
    for (var i = 0; i < N*N; i++){
      html += '<div class="nv' + (tab[j].grilla[i] ? " barco" : "") + '"></div>';
    }
    document.getElementById("gnv").innerHTML = html;
  }

  function pantallaPasar(j){
    fase = "pasar"; quien = j;
    cont.innerHTML =
      '<div class="pasar">' +
        "<p>Pasale el teléfono a</p>" +
        "<h3>" + nombres[j] + "</h3>" +
        '<button class="btn" id="voy">Soy ' + nombres[j] + ", dale</button>" +
        '<p class="aviso">Así el otro no ve dónde tenés los barcos.</p>' +
      "</div>";
    document.getElementById("voy").addEventListener("click", function(){ pantallaTirar(j); });
  }

  function pantallaTirar(j){
    fase = "tirar"; quien = j;
    var rival = 1 - j;
    cont.innerHTML =
      '<p class="turno" id="turnoNv"></p>' +
      '<div class="tablero gnv" id="gnv"></div>' +
      '<p class="aviso" id="avisoNv">Tocá dónde querés tirar.</p>';
    pintarTiro(j);
    document.getElementById("gnv").addEventListener("click", function(e){
      var c = e.target.closest(".nv");
      if (c && !c.classList.contains("visto")) tirar(j, +c.dataset.i);
    });
  }

  function pintarTiro(j){
    var rival = 1 - j, d = disparos[j], html = "";
    for (var i = 0; i < N*N; i++){
      var e = d[i], cls = "nv";
      if (e === "agua") cls += " visto agua";
      else if (e === "tocado") cls += " visto tocado";
      else if (e === "hundido") cls += " visto hundido";
      html += '<div class="' + cls + '" data-i="' + i + '"></div>';
    }
    document.getElementById("gnv").innerHTML = html;
    document.getElementById("turnoNv").innerHTML =
      "Tirás vos, <b>" + nombres[j] + "</b>" +
      '<em>' + hundidos(rival) + " de " + FLOTA.length + " hundidos</em>";
  }

  function tirar(j, i){
    var rival = 1 - j;
    if (disparos[j][i]) return;
    var b = barcoDe(rival, i);
    var $av = document.getElementById("avisoNv");

    if (!b){
      disparos[j][i] = "agua";
      pintarTiro(j);
      setTimeout(function(){ pantallaPasar(rival); }, 700);
      return;
    }

    b.tocadas++;
    disparos[j][i] = "tocado";
    if (b.tocadas >= b.largo){
      b.celdas.forEach(function(k){ disparos[j][k] = "hundido"; });
    }
    pintarTiro(j);
    $av = document.getElementById("avisoNv");
    if (perdio(rival)) return terminar(j);
    if ($av) $av.textContent = b.tocadas >= b.largo
      ? "Hundido. Seguís tirando."
      : "Tocado. Seguís tirando.";
  }

  function terminar(j){
    fase = "fin"; ganador = j;
    api.fin("Ganó " + nombres[j],
      "Hundió las cinco naves de " + nombres[1-j] + ".",
      [{ txt:"Revancha", fn:arrancar }]);
  }

  function arrancar(){
    tab = [acomodar(), acomodar()];
    disparos = [{}, {}];
    ganador = null;
    pantallaAcomodar(0);
  }

  function editarNombres(){
    var a = prompt("Nombre del primero", nombres[0]);
    if (a === null) return;
    var b = prompt("Nombre del segundo", nombres[1]);
    if (b === null) return;
    nombres = [a.trim() || "Uno", b.trim() || "Dos"];
    api.guardar("naval.nombres", nombres);
    arrancar();
  }

  return {
    montar: function(el, _api){
      api = _api; cont = el;
      nombres = api.leer("naval.nombres", ["Uno", "Dos"]);
      api.accion("Nombres", editarNombres);
      api.accion("Reiniciar", arrancar);
      arrancar();
    },
    desmontar: function(){}
  };
})();
