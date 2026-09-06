window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.picante = (function(){
  "use strict";

  var VERDAD = [
    "¿Qué fue lo primero de mi cuerpo que te gustó?",
    "¿Cuándo fue la última vez que me deseaste y no dijiste nada?",
    "¿Qué fantasía tenés que todavía no me contaste?",
    "¿En qué lugar de la casa te gustaría que pase algo y nunca pasó?",
    "¿Qué te da más morbo: que te miren o mirar?",
    "¿Qué parte de mi cuerpo mirás cuando creés que no me doy cuenta?",
    "¿Alguna vez pensaste en mí en un momento en el que no correspondía?",
    "¿Qué prenda mía te gustaría que use hoy?",
    "¿Preferís que te lleve del todo o llevar vos?",
    "¿Cuál fue la vez que más te gustó y por qué?",
    "¿Qué es lo más atrevido que hiciste antes de conocerme?",
    "¿Qué te gustaría que te haga más seguido y no pedís?",
    "¿Hay algo que hago que te vuelve loco y nunca me dijiste?",
    "¿Con qué ropa te parece que estoy mejor: menos o nada?",
    "¿Qué te excita más: lo que se ve o lo que se insinúa?",
    "¿Alguna vez te dieron ganas en un lugar donde no se podía?",
    "¿Qué palabra te gusta que te diga al oído?",
    "¿Qué te da más placer: dar o recibir?",
    "¿Cuál es el recuerdo nuestro al que volvés cuando estás solo?",
    "¿Qué probarías conmigo si supieras que no me voy a sorprender por nada?",
    "¿Cuánto tardaste en pensar en algo así conmigo la primera vez?",
    "¿Qué te gusta que te hagan y nunca pediste en voz alta?",
    "¿Qué tan lejos llegarías si estuviéramos en un lugar público?",
    "¿Preferís rápido y desesperado, o lento y con todo el tiempo?",
    "¿Qué me pedirías si te dijera que hoy hago lo que quieras?",
    "¿Qué fue lo que más te calentó de la primera vez que estuvimos?",
    "¿Hay algo que te muero de ganas de probar y te da vergüenza pedir?",
    "¿Qué te gustaría que te diga mientras estamos?",
    "¿Cuál fue el momento más caliente que vivimos vestidos?",
    "¿Qué haría que te olvides de todo lo demás?"
  ];

  var ATREVIMIENTO = [
    "Besame el cuello durante treinta segundos. Sin usar las manos.",
    "Sacame una prenda usando solo los dientes.",
    "Contame al oído lo que te gustaría hacer ahora. Con detalle.",
    "Cerrá los ojos. Dejate tocar un minuto sin saber dónde.",
    "Elegí una parte de mi cuerpo y besala hasta que te diga basta.",
    "Mostrame cómo te tocarías si estuvieras solo.",
    "Dame un beso de tres minutos. Sin ir a otra cosa.",
    "Mordeme suave donde más te guste.",
    "Poneme la ropa que vos elijas y desfilá una vez.",
    "Hacé un masaje de espalda de dos minutos. Ropa opcional.",
    "Susurrame la fantasía que dijiste que no ibas a contar.",
    "Guiame la mano hasta donde querés que te toque.",
    "Sacate una prenda a elección. La elige el otro.",
    "Besame despacio bajando desde el cuello. Parás donde quieras.",
    "Quedate quieto un minuto entero mientras hago lo que quiera.",
    "Describí en voz alta lo que estás pensando ahora mismo.",
    "Poné una canción y desvestime al ritmo.",
    "Tapate los ojos hasta que te diga que los abras.",
    "Hacé conmigo lo que hiciste la última vez que te volviste loco.",
    "Tocame por arriba de la ropa dos minutos. Nada más.",
    "Decime al oído tres cosas que querés que pase esta noche.",
    "Besame donde nunca me hayas besado.",
    "Dejá que te ate las manos con lo que tengas a mano.",
    "Actuá lo que te gustaría que te haga, sobre mí.",
    "Elegí: me sacás algo vos, o me lo saco yo mientras mirás.",
    "Un minuto de manos donde vos quieras. Sin hablar.",
    "Pedime algo. Lo que sea. Si acepto, se hace ya.",
    "Turnate conmigo: uno manda, el otro obedece, cinco minutos.",
    "Besame como si fuera la primera vez que nos vemos.",
    "Terminá el juego como vos quieras."
  ];

  var api, $carta, $turno, mazo, jugadores, turno, ronda;

  function barajar(a){
    a = a.slice();
    for (var i = a.length-1; i > 0; i--){
      var j = Math.floor(Math.random()*(i+1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function sacar(tipo){
    if (!mazo[tipo].length) mazo[tipo] = barajar(tipo === "v" ? VERDAD : ATREVIMIENTO);
    var carta = mazo[tipo].pop();
    ronda++;
    $carta.innerHTML =
      '<span class="tipo">' + (tipo === "v" ? "Verdad" : "Atrevimiento") + "</span>" +
      "<p>" + carta + "</p>" +
      '<span class="quien">le toca a ' + jugadores[turno] + "</span>";
    $carta.className = "carta " + (tipo === "v" ? "cv" : "ca");
    turno = 1 - turno;
    pintarTurno();
  }

  function pintarTurno(){
    $turno.innerHTML = "Ronda " + ronda + " · ahora elige <b>" + jugadores[turno] + "</b>";
  }

  function nombres(){
    var a = prompt("¿Cómo se llama el primero?", jugadores[0]);
    if (a === null) return;
    var b = prompt("¿Y el segundo?", jugadores[1]);
    if (b === null) return;
    jugadores = [a.trim() || "Uno", b.trim() || "Dos"];
    api.guardar("picante.nombres", jugadores);
    pintarTurno();
  }

  return {
    montar: function(el, _api){
      api = _api;
      jugadores = api.leer("picante.nombres", ["Vos", "Ella"]);
      mazo = { v:barajar(VERDAD), a:barajar(ATREVIMIENTO) };
      turno = 0; ronda = 0;

      el.innerHTML =
        '<p class="turno" id="turnoPic"></p>' +
        '<div class="carta vacia" id="cartaPic">' +
          "<p>Elegí verdad o atrevimiento.</p>" +
          '<span class="quien">se juega de a dos, por turnos</span>' +
        "</div>" +
        '<div class="dosbot">' +
          '<button class="btn" id="bv">Verdad</button>' +
          '<button class="btn ca" id="ba">Atrevimiento</button>' +
        "</div>" +
        '<p class="aviso">Lo que uno no quiera hacer, se pasa y sigue el otro. Esa es la única regla.</p>';

      $carta = document.getElementById("cartaPic");
      $turno = document.getElementById("turnoPic");
      document.getElementById("bv").addEventListener("click", function(){ sacar("v"); });
      document.getElementById("ba").addEventListener("click", function(){ sacar("a"); });
      api.accion("Nombres", nombres);
      pintarTurno();
    },
    desmontar: function(){}
  };
})();
