window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.palabra = (function(){
  "use strict";

  var BANCO = ("amigo arbol banco barco beber bicho bolsa brazo burro cable campo canal carta casas calor "+
  "cielo clase cobre comer cinta cuero dedos dulce deuda deseo drama envio error feliz fecha fideo flaco "+
  "fondo fruta fuego fuera gente globo golpe grano grupo hielo hijos hojas honor horno huevo humor islas "+
  "jarra jugar juego junio julio labio lados largo letra libre libro limon linea lugar lunes madre magia "+
  "malos manos mango marca marzo mayor medio mejor menor mesas metal metro miedo mirar monte mucho mujer "+
  "museo nariz nieve nivel noche norte nubes nudos nuevo oeste orden oreja padre pagar palos papel parte "+
  "pasto patio pausa pecho pedir pelea pelos perro pesar pesos picar pieza pilas pinos pisos pista placa "+
  "plata playa plaza plomo pluma pobre poder polvo pollo pozos primo prisa puede pulpo punto queso quien "+
  "radio ramas rango ratos rayos razon reloj ricos risas ritmo robar rocas rojas ropas rosas rueda ruido "+
  "saber sabor sacar salir salsa salto salud santo secar sello selva senda siglo silla sitio sobre socio "+
  "solar sopas subir sucio suelo sumar tabla talle tango tapas tarde tarea tazas techo tenis terco tesis "+
  "tigre tinta tirar tocar todos tomar tonto torre torta traje trato trece trigo tripa trono trozo truco "+
  "tubos turno unico union usted valor vapor varon vasos veces velas venta verbo verde viaje vidas video "+
  "viejo vinos virus visto vivir vocal vodka volar votos vuelo yerba yogur zorro").split(" ");

  var LARGO = 5, INTENTOS = 6;
  var meta, filas, actual, terminado, api, $grid, $tec, estados, numeroDia;

  function diaDeHoy(){
    var h = new Date();
    return Math.floor((Date.UTC(h.getFullYear(), h.getMonth(), h.getDate()) - Date.UTC(2026,0,1)) / 86400000);
  }

  function limpiar(t){
    return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zñ]/g, "");
  }

  // ---------- evaluación estilo Wordle ----------
  function evaluar(intento){
    var res = new Array(LARGO).fill("no");
    var libres = {};
    var i;
    for (i = 0; i < LARGO; i++){
      if (intento[i] === meta[i]) res[i] = "ok";
      else libres[meta[i]] = (libres[meta[i]] || 0) + 1;
    }
    for (i = 0; i < LARGO; i++){
      if (res[i] === "ok") continue;
      if (libres[intento[i]]){ res[i] = "casi"; libres[intento[i]]--; }
    }
    return res;
  }

  var RANGO = { no:0, casi:1, ok:2 };
  function anotarTeclas(intento, res){
    for (var i = 0; i < LARGO; i++){
      var l = intento[i];
      if (!estados[l] || RANGO[res[i]] > RANGO[estados[l]]) estados[l] = res[i];
    }
  }

  function pintar(){
    var html = "";
    for (var f = 0; f < INTENTOS; f++){
      var fila = filas[f];
      for (var c = 0; c < LARGO; c++){
        var letra = "", cls = "w";
        if (fila){ letra = fila.txt[c]; cls += " " + fila.res[c]; }
        else if (f === filas.length && actual[c]){ letra = actual[c]; cls += " esc"; }
        html += '<div class="' + cls + '">' + (letra || "") + "</div>";
      }
    }
    $grid.innerHTML = html;

    $tec.querySelectorAll("[data-l]").forEach(function(b){
      var e = estados[b.dataset.l];
      b.className = e ? "t " + e : "t";
    });
  }

  function enviar(){
    if (terminado || actual.length < LARGO) return;
    var txt = actual.join("");
    var res = evaluar(actual);
    filas.push({ txt:actual.slice(), res:res });
    anotarTeclas(actual, res);
    actual = [];
    pintar();

    if (txt === meta.join("")) return cerrar(true);
    if (filas.length >= INTENTOS) return cerrar(false);
  }

  function cerrar(gano){
    terminado = true;
    var st = api.leer("palabra.estado", {});
    if (st.dia !== numeroDia){
      st.dia = numeroDia;
      st.racha = gano ? (st.ultimo === numeroDia - 1 ? (st.racha||0) + 1 : 1) : 0;
      st.ultimo = numeroDia;
      api.guardar("palabra.estado", st);
    }
    var barra = filas.map(function(f){
      return f.res.map(function(r){ return r === "ok" ? "🟩" : r === "casi" ? "🟨" : "⬛"; }).join("");
    }).join("\n");
    var texto = "La Previa · Palabra #" + numeroDia + "  " +
                (gano ? filas.length : "X") + "/" + INTENTOS + "\n" + barra;

    api.fin(gano ? "¡Esa es!" : "Era " + meta.join("").toUpperCase(),
      gano ? "La sacaste en " + filas.length + ". Racha: <b>" + (st.racha||0) + "</b>."
           : "Mañana hay otra.",
      [
        { txt:"Copiar resultado", fn:function(){ copiar(texto); } },
        { txt:"Jugar una al azar", suave:true, fn:function(){ arrancar(true); } }
      ]);
  }

  function copiar(t){
    if (navigator.share) { navigator.share({ text:t }).catch(function(){}); return; }
    if (navigator.clipboard) navigator.clipboard.writeText(t).catch(function(){});
  }

  function teclear(l){
    if (terminado) return;
    if (l === "ENTER") return enviar();
    if (l === "DEL"){ actual.pop(); return pintar(); }
    if (actual.length < LARGO){ actual.push(l); pintar(); }
  }

  function tecla(e){
    if (e.key === "Enter") return teclear("ENTER");
    if (e.key === "Backspace") return teclear("DEL");
    var l = limpiar(e.key);
    if (l.length === 1) teclear(l);
  }

  function arrancar(azar){
    numeroDia = diaDeHoy();
    var i = azar ? Math.floor(Math.random()*BANCO.length) : (numeroDia * 11 + 5) % BANCO.length;
    meta = BANCO[i].split("");
    filas = []; actual = []; terminado = false; estados = {};
    pintar();
  }

  var TECLADO = ["qwertyuiop", "asdfghjklñ", "zxcvbnm"];

  return {
    montar: function(el, _api){
      api = _api;
      var tec = "";
      TECLADO.forEach(function(f, n){
        tec += '<div class="tfila">';
        if (n === 2) tec += '<button class="t ancho" data-l="ENTER">Enviar</button>';
        f.split("").forEach(function(l){ tec += '<button class="t" data-l="' + l + '">' + l + "</button>"; });
        if (n === 2) tec += '<button class="t ancho" data-l="DEL">⌫</button>';
        tec += "</div>";
      });
      el.innerHTML =
        '<div class="tablero gpal" id="gpal"></div>' +
        '<div class="teclado" id="tecpal">' + tec + "</div>";
      $grid = document.getElementById("gpal");
      $tec = document.getElementById("tecpal");
      $tec.addEventListener("click", function(e){
        var b = e.target.closest("[data-l]");
        if (b) teclear(b.dataset.l);
      });
      document.addEventListener("keydown", tecla);
      arrancar(false);
    },
    desmontar: function(){ document.removeEventListener("keydown", tecla); }
  };
})();
