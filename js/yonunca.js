window.JUEGOS = window.JUEGOS || {};
window.JUEGOS.yonunca = (function(){
  "use strict";

  var CARTAS = {
    suave: [
      "Yo nunca me hice el dormido para que me dejen en paz.",
      "Yo nunca mentí sobre por qué llegué tarde al trabajo.",
      "Yo nunca me fui de un lugar sin saludar a nadie.",
      "Yo nunca busqué a un ex en las redes esta semana.",
      "Yo nunca dije que había leído un libro que no leí.",
      "Yo nunca me hice el que entendía un chiste que no entendí.",
      "Yo nunca canté en el auto creyendo que nadie me veía.",
      "Yo nunca puse una excusa para no ir a un cumpleaños.",
      "Yo nunca comí algo del fondo de la heladera sin mirar la fecha.",
      "Yo nunca stalkeé a alguien hasta fotos de hace tres años.",
      "Yo nunca dije «ya salgo» estando todavía en la cama.",
      "Yo nunca me quedé con un cargador que no era mío.",
      "Yo nunca lloré con una película y lo negué después.",
      "Yo nunca hablé mal de alguien y a los cinco minutos lo saludé.",
      "Yo nunca fingí tener señal para cortar una llamada.",
      "Yo nunca me probé ropa que sabía que no iba a comprar.",
      "Yo nunca dije que estaba en camino sin haberme bañado.",
      "Yo nunca me olvidé el nombre de alguien en plena charla.",
      "Yo nunca revisé el celular de otro sin permiso.",
      "Yo nunca me hice el ocupado para no ayudar a mudarse a nadie."
    ],
    picante: [
      "Yo nunca me enganché con alguien del trabajo.",
      "Yo nunca mandé un mensaje de madrugada del que me arrepentí.",
      "Yo nunca besé a dos personas la misma noche.",
      "Yo nunca dije que sí a una cita sin ganas de ir.",
      "Yo nunca volví con alguien sabiendo que era mala idea.",
      "Yo nunca me hice el desentendido con un mensaje que sí vi.",
      "Yo nunca mentí sobre con quién estaba.",
      "Yo nunca me fui de una fiesta con alguien que recién conocía.",
      "Yo nunca borré un mensaje antes de que lo lea el otro.",
      "Yo nunca me quedé pensando en alguien que no debía.",
      "Yo nunca dije «te quiero» sin estar seguro.",
      "Yo nunca tuve una charla que no le mostraría a nadie.",
      "Yo nunca me arreglé de más solo porque sabía que iba a estar alguien.",
      "Yo nunca sentí celos y dije que no era nada.",
      "Yo nunca terminé algo por mensaje.",
      "Yo nunca me hice el dormido para evitar una charla incómoda.",
      "Yo nunca inventé un plan para no quedarme a dormir.",
      "Yo nunca mentí sobre cuántas personas hubo antes.",
      "Yo nunca me guardé una foto que no debería tener.",
      "Yo nunca coquetée sabiendo que no iba a llegar a nada."
    ],
    hot: [
      "Yo nunca lo hice en un lugar donde nos podían ver.",
      "Yo nunca lo hice en la casa de otra persona.",
      "Yo nunca mandé una foto subida de tono.",
      "Yo nunca pensé en otra persona en pleno momento.",
      "Yo nunca fingí que la estaba pasando bien.",
      "Yo nunca lo hice en un auto.",
      "Yo nunca tuve algo con alguien y no se lo conté a nadie.",
      "Yo nunca me quedé despierto esperando un mensaje que no llegó.",
      "Yo nunca probé algo nuevo solo porque me lo pidieron.",
      "Yo nunca lo hice sabiendo que había alguien en la habitación de al lado.",
      "Yo nunca dije un nombre equivocado.",
      "Yo nunca tuve una fantasía con alguien que conozco.",
      "Yo nunca me arrepentí a los cinco minutos.",
      "Yo nunca me escapé de algún lado para vernos.",
      "Yo nunca me quedé hasta cualquier hora y fui a trabajar sin dormir.",
      "Yo nunca hice algo de lo que me río ahora y en el momento me moría de vergüenza.",
      "Yo nunca tuve que explicar una marca al día siguiente.",
      "Yo nunca lo hice en la primera cita.",
      "Yo nunca guardé un contacto con un nombre falso.",
      "Yo nunca dije que era la última vez y no lo fue."
    ]
  };

  var NIVELES = [
    { id:"suave",   nom:"Para la juntada", baja:"Nada que no puedas contar en una mesa larga." },
    { id:"picante", nom:"Picante",         baja:"Cosas que no contarías delante de cualquiera." },
    { id:"hot",     nom:"Hot",             baja:"Directo y sin vueltas. Para dos que se tienen confianza." }
  ];

  var api, cont, mazo, nivel, ronda, $carta, $turno, nombres, turno;

  function barajar(a){
    a = a.slice();
    for (var i = a.length-1; i > 0; i--){
      var j = Math.floor(Math.random()*(i+1)), t = a[i];
      a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function elegirNivel(){
    cont.innerHTML =
      '<div class="niveles">' +
        "<p>¿Hasta dónde van hoy?</p>" +
        NIVELES.map(function(n){
          return '<button class="nivel" data-n="' + n.id + '"><b>' + n.nom + "</b><small>" + n.baja + "</small></button>";
        }).join("") +
      "</div>";
    cont.querySelector(".niveles").addEventListener("click", function(e){
      var b = e.target.closest("[data-n]");
      if (b) empezar(b.dataset.n);
    });
  }

  function empezar(id){
    nivel = id;
    mazo = barajar(CARTAS[id]);
    ronda = 0; turno = 0;
    cont.innerHTML =
      '<p class="turno" id="turnoYn"></p>' +
      '<div class="carta vacia" id="cartaYn">' +
        "<p>El que lee toma si lo hizo.</p>" +
        '<span class="quien">nivel ' + NIVELES.filter(function(n){ return n.id === id; })[0].nom.toLowerCase() + "</span>" +
      "</div>" +
      '<button class="btn" id="otraYn">Sacar carta</button>' +
      '<p class="aviso">El que no quiera contestar, pasa. Nadie explica por qué.</p>';
    $carta = document.getElementById("cartaYn");
    $turno = document.getElementById("turnoYn");
    document.getElementById("otraYn").addEventListener("click", sacar);
    pintarTurno();
  }

  function sacar(){
    if (!mazo.length) mazo = barajar(CARTAS[nivel]);
    var c = mazo.pop();
    ronda++;
    $carta.className = "carta ca";
    $carta.innerHTML =
      '<span class="tipo">' + nombres[turno] + "</span><p>" + c + "</p>" +
      '<span class="quien">quedan ' + mazo.length + " en el mazo</span>";
    turno = 1 - turno;
    pintarTurno();
  }

  function pintarTurno(){
    $turno.innerHTML = "Ronda " + ronda + " · lee <b>" + nombres[turno] + "</b>";
  }

  function editarNombres(){
    var a = prompt("¿Quién arranca?", nombres[0]);
    if (a === null) return;
    var b = prompt("¿Y el otro?", nombres[1]);
    if (b === null) return;
    nombres = [a.trim() || "Uno", b.trim() || "Dos"];
    api.guardar("yonunca.nombres", nombres);
    if ($turno) pintarTurno();
  }

  return {
    montar: function(el, _api){
      api = _api; cont = el;
      nombres = api.leer("yonunca.nombres", ["Vos", "Ella"]);
      api.accion("Nombres", editarNombres);
      api.accion("Nivel", elegirNivel);
      elegirNivel();
    },
    desmontar: function(){}
  };
})();
