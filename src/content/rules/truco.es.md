# Reglas de Truco en Trucoshi

Este reglamento explica la version de Truco Argentino implementada en Trucoshi. Mantiene la estructura tradicional de truco, envido y flor, pero describe solo las cantidades de jugadores y reglas de puntuacion que soporta la app.

## Jugadores y equipos

Trucoshi soporta partidas de 2, 4 o 6 jugadores. Siempre hay dos equipos. En partidas de 2 se juega mano a mano. En partidas de 4 se juega en parejas. En partidas de 6 cada equipo tiene tres jugadores y puede aparecer el pica-pica mas adelante.

Cada jugador recibe tres cartas de una baraja espanola de 40 cartas. El jugador despues del dador es mano y empieza la primera baza. Las bazas siguientes las empieza quien gano la baza anterior, salvo cuando hubo empate.

## Puntaje de la partida

La partida tiene un `matchPoint` configurable, con 9 como valor por defecto en Trucoshi. Los puntos llenan primero malas y despues buenas. Un equipo gana cuando llega a `matchPoint` buenas.

Una mano sin truco aceptado vale 1 punto. Truco, envido y flor pueden sumar o reemplazar ese valor segun lo que se acepte o rechace.

## Ranking de cartas para las bazas

{{CARD_RANKING}}

La carta mas alta gana la baza. Si las cartas mas altas empatan entre equipos contrarios, la baza queda parda. Si las tres bazas empatan, gana el equipo del mano.

## Envido

El envido es una apuesta por los tantos de las cartas de la mano, normalmente antes de jugar cartas.

Para envido y flor, las cartas valen su numero, excepto 10, 11 y 12, que valen 0. Si tenes dos cartas del mismo palo, tu envido es 20 mas esos dos valores. Si las tres cartas son de palos distintos, tu envido es el valor de la carta mas alta.

Los cantos posibles son:

- `ENVIDO`: vale 2 puntos si se acepta.
- Segundo `ENVIDO`: suma 2 puntos mas.
- `REAL_ENVIDO`: suma 3 puntos.
- `FALTA_ENVIDO`: su valor sigue la opcion de partida usada por el backend.

Si el envido se rechaza, quien lo canto cobra el valor ya aceptado. Si era el primer canto, el rechazo da 1 punto. Si se acepta, los jugadores declaran sus tantos; gana el valor mas alto y los empates favorecen al jugador mas cercano al mano.

## Truco

El truco es la apuesta sobre quien gana la mano de bazas. Sin truco, la mano vale 1 punto.

La escalera del truco es:

- `TRUCO`: sube la mano a 2 puntos.
- `RE_TRUCO`: sube a 3 puntos despues de aceptar truco.
- `VALE_CUATRO`: sube a 4 puntos despues de aceptar re-truco.

Cada aumento debe responderse con `QUIERO` o `NO_QUIERO`. Si un equipo rechaza, el otro cobra el ultimo valor aceptado: 1 al rechazar truco, 2 al rechazar re-truco y 3 al rechazar vale cuatro.

## Flor

La flor es opcional en la configuracion de partida y viene activada por defecto. Hay flor cuando las tres cartas son del mismo palo. El valor de la flor es 20 mas el valor de las tres cartas. La mejor flor vale 38.

La app soporta:

- `FLOR`: anuncia flor. Si no hay oposicion, da 3 puntos.
- Flor contraria: si el otro equipo tambien tiene flor, la mejor flor gana 4 puntos.
- `CONTRAFLOR`: sube la disputa de flor a 6 puntos; rechazarla da 4.
- `CONTRAFLOR_AL_RESTO`: sube al valor al resto calculado por el tanteador; rechazarla da 6.
- `ACHICO`: permite achicarse cuando corresponde y da 3 puntos al rival.

Un jugador que tiene flor debe resolverla antes de acceder a opciones normales de envido.

## Mazo

`MAZO` significa irse al mazo. Al hacerlo, dejas de pelear esa mano o el envite actual. Los puntos entregados dependen de lo que ya estaba aceptado o de la disputa activa.

## Pica-pica

El pica-pica existe solo en partidas de 6 jugadores. Empieza cuando algun equipo llega a `ceil(matchPoint * 0.5)`. Desde ahi, las manos alternan entre pica-pica y manos normales.

En un turno de pica-pica se juegan tres mini-manos mano a mano con parejas fijas de asientos enfrentados: jugador 0 contra 3, jugador 1 contra 4 y jugador 2 contra 5. La rotacion de dador y mano sigue igual. Si algun jugador abandona la partida, el pica-pica termina definitivamente para esa partida.
