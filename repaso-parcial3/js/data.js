/* ===== Repaso Parcial 3 · contenido =====
   Notación igual a las hojas U3A1–U3A3:
   σ² = Σd² ÷ n,  σ = √σ²,  CV = (σ ÷ x̄) × 100 %,  m.c. = marca de clase,
   Me ≈ m.c. de la primera clase cuya F llega a n ÷ 2,  Mo ≈ m.c. de la clase con la f más grande. */
(function () {
  'use strict';
  const D = {};
  window.DATA = D;

  D.title = 'Repaso Parcial 3';
  D.author = 'Elaborado por: Dr. T. Huerta';
  D.course = 'Razonamiento Matemático V · Preparatoria';

  /* ---------- Estación 1: ¿Quién es quién? (1 punto por tarjeta al primer intento) ---------- */
  D.s1 = {
    key: 's1',
    title: '¿Quién es quién?',
    emoji: '🃏',
    minutes: 6,
    ptsPerCard: 1,
    intro: 'Te aparecerá una tarjeta a la vez. Tócala y arrástrala a la medida que le corresponde, o simplemente toca la columna correcta.',
    rounds: [
      {
        title: 'Ronda 1 · Medidas de tendencia central',
        zones: [
          { id: 'media', label: 'Media', sub: 'x̄' },
          { id: 'mediana', label: 'Mediana', sub: 'Me' },
          { id: 'moda', label: 'Moda', sub: 'Mo' }
        ],
        cards: [
          { id: 'a1', zone: 'media', text: 'x̄ = Σx ÷ n', why: 'Sumar todos los datos y dividir entre cuántos son es la media.' },
          { id: 'a2', zone: 'media', text: 'En datos agrupados: Σ(f × m.c.) ÷ n', why: 'Multiplicas cada marca de clase por su frecuencia, sumas y divides entre n: así sale la media.' },
          { id: 'a3', zone: 'media', text: 'Es la que más se altera con un dato atípico (muy grande o muy chico)', why: 'La media usa el valor de todos los datos, así que un dato extremo la jala hacia él.' },
          { id: 'a4', zone: 'media', text: 'Si repartes el total en partes iguales, a cada quien le toca esto', why: 'Repartir en partes iguales es justo lo que hace la media.' },
          { id: 'b1', zone: 'mediana', text: 'El dato que queda justo en medio al ordenar', why: 'La mediana es el dato central cuando los datos están ordenados.' },
          { id: 'b2', zone: 'mediana', text: 'Su lugar es (n + 1) ÷ 2', why: 'Esa fórmula te dice en qué lugar está la mediana, no su valor.' },
          { id: 'b3', zone: 'mediana', text: 'En agrupados: m.c. de la primera clase cuya F llega a n ÷ 2', why: 'Buscar dónde la frecuencia acumulada F alcanza la mitad es buscar la mediana.' },
          { id: 'b4', zone: 'mediana', text: 'En una empresa donde el dueño gana millones, es la mejor para el sueldo "típico"', why: 'El sueldo del dueño es atípico: jala la media, pero no mueve a la mediana.' },
          { id: 'c1', zone: 'moda', text: 'El dato que más se repite', why: 'El que más se repite es la moda.' },
          { id: 'c2', zone: 'moda', text: 'Puede haber una, dos (bimodal) o ninguna', why: 'Solo la moda puede no existir o ser más de una.' },
          { id: 'c3', zone: 'moda', text: 'En agrupados: m.c. de la clase con la f más grande', why: 'La clase con más frecuencia es la clase modal.' },
          { id: 'c4', zone: 'moda', text: 'La única que sirve con datos que no son números (ej. color favorito)', why: 'No puedes sumar ni ordenar colores, pero sí ver cuál se repite más: la moda.' }
        ]
      },
      {
        title: 'Ronda 2 · Medidas de dispersión',
        zones: [
          { id: 'var', label: 'Varianza', sub: 'σ²' },
          { id: 'desv', label: 'Desv. estándar', sub: 'σ' },
          { id: 'cv', label: 'Coef. de variación', sub: 'CV' }
        ],
        cards: [
          { id: 'd1', zone: 'var', text: 'σ² = Σd² ÷ n', why: 'Sumar las distancias al cuadrado y dividir entre n da la varianza.' },
          { id: 'd2', zone: 'var', text: 'Sus unidades quedan al cuadrado (min², cm²)', why: 'Como elevas las distancias al cuadrado, la varianza queda en unidades al cuadrado.' },
          { id: 'd3', zone: 'var', text: 'En agrupados: Σ(f × d²) ÷ n', why: 'Con frecuencias, cada d² se multiplica por su f antes de dividir: es la varianza.' },
          { id: 'd4', zone: 'var', text: 'Ejemplo: 62.5 min²', why: 'Fíjate en las unidades: min² (al cuadrado) delata a la varianza.' },
          { id: 'e1', zone: 'desv', text: 'σ = √σ²', why: 'La desviación estándar es la raíz cuadrada de la varianza.' },
          { id: 'e2', zone: 'desv', text: 'Está en las mismas unidades que los datos', why: 'Al sacar la raíz, regresas a las unidades originales: eso es la desviación estándar.' },
          { id: 'e3', zone: 'desv', text: 'La "distancia típica" de los datos a la media', why: 'La desviación estándar mide cuánto se alejan, típicamente, los datos de la media.' },
          { id: 'e4', zone: 'desv', text: 'Ejemplo: 7.91 min', why: 'Está en minutos (no min² ni %), así que es la desviación estándar.' },
          { id: 'f1', zone: 'cv', text: 'CV = (σ ÷ x̄) × 100 %', why: 'Dividir la desviación entre la media y multiplicar por 100 es el coeficiente de variación.' },
          { id: 'f2', zone: 'cv', text: 'Se expresa en porcentaje, sin unidades', why: 'El CV es un porcentaje: las unidades se cancelan al dividir σ ÷ x̄.' },
          { id: 'f3', zone: 'cv', text: 'Sirve para comparar grupos con unidades distintas (kg contra cm)', why: 'Como no tiene unidades, el CV permite comparar la dispersión de cosas distintas.' },
          { id: 'f4', zone: 'cv', text: 'Ejemplo: 33.33 %', why: 'El signo % delata al coeficiente de variación.' }
        ]
      }
    ]
  };

  /* ---------- Estación 2: Mueve la Media (3 / 2 / 1 puntos según intentos) ---------- */
  // Los datos son enteros de 0 a 10. stats = {mean, median, modes, sd}
  const eq = (a, b) => Math.abs(a - b) < 1e-9;
  const f2 = v => (Math.round(v * 100) / 100).toString();
  D.f2 = f2;

  D.s2 = {
    key: 's2',
    title: 'Mueve la Media',
    emoji: '🎯',
    minutes: 12,
    intro: 'Arrastra los puntos sobre la recta (o toca un punto y luego toca a dónde quieres llevarlo). Los indicadores cambian en vivo. Cuando creas que cumpliste el reto, toca Comprobar.',
    challenges: [
      {
        id: 'm1', title: 'Sube la media sin mover la mediana',
        context: 'Calificaciones de 5 exámenes.',
        start: [2, 3, 5, 6, 7],
        goal: 'Haz que la media suba (hoy vale 4.6) pero que la mediana siga en 5.',
        hint: 'La mediana es el dato de en medio. ¿Qué pasa si mueves un dato que ya está a la derecha de ella todavía más a la derecha?',
        check: s => {
          if (!eq(s.median, 5)) return 'La mediana cambió a ' + f2(s.median) + '. Tiene que seguir en 5.';
          if (!(s.mean > 4.6 + 1e-9)) return 'La media vale ' + f2(s.mean) + '. Tiene que quedar arriba de 4.6.';
          return true;
        },
        solution: [2, 3, 5, 6, 10],
        win: 'Moviste datos de la orilla y la mediana ni se enteró: solo le importa quién queda en medio. La media sí cambia con cada dato.'
      },
      {
        id: 'm2', title: 'Media y mediana, iguales',
        context: 'Horas de sueño de 5 amigos.',
        start: [1, 2, 3, 4, 10],
        goal: 'Logra que la media y la mediana valgan exactamente lo mismo.',
        hint: 'Ese 10 está muy lejos de los demás y jala la media. ¿Qué pasa si lo acercas?',
        check: s => eq(s.mean, s.median) ? true : 'Media = ' + f2(s.mean) + ' y mediana = ' + f2(s.median) + '. Todavía no son iguales.',
        solution: [1, 2, 3, 4, 5],
        win: 'Cuando los datos quedan parejos a los dos lados (simétricos), la media y la mediana coinciden.'
      },
      {
        id: 'm3', title: 'Dispersión cero',
        context: 'Picor de la salsa (0 a 10) en 5 visitas a la taquería.',
        start: [1, 3, 5, 7, 9],
        goal: 'Haz que σ valga 0 sin cambiar la media (5).',
        hint: 'σ mide qué tan lejos están los datos de la media. ¿Cuándo no hay nada de distancia?',
        check: s => {
          if (!eq(s.mean, 5)) return 'La media cambió a ' + f2(s.mean) + '. Debe seguir en 5.';
          if (!eq(s.sd, 0)) return 'σ vale ' + f2(s.sd) + '. Todavía hay datos lejos de la media.';
          return true;
        },
        solution: [5, 5, 5, 5, 5],
        win: 'Si todos los datos son iguales, nadie se aleja de la media: σ = 0. ¡Salsa siempre igual!'
      },
      {
        id: 'm4', title: 'Media 6, mediana 5',
        context: 'Goles por partido de un equipo.',
        start: [3, 4, 5, 6, 7],
        goal: 'Deja la media en 6, pero la mediana en 5.',
        hint: 'Para que la media suba de 5 a 6, la suma tiene que subir 5 en total. Hazlo con los datos de la derecha.',
        check: s => {
          if (!eq(s.median, 5)) return 'La mediana vale ' + f2(s.median) + '. Debe quedar en 5.';
          if (!eq(s.mean, 6)) return 'La media vale ' + f2(s.mean) + '. Necesitas exactamente 6.';
          return true;
        },
        solution: [3, 4, 5, 8, 10],
        win: 'La suma total manda en la media; el orden manda en la mediana. Son medidas distintas.'
      },
      {
        id: 'm5', title: 'Crea una moda',
        context: 'Calificaciones de 6 compañeros.',
        start: [1, 3, 4, 6, 8, 9],
        goal: 'Haz que la moda sea solo el 7, sin cambiar la mediana (5).',
        hint: 'Con 6 datos, la mediana es el promedio de los dos de en medio (4 y 6). Usa los datos de la derecha para formar la moda.',
        check: s => {
          if (!eq(s.median, 5)) return 'La mediana cambió a ' + f2(s.median) + '. Debe seguir en 5.';
          if (!(s.modes.length === 1 && s.modes[0] === 7)) return s.modes.length ? 'La moda es ' + s.modes.join(' y ') + '. Necesitas que sea solo el 7.' : 'Todavía no hay moda: ningún dato se repite más que los demás.';
          return true;
        },
        solution: [1, 3, 4, 6, 7, 7],
        win: 'La moda solo cuenta repeticiones. Con número par de datos, la mediana es el promedio de los dos centrales.'
      },
      {
        id: 'm6', title: 'Máxima dispersión',
        context: 'Minutos de retraso de 4 camiones.',
        start: [4, 5, 5, 6],
        goal: 'Haz σ lo más grande posible, manteniendo la media en 5.',
        hint: 'Entre más lejos estén los datos de la media, mayor es σ. ¿Qué tan lejos puedes mandarlos sin mover la media?',
        check: s => {
          if (!eq(s.mean, 5)) return 'La media cambió a ' + f2(s.mean) + '. Debe seguir en 5.';
          if (s.sd < 4.99) return 'σ vale ' + f2(s.sd) + '. Todavía se puede hacer más grande.';
          return true;
        },
        solution: [0, 0, 10, 10],
        win: 'Mandaste los datos a los extremos: misma media (5), pero muchísima más dispersión. La media sola no cuenta toda la historia.'
      }
    ]
  };

  /* ---------- Estación 3: Detective de los Datos (2 puntos por etiqueta al primer intento) ---------- */
  D.s3 = {
    key: 's3',
    title: 'Detective de los Datos',
    emoji: '🔎',
    minutes: 5,
    ptsPerCard: 2,
    intro: 'Mira las 4 gráficas. Te aparecerá una etiqueta a la vez: arrástrala a la gráfica que describe, o toca esa gráfica.',
    rounds: [
      {
        title: 'Ronda 1 · Forma de la distribución',
        zones: [
          { id: 'der', bars: [2, 7, 9, 7, 5, 3, 2, 1, 1, 1] },
          { id: 'izq', bars: [1, 1, 1, 2, 3, 5, 7, 9, 7, 2] },
          { id: 'sim', bars: [1, 2, 4, 7, 9, 9, 7, 4, 2, 1] },
          { id: 'bi', bars: [1, 5, 9, 5, 2, 2, 5, 9, 5, 1] }
        ],
        cards: [
          { id: 'g1', zone: 'der', text: 'La media es mayor que la mediana', why: 'Busca la gráfica con la cola larga hacia la DERECHA: esos datos grandes jalan la media hacia arriba.' },
          { id: 'g2', zone: 'izq', text: 'La media es menor que la mediana', why: 'Busca la cola larga hacia la IZQUIERDA: los datos chicos jalan la media hacia abajo.' },
          { id: 'g3', zone: 'sim', text: 'Media = mediana = moda', why: 'Eso pasa cuando la gráfica es simétrica: un solo pico en el centro y lados iguales.' },
          { id: 'g4', zone: 'bi', text: 'Tiene dos modas (bimodal)', why: 'Bimodal = dos picos.' }
        ]
      },
      {
        title: 'Ronda 2 · Dispersión',
        zones: [
          { id: 'angosta', bars: [0, 0, 0, 2, 9, 9, 2, 0, 0, 0] },
          { id: 'ancha', bars: [3, 4, 4, 5, 5, 5, 5, 4, 4, 3] },
          { id: 'cero', bars: [0, 0, 0, 0, 0, 10, 0, 0, 0, 0] },
          { id: 'atip', bars: [0, 3, 7, 9, 6, 2, 0, 0, 0, 1] }
        ],
        cards: [
          { id: 'h1', zone: 'angosta', text: 'Tiene una σ pequeña, pero no cero', why: 'σ pequeña = datos amontonados cerca del centro, aunque no todos iguales.' },
          { id: 'h2', zone: 'ancha', text: 'Es la de mayor σ', why: 'Mayor σ = datos repartidos por todos lados, lejos de la media.' },
          { id: 'h3', zone: 'cero', text: 'σ = 0', why: 'σ = 0 solo pasa si TODOS los datos son iguales: una sola barra.' },
          { id: 'h4', zone: 'atip', text: 'Conviene reportar la mediana, no la media', why: 'Busca el dato aislado lejísimos (atípico): jala la media, pero no a la mediana.' }
        ]
      }
    ]
  };

  /* ---------- Ronda relámpago (2 puntos por respuesta correcta, 30 s cada una) ---------- */
  D.fl = {
    key: 'fl',
    title: 'Ronda relámpago',
    emoji: '⚡',
    seconds: 30,
    pts: 2,
    intro: '4 preguntas, 30 segundos cada una. Si recargas la página, el reloj sigue corriendo. ¿Listo?',
    questions: [
      {
        id: 'q1', tag: '🎮 Gaming',
        text: 'Tus kills en 5 partidas de Free Fire: 0, 1, 0, 1 y 23 (en la última te cargó tu primo 🙃). Para describir TU nivel real, ¿qué medida usas?',
        options: ['La mediana: 1 kill', 'La media: 5 kills', 'El máximo: 23 kills', 'La suma: 25 kills'],
        answer: 0,
        why: 'La partida "carreada" infla la media a 5. La mediana no se deja engañar: tu nivel real es 1. 😅'
      },
      {
        id: 'q2', tag: '🌮 Tacos de Ensenada',
        text: 'Taquería A: la salsa siempre pica igual. Taquería B: un día no pica nada y al otro te hace llorar. ¿Cuál tiene σ cercana a 0?',
        options: ['La taquería A', 'La taquería B', 'Las dos tienen la misma σ', 'Depende de si es taco de pescado o de camarón'],
        answer: 0,
        why: 'Siempre igual = sin dispersión → σ ≈ 0. La B es pura montaña rusa 🌶️ (σ grande).'
      },
      {
        id: 'q3', tag: '📱 TikTok',
        text: 'Tu cel dice "Promedio diario: 7 h de pantalla". De lunes a sábado usaste 5 h, pero el domingo viste 19 h de edits de anime. ¿Qué pasó?',
        options: ['El domingo jaló la media; la mediana (5 h) te representa mejor', 'La media nunca falla: usas 7 h todos los días', 'La moda es 19 h', 'La σ es 0 porque casi todos los días son iguales'],
        answer: 0,
        why: 'Un solo día atípico subió el promedio de 5 a 7 h. La mediana (5 h) describe mejor tu semana. (Igual, suelta el cel 😜)'
      },
      {
        id: 'q4', tag: '🧸 Labubus',
        text: 'Precios de reventa de un Labubu en Marketplace: $400, $420, $430, $450 y uno a $5,000 (el vendedor se emocionó). ¿Cuál es el precio "normal"?',
        options: ['$430, la mediana', '$1,340, la media', '$5,000: el más caro manda', 'No se puede saber sin la varianza'],
        answer: 0,
        why: 'Los $5,000 disparan la media a $1,340. La mediana ($430) es el precio que de verdad vas a encontrar.'
      }
    ]
  };

  D.maxPts = {
    s1: D.s1.rounds.reduce((a, r) => a + r.cards.length, 0) * D.s1.ptsPerCard,
    s2: D.s2.challenges.length * 3,
    s3: D.s3.rounds.reduce((a, r) => a + r.cards.length, 0) * D.s3.ptsPerCard,
    fl: D.fl.questions.length * D.fl.pts
  };
  D.maxTotal = D.maxPts.s1 + D.maxPts.s2 + D.maxPts.s3 + D.maxPts.fl;

  D.grade = (pts) => {
    const p = pts / D.maxTotal;
    return p >= 0.95 ? 10 : p >= 0.85 ? 9 : p >= 0.75 ? 8 : p >= 0.65 ? 7 : p >= 0.55 ? 6 : 5;
  };
})();
