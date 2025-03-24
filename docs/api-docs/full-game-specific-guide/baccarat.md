# Baccarat

Below is a all the possible actions available for Baccarat. A Baccarat game round always starts with `Bet` or `Autobet` action:

```json:no-line-numbers
["Bet", "Autobet", "NewBet"]
```

## Bet

#### Request `Action`:
```json:no-line-numbers
    {
        "eventType": "RoundAction",
        "action": "Bet",
        "gameId": "og-baccarat",
        "roundId": "<some-round-id>",
        "eventId": "<some-event-id>",
        "data": {
            "playerBetAmount": 16.788,
            "bankerBetAmount": 0,
            "tieBetAmount": 0,
            "dragon7BetAmount": 0,
            "pandaBetAmount":0
        }
    }
```
::: tip for details about non baccarat-specific fields see [websocket guide](/api-docs/websocket-guide.md)
:::

| Field | Type | Required | Default | Descripion |
| ----- | ----- | ----- | ----- | ----- |
|`playerBetAmount`| float| no | 0 | This is the bet amount when user wants to bet on the player hand |
|`bankerBetAmount`| float| no | 0 | This is the bet amount when user wants to bet on the banker hand |
|`tieBetAmount`| float| no | 0 | This is the bet amount when user wants to bet on the outcome being a tie |
|`dragon7BetAmount`| float| no | 0 | This is the bet amount when user wants to bet on dragon 7 sidebet |
|`pandaBetAmount`| float| no | 0 | This is the bet amount when user wants to bet on panda sidebet |

The above are all optional for the user to decide on what to bet on. If **ALL** of the above bets are set to 0 (or ommitted) this is considered a round of "free play". This is only allowed provided that the bet limits configured via the engine's CMS have a "min bet limit" down to zero. Check out [how to retrieve the bet limits from CMS](/api-docs/http-guide/game-configs.md)


#### Response `Update`: 

```json:no-line-numbers
{
    "action": "Bet",
    "eventType": "RoundUpdate",
    "eventId": "<some-event-uuid>",
    "data": {
        "action": "Bet",
        "nextActions": [],
        "playerBetAmount": "16.788",
        "bankerBetAmount": "0",
        "tieBetAmount": "0",
        "dragon7BetAmount": "0",
        "pandaBetAmount": "0",
        "bankerHand": {
            "cards": [
                { "value": 7, "suit": 2, "index": 6 },
                { "value": 0, "suit": 1, "index": 9 }
            ],
            "handValue": 7
        },
        "playerHand": {
            "cards": [
                { "value": 2, "suit": 1, "index": 1 },
                { "value": 0, "suit": 3, "index": 10 },
                { "value": 1, "suit": 2, "index": 0 }
            ],
            "handValue": 3
        },
        "totalPayout": "0",
        "roundEnded": true,
        "dragon7Sidebet": {
            "payout": "0"
        },
        "pandaSidebet": {
            "payout": "0"
        },
    },
    "roundId": "<some-round-id>"
}
```

| Field | Type | Description | 
| ----- | ----- | -----  |
| `handValue` | int | This is the sum of the cards in hand based on the baccarat rules |
| `bankerHand` | object | This will contain the banker's final set of cards as well as their `handValue`|
| `playerHand` | object | This will contain the players's final set of cards as well as their `handValue`|
| `dragon7Sidebet` | object | This will contain the outcome of the dragon 7 sidebet. namely the `status` and the `payout`|
| `pandaSidebet` | object | This will contain the outcome of the panda sidebet. namely the `status` and the `payout`|

::: tip For a description of the `Card` object schema see [the blackjack card object explanation](../full-game-specific-guide/blackjack.md#the-card-object).
The schema is identical to blackjack, the only difference is in the values. Baccarat `ten`, `jack`, `queen` & `king` have a `value` of 0 and `Ace` always has a value of 1
:::

The `Bet` update response always settles the round and will contain `totalPayout` value, which is any winnings from betting on player or banker. And will contain also the `sidebet.payout` values for sidebet winnings. 

#### List of possible sidebet statues

- **Dragon 7:** `["sidebetLost", "sidebetWon"]`
- **Panda:** `["sidebetLost", "sidebetWon"]`


## Autobet

This is a feature where the player can decide to play N bets in a row automatically. 

#### Request `Action`:

```json:no-line-numbers
{
	"eventType": "RoundAction",
	"action": "Autobet",
	"gameId": "og-baccarat",
    "eventId": "<some-event-uuid>",
	"data": {
        "playerBetAmount": 16.788,
        "bankerBetAmount": 0,
        "tieBetAmount": 0,
        "dragon7BetAmount": 0,
        "pandaBetAmount":0,
        "autobetMax":0,
        "onWin": 0,
        "onLoss": 0,
        "stopOnProfit": 0,
        "stopOnLoss": 0
	}
}
```
::: note The 5 bet amounts are exactly the same as in `Bet` action
:::

| Field Name | Type | Required | Default | Description|
| ----------- | ----------- | ----------- | ----------- | ----------- |
| `autobetMax` | int | no |  0 | This is the total number of bets to place in a row. 0 means infinite |
| `onWin`| float | no | 0 | A percentage of the total bet amount to add to the next total bet amount if round ends up in a **win** |
| `onLoss`| float | no | 0 | A percentage of the total bet amount to add to the next total bet amount if round ends up in a **loss**|
| `stopOnProfit`| float | no | 0 | The amount of **total net profit** needed upon which the autobet would stop |
| `stopOnLoss`| float | no | 0 | The amount of **net loss** needed upon which the autobet would stop |


:::info Note
- That if `stopOnProfit` or `stopOnLoss` are either set to 0 or not included in the event message, that means these features are not used in the autobet
- Same goes for `onWin` & `onLoss`. 0 value (or ommitted) means the **bet resets** to the originl value with each bet in autobetting
:::


#### Response `Update`:


```json:no-line-numbers
{
    "action": "Autobet",
    "eventType": "RoundUpdate",
    "eventId": "<some-event-uuid>",
    "data": {
        "action": "Autobet",
        "nextActions": [ "NewBet" ],
        "bankerHand": {
            "cards": [
                { "value": 7, "suit": 2, "index": 6 },
                { "value": 0, "suit": 3, "index": 12 }
            ],
            "handValue": 7
        },
        "playerHand": {
            "cards": [
                { "value": 0, "suit": 0, "index": 12 },
                { "value": 7, "suit": 3, "index": 6 }
            ],
            "handValue": 7
        },
        "totalPayout": "1",
        "dragon7Sidebet": { "payout": "0" },
        "pandaSidebet": { "payout": "0" },
        "autobetMax": 0,
        "autobetCount": 1,
        "autobetPayout": "1",
        "autobetAmount": "1",
    },
    "roundId": "<some-round-id>"
}
```

| Field Name | Type  | Description|
|----|---|-----|
| `autobetCount` | int | A counter incremented on each bet placed in `Autobet` | 
| `autobetPayout` | float |  This  tallies up the total payout given to player for all the bets placed|
| `roundEnded` | int | This is the total number of bets to place in a row. 0 means infinite |
| `autobetAmount` | float |  This tallies up the total bet amount placed for all the rounds in during autobetting |


So by triggering `Autobet`
- The engine starts the **first bet**
- `autobetCount` is incremented by 1
- The first round ends showing the totalPayout and the hands outcomes.



## NewBet
**The frontend should then automatically call `NewBet` which would trigger a new round with the same behavior:**
The client should wait for a response before triggering a new bet automatically: 

#### Request `Action`:
```json
{
	"eventType": "RoundAction",
	"action": "NewBet",
	"gameId": "og-baccarat",
    "eventId": "<some-event-uuid>",
	"data": {}
}
```

#### Response `Update`:
```json:no-line-numbers
{
    "action": "NewBet",
    "eventType": "RoundUpdate",
    "eventId": "<some-event-uuid>",
    "data": {
        "action": "NewBet",
        "nextActions": [ "NewBet" ],
        "bankerHand": {
            "cards": [
                { "value": 3, "suit": 0, "index": 2 },
                { "value": 3, "suit": 0, "index": 2 }
            ],
            "handValue": 6
        },
        "playerHand": {
            "cards": [
                { "value": 7, "suit": 2, "index": 6 },
                { "value": 7, "suit": 1, "index": 6 },
                { "value": 1, "suit": 2, "index": 0 }
            ],
            "handValue": 5
        },
        "totalPayout": "0",
        "dragon7Sidebet": { "payout": "0" },
        "pandaSidebet": { "payout": "0" },
        "autobetMax": 0,
        "autobetCount": 2,
        "autobetPayout": "1",
        "autobetAmount": "2",
    },
    "roundId": "<some-round-id>"
}
```

::: note These are the same exact fields output as the Autobet `update` response
:::

- As you can see the `autobetCount` incremented by 1 again
- `autobetPayout` is keeping a total tally of total payouts for all rounds played in this autobet
- The `totalPayout` always shows **the last round's payout**. it is not accumulating all rounds.


## Full Round State Example

```json:no-line-numbers
{
    "eventType": "RoundState",
    "roundId": "<some-round-id>",
    "data": {
        "action": "Autobet",
        "nextActions": [ "NewBet" ],
        "playerBetAmount": "1",
        "bankerBetAmount": "0",
        "tieBetAmount": "0",
        "dragon7BetAmount": "1",
        "pandaBetAmount": "1",
        "originalPlayerBetAmount": "1",
        "originalBankerBetAmount": "0",
        "originalTieBetAmount": "0",
        "originalDragon7BetAmount": "0",
        "originalPandaBetAmount": "0",
        "totalBetAmount": "1",
        "bankerHand": {
            "cards": [
                { "value": 3, "suit": 0, "index": 2 },
                { "value": 3, "suit": 0, "index": 2 }
            ],
            "handValue": 6
        },
        "playerHand": {
            "cards": [
                { "value": 7, "suit": 2, "index": 6 },
                { "value": 7, "suit": 1, "index": 6 },
                { "value": 1, "suit": 2, "index": 0 }
            ],
            "handValue": 5
        },
        "totalPayout": "0",
        "dragon7Sidebet": { "status": "sidebetLost", "payout": "0" },
        "pandaSidebet": { "status": "sidebetLost", "payout": "0" },
        "autobetMax": 0,
        "autobetCount": 1,
        "onWin": "0",
        "onLoss": "0",
        "stopOnProfit": "0",
        "stopOnLoss": "0",
        "autobetPayout": "0",
        "autobetAmount": "1",
        "lastBetStatus": "loss"
    },
    "eventId": "<some-event-uuid>"
}
```

Fields not yet described:

| Field Name | Type  | Description|
|----|---|-----|
| `lastBetStatus` | int | This shows the outcome status of the last bet placed | 
| `autobetAmount` | This  tallies up the total bets placed till this point in the autobet |
| `totalBetAmount` | float | This is a tally of all the bets (player, banker tie, panda & dragon7) for the current round |
| `originalPlayerBetAmount` | float | This is the first bet placed by user when triggering the autobet.|
| `originalBankerBetAmount` | float | This is the first bet placed by user when triggering the autobet.|
| `originalTieBetAmount` | float | This is the first bet placed by user when triggering the autobet.|
| `originalDragon7BetAmount` | float | This is the first bet placed by user when triggering the autobet.|
| `originalPandaBetAmount` | float | This is the first bet placed by user when triggering the autobet.|

:::info The original bet amounts are needed to be saved in memory in case these change due to `onWin` and `onLoss` feature. And Thus needed to be reset to originl bet
:::