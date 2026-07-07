# Trucoshi Truco Rules

This rulebook explains the version of Argentinian Truco implemented in Trucoshi. It keeps the traditional structure of truco, envido, and flor, but only describes the player counts and scoring rules supported by the app.

## Players and Teams

Trucoshi supports matches with 2, 4, or 6 players. There are always two teams. In 2-player matches it is one against one. In 4-player matches it is two pairs. In 6-player matches each team has three players and pica-pica can appear later in the match.

Each player receives three cards from a Spanish 40-card deck. The player after the dealer is mano and starts the first trick. Later tricks are started by the winner of the previous trick, except when a trick is tied.

## Match Score

A match has a configurable `matchPoint`, with 9 as the default in Trucoshi. Points fill malas first and then buenas. A team wins when it reaches `matchPoint` buenas.

A hand with no accepted truco is worth 1 point. Truco, envido, and flor can add or replace that value depending on what was accepted or declined.

## Card Strength for Tricks

{{CARD_RANKING}}

The highest card wins the trick. If the highest cards are tied between opposing teams, the trick is tied. If all three tricks are tied, mano wins the hand.

## Envido

Envido is a point bet about the cards in your hand, usually before cards have been played.

Card values for envido and flor are their number, except 10, 11, and 12 count as 0. If you have two cards of the same suit, your envido is 20 plus those two values. If all cards have different suits, your envido is the value of your highest card.

The possible envido calls are:

- `ENVIDO`: 2 points if accepted.
- A second `ENVIDO`: adds 2 more points.
- `REAL_ENVIDO`: adds 3 points.
- `FALTA_ENVIDO`: its value follows the match option used by the backend.

If envido is declined, the caller scores the previously accepted value. If it was the first call, declining gives 1 point. If envido is accepted, players declare their points; the highest value wins, and ties favor the player closest to mano.

## Truco

Truco is the bet on who wins the hand of tricks. Without truco, the hand is worth 1 point.

The truco ladder is:

- `TRUCO`: raises the hand to 2 points.
- `RE_TRUCO`: raises it to 3 points after truco was accepted.
- `VALE_CUATRO`: raises it to 4 points after re-truco was accepted.

Each raise must be answered with `QUIERO` or `NO_QUIERO`. If a team declines, the other team scores the last accepted value: 1 after rejecting truco, 2 after rejecting re-truco, and 3 after rejecting vale cuatro.

## Flor

Flor is optional in match settings and enabled by default. A player has flor when all three cards are the same suit. Flor value is 20 plus the values of all three cards. The best flor is 38.

The app supports:

- `FLOR`: announces flor. Unopposed flor gives 3 points.
- Opposing flor: if another team also has flor, the best flor wins 4 points.
- `CONTRAFLOR`: raises the flor contest to 6 points; declining gives 4.
- `CONTRAFLOR_AL_RESTO`: raises to the rest value computed by the match score; declining gives 6.
- `ACHICO`: gives up the flor contest when allowed, giving 3 points to the opponent.

A player who has flor must resolve flor before normal envido options are available.

## Mazo

`MAZO` means folding. When you go to mazo, you stop fighting that hand or current contest. The points awarded depend on what has already been accepted or what contest is active.

## Pica-Pica

Pica-pica only exists in 6-player matches. It starts once any team reaches `ceil(matchPoint * 0.5)`. From there, hands alternate between pica-pica and normal hands.

During a pica-pica turn, three one-on-one mini-hands are played with fixed opposite-seat pairs: player 0 vs 3, player 1 vs 4, and player 2 vs 5. Dealer and mano rotation continue normally. If any player abandons the match, pica-pica ends permanently for that match.
