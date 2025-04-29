# Dice

Below is a all the possible actions available for Dice. A Dice game round always starts with `Bet` or `Autobet` action:

```json:no-line-numbers
["Bet", "Autobet", "NewBet", "EndAutobet"]
```

## Bet

**Request:**

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Bet",
    "gameId": "og-dice",
    "eventId": "<some-event-uuid>",
    "data": {
        "betAmount": 52.5,
        "rollThreshold": 1.51,
        "overOrUnder": "Under"
    }
}
```

::: tip for details about **non dice-specific** fields see [websocket guide](/api-docs/websocket-guide.md)
:::

| Field Name | Type | Required | Default |  Description|
|----|---|---|----- |---|
| `betAmount` | float | yes | 0 |  The amount the user wants to bet for that hand | 
| `rollThreshold` | float | yes |  | This is the user selected roll value to play on |
| `overOrUnder` | string | yes | | The user selects if he wants to bet over the `rollThreshold` or under| 

If betAmount is set to 0 (or ommitted) this is considered a round of "free play". This is only allowed provided that the bet limits configured via the engine's CMS have a "min bet limit" down to zero. Check out [how to retrieve the bet limits from CMS](/api-docs/http-guide/game-configs.md)

#### Response `Update`:
```json:no-line-numbers
{
    "action": "Bet",
    "eventType": "RoundUpdate",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [],
        "multiplier": 1.0102,
        "diceResult": 49.3,
        "payout": "1.0102",
        "roundEnded": true
    },
    "roundId": "60ae872d-97fe-4b16-9987-76671025c498"
}
```

| Field Name | Type  | Description|
|----|----|-----|
| `diceResult` | float | The randomly generated dice value | 
| `payout` | float | The amount the player won |
| `multiplier` | float | The payout multiplier. (not needed for FE as FE calculates it own value. But it should be the same) |


## Autobet

This is a feature where the player can decide to play N bets in a row automatically. 

#### Request `Action`:
```json:no-line-numbers
{
	"eventType": "RoundAction",
	"action": "Autobet",
	"gameId": "og-dice",
    "eventId": "<some-event-uuid>",
	"data": {
        "betAmount": 1.2,
        "currency": "USD",
        "rollThreshold": 2.12,
        "overOrUnder": "Under",
        "autobetMax":0,
        "onWin": 0,
        "onLoss": 0,
        "stopOnProfit": 0,
        "stopOnLoss": 0
	}
}
```

| Field Name | Type | Required | Default | Description|
|----|---|---| ---- | -----|
| `betAmount` | float | yes |   | The amount the user wants to bet for that hand | 
| `currency` | string | yes | | The currency of the `betAmont` | 
| `rollThreshold` | float | yes |  | This is the user selected roll value to play on |
| `overOrUnder` | string | yes | | The user selects if he wants to bet over the `rollThreshold` or under| 
| `autobetMax` | int | no |  0 | This is the total number of bets to place in a row. 0 means infinite |
| `onWin`| float | no | 0 | A percentage of the `betAmount` to add to the next `betAmount` if round ends up in a **win** |
| `onLoss`| float | no | 0 | A percentage of the `betAmount` to add to the next `betAmount` if round ends up in a **loss**|
| `stopOnProfit`| float | no | 0 | The amount of **total net profit** needed upon which the autobet would stop |
| `stopOnLoss`| float | no | 0 | The amount of **net loss** needed upon which the autobet would stop |


:::info Note
- That if `stopOnProfit` or `stopOnLoss` are either set to 0 or not included in the event message, that means these features are not used in the autobet
- Same goes for `onWin` & `onLoss`. 0 value (or ommitted) means the **bet resets** to the originl value with each bet in autobetting
:::

#### Response `Update`:

```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Autobet",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [ "NewBet", "EndAutobet" ],
        "betAmount": "1.2",
        "autobetCount": 1,
        "diceValue": 1.23,
        "multiplier": 1.0102,
        "payout": "1.0102",
        "autobetPayout": "1.0102",
        "roundEnded": true
    },
    "roundId": "<some-round-id>"
}
```
| Field Name | Type  | Description|
|----|---|-----|
| `autobetCount` | int | A counter incremented on each bet placed in `Autobet` | 
| `autobetPayout` | float | This sums up the total payout given to player for **all the bets placed during autobetting**|
| `roundEnded` | int | This is the total number of bets to place in a row. 0 means infinite |


So by triggering `Autobet`
- The engine starts the **first bet**
- `autobetCount` is incremented by 1
- The first round ends showing the payout and the generated multiplier.

## NewBet
**The frontend should then automatically call `NewBet` which would trigger a new round with the same behavior:**

#### Request `Action`:
```json
{
	"eventType": "RoundAction",
	"action": "NewBet",
	"gameId": "og-dice",
    "eventId": "<some-event-uuid>",
	"data": {}
}
```

The client should wait for a response before triggering a new bet automatically: 

#### Response `Update`:

```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "NewBet",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [ "NewBet", "EndAutobet" ],
        "betAmount": "1.2",
        "autobetCount": 2,
        "diceValue": 1.36,
        "multiplier": 1.0102,
        "payout": "1.212",
        "autobetPayout": "2.424",
        "roundEnded": true

    },
    "roundId": "<some-round-uuid>"
}
```

- As you can see the `autobetCount` incremented by 1 again
- `autobetPayout` is keeping a total tally of total payouts for all rounds played in this autobet
- The `payout` always shows **the last round's payout**. it is not accumulating all rounds.

## EndAutobet
At any point the user might want to stop the Autobet mid-way. Frontend should send `EndAutobet` when that happens.

#### Request `Action`: 
```json:no-line-numbers
{
	"eventType": "RoundAction",
	"action": "EndAutobet",
	"gameId": "og-dice",
    "eventId": "<some-event-uuid>",
	"data": {}
}
```

#### Respose `Update`:
```json
{
    "eventType": "RoundUpdate",
    "action": "EndAutobet",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [],
        "autobetPayout": "0",
        "roundEnded": true
    },
    "roundId": "<some-round-id>"
}
```

:::warning Note
 `EndAutobet` should only be triggered on user deciding to stop the autobet manually. If the `autobetMax` is set to 5 and 5 rounds have been played, the engine closes the autobet automatically
:::

## Full Round State Example

```json
{
    "type": "RoundState",
    "roundId": "<some-round-id>",
    "data": {
        "action": "Autobet",
        "nextActions": [ "NewBet", "EndAutobet" ],
        "betAmount": "1.2",
        "originalBetAmount": "1.2",
        "autobetMax": 0,
        "autobetCount": 1,
        "multiplier": "1.01",
        "onWin": "0",
        "onLoss": "0",
        "stopOnProfit": "0",
        "stopOnLoss": "0",
        "diceValue": 61.03,
        "overOrUnder": "Over",
        "rollThreshold": 40.10,
        "payout": "1.212",
        "autobetPayout": "1.212",
        "roundEnded": true,
        "lastBetStatus": "win",
        "autobetAmount": "1.2"
    },
    "eventId": "<some-event-uuid>"
}
```

Fields not yet described:

| Field Name | Type  | Description|
|----|---|-----|
| `lastBetStatus` | int | This shows the outcome status of the previous bet. (it is useful for the backend to know the previous round in order to calculate the new bet amount if increase by was included.) | 
| `autobetAmount` | This  tallies up the total bets placed till this point in the autobet |
| `originalBetAmount` | int | This is first bet placed by player when triggereing the autobet.  |

:::info `originalBetAmount` is needed to be saved in memory in case the `betAmount` changes due to onWin and onLoss and thus needed to be reset to originl bet
:::


## Infinite Autobetting while user closes tab

It is **important** to note that when `autobetMax` is set to 0 (infinite) the player might close the browser tab before manually stopping the autobet. In this scenario the engine will be left with an open game waiting for the player to come back and continue autobetting. For a better user experience, the frontend should trigger `EndAutobet` **when the user logs back in to continue playing**. This is easily done since the frontend **always** checks `RoundState` when user comes back into any game. So if `RoundState` event responds with ` "nextActions": [ "NewBet", "EndAutobet" ]`, then FE should automatically trigger `EndAutobet`. So user can start playing new rounds.

::: tip To recap the flow for this scenario: 

1. User starts an infinite Autobet (FE triggers `Autobet` action)
2. FE triggers N bets with `NewBet` (one at a time)
3. Player closes browser tab
4. Player comes back in later
5. FE sends `Authenticate`
6. FE sends `RounState` and finds an ongoing `Autobet`
7. FE sends `EndAutobet` immediately
8. User is presented with a clean new dice game.
:::