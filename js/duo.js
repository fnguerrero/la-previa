window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.duo = (function(){
  "use strict";

  var INTENTOS = 6;
  var api, cont, meta, filas, actual, terminado, estados, $grid, $tec;

  // ---------- el desafío viaja adentro del link ----------
  function codificar(palabra){
    return btoa(palabra).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function decodificar(txt){
    try {
      var b = txt.replace(/-/g, "+").replace(/_/g, "/");
      while (b.length % 4) b += "=";
      return atob(b);
    } catch(e){ return ""; }
  }

  function limpiar(t){
    return (t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ]/g, "");
  }

  // ---------- pantalla 1: armar ----------
  function pantallaArmar(){
    cont.innerHTML =
      '<div class="armar">' +
        "<p>Elegí una palabra de 4 a 8 letras. Se la mandás y tiene seis intentos para sacarla.</p>" +
        '<input type="text" id="palDuo" placeholder="tu palabra" autocomplete="off" ' +
               'autocapitalize="off" spellcheck="false" maxlength="8">' +
        '<button class="btn" id="armarDuo">Armar el desafío</button>' +
        '<p class="aviso" id="avisoDuo">No se guarda en ningún lado: viaja adentro del link.</p>' +
      "</div>";
    var $inp = document.getElementById("palDuo");
    var $av = document.getElementById("avisoDuo");
    document.getElementById("armarDuo").addEventListener("click", function(){
      var w = limpiar($inp.value);
      if (w.length < 4 || w.length > 8){
        $av.textContent = "Tiene que tener entre 4 y 8 letras, sin números ni espacios.";
        return;
      }
      mostrarEnlace(w);
    });
    $inp.addEventListener("keydown", function(e){
      if (e.key === "Enter") document.getElementById("armarDuo").click();
    });
  }

  function mostrarEnlace(w){
    var url = api.enlace("duo", codificar(w));
    var texto = "Te dejo una palabra. Tenés seis intentos:\n" + url;
    cont.innerHTML =
      '<div class="armar">' +
        "<p>Listo. Mandale esto y esperá que te devuelva el resultado.</p>" +
        '<div class="enlace" id="urlDuo">' + url + "</div>" +
        '<button class="btn" id="mandarDuo">Compartir el desafío</button>' +
        '<button class="btn fantasma" id="otraDuo">Armar otra</button>' +
        '<p class="aviso" id="avisoDuo">La palabra era <b>' + w.toUpperCase() + "</b>. No se la muestres.</p>" +
      "</div>";
    document.getElementById("mandarDuo").addEventListener("click", function(){
      compartir(texto, "Copiado. Pegalo en el chat.");
    });
    document.getElementById("otraDuo").addEventListener("click", pantallaArmar);
  }

  function compartir(texto, ok){
    var $av = document.getElementById("avisoDuo");
    if (navigator.share){ navigator.share({ text:texto }).catch(function(){}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(texto).then(
        function(){ if ($av) $av.textContent = ok; },
        function(){ if ($av) $av.textContent = texto; });
    } else if ($av) $av.textContent = texto;
  }

  // ---------- pantalla 2: adivinar ----------
  function evaluar(intento){
    var res = new Array(meta.length).fill("no"), libres = {}, i;
    for (i = 0; i < meta.length; i++){
      if (intento[i] === meta[i]) res[i] = "ok";
      else libres[meta[i]] = (libres[meta[i]] || 0) + 1;
    }
    for (i = 0; i < meta.length; i++){
      if (res[i] === "ok") continue;
      if (libres[intento[i]]){ res[i] = "casi"; libres[intento[i]]--; }
    }
    return res;
  }

  var RANGO = { no:0, casi:1, ok:2 };

  function pintar(){
    var largo = meta.length, html = "";
    for (var f = 0; f < INTENTOS; f++){
      var fila = filas[f];
      for (var c = 0; c < largo; c++){
        var letra = "", cls = "w";
        if (fila){ letra = fila.txt[c]; cls += " " + fila.res[c]; }
        else if (f === filas.length && actual[c]){ letra = actual[c]; cls += " esc"; }
        html += '<div class="' + cls + '">' + (letra || "") + "</div>";
      }
    }
    $grid.style.gridTemplateColumns = "repeat(" + largo + ",1fr)";
    $grid.innerHTML = html;
    $tec.querySelectorAll("[data-l]").forEach(function(b){
      var e = estados[b.dataset.l];
      b.className = e ? "t " + e : "t";
    });
  }

  function enviar(){
    if (terminado || actual.length < meta.length) return;
    var res = evaluar(actual);
    for (var i = 0; i < actual.length; i++){
      var l = actual[i];
      if (!estados[l] || RANGO[res[i]] > RANGO[estados[l]]) estados[l] = res[i];
    }
    var gano = actual.join("") === meta.join("");
    filas.push({ txt:actual.slice(), res:res });
    actual = [];
    pintar();
    if (gano || filas.length >= INTENTOS) cerrar(gano);
  }

  function cerrar(gano){
    terminado = true;
    var barra = filas.map(function(f){
      return f.res.map(function(r){ return r === "ok" ? "🟩" : r === "casi" ? "🟨" : "⬛"; }).join("");
    }).join("\n");
    var texto = (gano ? "La saqué en " + filas.length + "/" + INTENTOS
                      : "No la saqué. X/" + INTENTOS) + "\n" + barra;
    api.fin(gano ? "¡La sacaste!" : "Era " + meta.join("").toUpperCase(),
      gano ? "En " + filas.length + " de " + INTENTOS + "." : "Se te acabaron los intentos.",
      [
        { txt:"Devolver el resultado", fn:function(){ compartir(texto, "Copiado."); } },
        { txt:"Mandarle una a él", suave:true, fn:function(){
            location.hash = "#duo";
            pantallaArmar();
          } }
      ]);
  }

  var TECLADO = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"];

  function teclear(l){
    if (terminado) return;
    if (l === "ENTER") return enviar();
    if (l === "DEL"){ actual.pop(); return pintar(); }
    if (actual.length < meta.length){ actual.push(l); pintar(); }
  }

  function tecla(e){
    if (e.key === "Enter") return teclear("ENTER");
    if (e.key === "Backspace") return teclear("DEL");
    var l = limpiar(e.key);
    if (l.length === 1) teclear(l);
  }

  function pantallaJugar(palabra){
    meta = palabra.split("");
    filas = []; actual = []; terminado = false; estados = {};
    var tec = "";
    TECLADO.forEach(function(f, n){
      tec += '<div class="tfila">';
      if (n === 2) tec += '<button class="t ancho" data-l="ENTER">Enviar</button>';
      f.split("").forEach(function(l){ tec += '<button class="t" data-l="' + l + '">' + l + "</button>"; });
      if (n === 2) tec += '<button class="t ancho" data-l="DEL">⌫</button>';
      tec += "</div>";
    });
    cont.innerHTML =
      '<p class="turno">Te mandaron una palabra de <b>' + meta.length + "</b> letras.</p>" +
      '<div class="tablero gpal" id="gduo"></div>' +
      '<div class="teclado" id="tecduo">' + tec + "</div>";
    $grid = document.getElementById("gduo");
    $tec = document.getElementById("tecduo");
    $tec.addEventListener("click", function(e){
      var b = e.target.closest("[data-l]");
      if (b) teclear(b.dataset.l);
    });
    document.addEventListener("keydown", tecla);
    pintar();
  }

  return {
    montar: function(el, _api){
      api = _api; cont = el;
      var recibido = api.parametro ? decodificar(api.parametro) : "";
      recibido = limpiar(recibido);
      if (recibido.length >= 4 && recibido.length <= 8) pantallaJugar(recibido);
      else pantallaArmar();
    },
    desmontar: function(){ document.removeEventListener("keydown", tecla); }
  };
})();
