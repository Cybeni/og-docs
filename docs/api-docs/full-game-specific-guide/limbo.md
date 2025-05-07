# Limbo

Below is a all the possible actions available for Limbo. A Limbo game round always starts with `Bet` or `Autobet` action:

```json:no-line-numbers
["Bet", "Autobet", "NewBet", "EndAutobet"]
```

## Bet

**Request:**

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Bet",
    "gameId": "og-limbo",
    "eventId": "<some-event-uuid>",
    "data": {
        "betAmount": 52.5,
        "multiplier": 1.51,
        "currency": "USD"
    }
}
```

::: tip for details about non limbo-specific fields see [websocket guide](/api-docs/websocket-guide.md)
:::

| Field Name | Type | Required | Default |  Description|
|----|---|---|----- |---|
| `betAmount` | float | yes | 0 |  The amount the user wants to bet for that hand | 
| `multiplier` | float | yes |  | This is the user selected multiplier to play on |
| `currency` | string | yes | | The currency of the `betAmont` | 

If betAmount is set to 0 (or ommitted) this is considered a round of "free play". This is only allowed provided that the bet limits configured via the engine's CMS have a "min bet limit" down to zero. Check out [how to retrieve the bet limits from CMS](/api-docs/http-guide/game-configs.md)

#### Response `Update`:
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Bet",
    "eventId": "<some-event-uuid>",
    "roundId": "<some-round-uuid>",
    "data": {
        "nextActions": [],
        "generatedMultiplier": 2.11,
        "payout": "79.27",
        "autobetPayout": "0",
        "roundEnded": true
    },
}
```

| Field Name | Type  | Description|
|----|----|-----|
| `generatedMultiplier` | float | The randomly generated value by the engine | 
| `payout` | float | The amount the player won |

::: info Note 
- As per the limbo game design, if the `generatedMultiplier` is above the `multiplier` chosen by user, than the payout = betAmount * multiplier
- `autobetPayout` can be ignored (it is only useful for autobetting see next section)
:::


## Autobet

This is a feature where the player can decide to play N bets in a row automatically. 

#### Request `Action`:
```json:no-line-numbers
{
	"eventType": "RoundAction",
	"action": "Autobet",
	"gameId": "og-limbo",
    "eventId": "<some-event-uuid>",
	"data": {
        "betAmount": 1.2,
        "currency": "USD",
        "multiplier": 1.01,
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
| `multiplier` | float | yes |  | This is the user selected multiplier to play on
| `autobetMax` | int | no |  0 | This is the total number of bets to place in a row. 0 means infinite |
| `onWin`| float | no | 0 | A percentage of the `betAmount` to add to the next `betAmount` if round ends up in a **win** |
| `onLoss`| float | no | 0 | A percentage of the `betAmount` to add to the next `betAmount` if round ends up in a **loss**|
| `stopOnProfit`| float | no | 0 | The amount of **total net profit** needed upon which the autobet would stop |
| `stopOnLoss`| float | no | 0 | The amount of **net loss** needed upon which the autobet would stop |
| `currency` | string | yes | | The currency of the `betAmont` | 


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
        "generatedMultiplier": 1.23,
        "payout": "1.212",
        "autobetPayout": "1.212",
        "roundEnded": true
    },
    "roundId": "<some-round-id>"
}
```
| Field Name | Type  | Description|
|----|---|-----|
| `autobetCount` | int | A counter incremented on each bet placed in `Autobet` | 
| `autobetPayout` | float | This  tallies up the total payout given to player for all the bets placed|
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
	"gameId": "og-limbo",
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
        "generatedMultiplier": 1.36,
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
	"gameId": "og-limbo",
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
        "generatedMultiplier": 61.03,
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
| `lastBetStatus` | int | This shows the outcome status of the last bet placed | 
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
8. User is presented with a clean new limbo game.
:::


## Error Codes
:::note
other global error codes are described in [websocket guide](/api-docs/websocket-guide.md)
:::



| Err Code | Received From | Description | 
| -------- | ------------- | ----------- |
| INVALID_MULTIPLIER | RoundState |  thrown if input multiplier is outside desired range|
