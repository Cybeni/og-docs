# Mines

## :bomb: Important Design Overviews
### Grid Schema
The Mines game board is visually presented as a square grid of tiles, but internally, the engine represents this grid as a flattened one-dimensional array. This design choice simplifies the game logic and data structures, as there is no functional need to handle the tiles as a two-dimensional matrix.

For example, in a 5x5 grid:
- Index `0` represents the top-left tile.
- Index `4` is the top-right tile.
- Index `5` is the first tile on the second row, and so on.

Each tile in this array is either a `Bomb` or a `Diamond`. Every Tile object has two properties:
- `location`: an integer indicating its index in the array.
- `picked`: a boolean flag indicating whether the tile has been revealed by the player.

This linear representation streamlines both the server-side game logic and the schema definitions used for state updates and communication.

### Note on game state

Unlike limbo and dice, this game has a state, as the player can stop in the middle of a round and come back and continue. This makes it more important that on game load, the frontend first checks for `RoundState` and if the engine response back with a state, **this state has to be replicated on the frontend & displayed for the user**


Below are all the possible actions available for Mines. A Mines game round always starts with `Bet` or `Autobet` action:

```json:no-line-numbers
["Bet", "PickTile", "CashOut", "Autobet", "NewBet", "EndAutobet"]
```

## Bet

**Request:**

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Bet",
    "gameId": "og-mines",
    "eventId": "asdf-asdf234-asdf",
    "data": {
        "betAmount": 52.5,
        "maxBombs": 2,
        "maxTiles": 25
    }
}
```

::: tip for details about **non mines-specific** fields see [websocket guide](/api-docs/websocket-guide.md)
:::

| Field Name | Type | Required | Default |  Description|
|----|---|---|----- |---|
| `betAmount` | float | yes | 0 |  The amount the user wants to bet for that hand | 
| `maxBombs` | float | yes |  | This is the user selected amount of bombs to put in the round |
| `maxTiles` | string | yes | | This is the total number of mines/tiles the user selected. It can either be **25** (5x5), **36** (6x6), **49** (7x7) or **64** (8x8)| 

If betAmount is set to 0 this is considered a round of "free play". This is only allowed provided that the bet limits configured via the engine's CMS have a "min bet limit" down to zero. Check out [how to retrieve the bet limits from CMS](/api-docs/http-guide/game-configs.md)

#### Response `Update`:
```json:no-line-numbers
{
    "action": "Bet",
    "eventType": "RoundUpdate",
    "eventId": "asdf-asdf234-asdf",
    "data": {
        "nextActions": [
            "PickTile"
        ],
        "currentProfit": "0",
        "currentMultiplier": 0,
        "nextProfit": "0.0008",
        "nextMultiplier": 1.08
    },
    "roundId": "b65e0348-b2c5-4152-abe7-9ef7da751a81",
    "balance": 90.61206688468877,
    "gameId": "og-mines"
}
```

| Field Name | Type | Required | Default |  Description|
|----|---|---|----- |---|
| `currentProfit` | float | yes | 0 |  the net profit the user will win if they cashout. **Note: it is `0` immediately after betting as they cannot cashout before picking at least one tile** | 
| `currentMultiplier` | float | yes |  | This is the user final multiplier if they cashout at this stage of the round |
| `nextProfit` | string | yes | | This is the profit the user can potentially win, if they pick a diamond next, and cashout | 
| `nextMultiplier` | string | yes | |This is the user's multiplier if they pick a diamond next, and cashout | 



## PickTile

**Request:**

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "PickTile",
    "gameId": "og-mines",
    "eventId": "pickTile-id-1",
    "data": {
        "currentPicks": [2]
    }
}
```

| Field Name | Type | Required | Default |  Description|
|----|---|---|----- |---|
| `currentPicks` | int | yes | | This is an **array** of tile indices which the user selects to open |


:::info Important 
For manual betting, `currentPicks` is ALWAYS an array of **length 1**. The reason why its an array becomes clearer when implementing autobetting. 
:::

**Response: (if a tile picked is :gem:)**
```json:no-line-numbers
{
    "action": "PickTile",
    "eventType": "RoundUpdate",
    "eventId": "pickTile-id-1",
    "data": {
        "nextActions": [
            "PickTile",
            "CashOut"
        ],
        "currentProfit": "0.0008",
        "currentMultiplier": 1.08,
        "nextProfit": "0.0017",
        "nextMultiplier": 1.17
    },
    "roundId": "3c136357-79af-48d5-9e47-75c42d0b7d9f",
    "gameId": "og-mines"
}
```

- Same as with the `Bet` response, engine will respond with **current Profit** (if user cashes out) & **next profit** if user picks a new tile
- No other information is needed other than the next possible actions, as the frontend already knows which tile the user picked and can expose a dimond there accordingly.


**Response: (if tile picked is :bomb:)**
```json:no-line-numbers
{
    "action": "PickTile",
    "eventType": "RoundUpdate",
    "eventId": "pickTile-id-1",
    "data": {
        "nextActions": [],
        "bombs": [
            {
                "Picked": false,
                "Location": 21
            },
            {
                "Picked": true,
                "Location": 2
            },
        ],
        "payout": "0",
        "outcome": "loss",
        "roundEnded": true
    },
    "roundId": "60b7aea9-e291-4908-aa2d-85fcbd9f763a",
    "balance": 90.61366688468878,
    "gameId": "og-mines"
}
```

As the round ends (with a loss) when a bomb is picked, the engine exposes **ALL** the bombs including the one the user **picked**. By default the rest of the tiles are the diamonds.

:::info 
The Frontend can distinguish visually between a **picked** and **unpicked** bomb based on the `picked` field.
:::

## CashOut

**Request:**
```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "CashOut",
    "gameId": "og-mines",
    "eventId": "cashout-id-1",
    "data": {}
}
```

No `data` required as this notifies the engine that user ended the round 


**Response:**
```json:no-line-numbers
{
    "action": "CashOut",
    "eventType": "RoundUpdate",
    "eventId": "cashout-id-1",
    "data": {
        "nextActions": [],
        "bombs": [
            {
                "picked": false,
                "location": 0
            },
            {
                "picked": false,
                "location": 18
            }
        ],
        "diamonds": [
            {
                "picked": true,
                "location": 24
            }
        ],
        "payout": "0.0108",
        "outcome": "win",
        "roundEnded": true
    },
    "roundId": "3c136357-79af-48d5-9e47-75c42d0b7d9f",
    "balance": 90.62366688468877,
    "gameId": "og-mines"
}
```

:::info Note The engine exposes the full grid once the user decides to cashout. I.e. engine returns the location of the bombs (the rest of the tiles are by default diamonds)
:::

| Field Name | Type | Required | Default |  Description|
|----|---|---|----- |---|
| `bombs` | int | yes | | an array of the `bomb` object |
| `bombs.picked` | int | yes | | a boolean field stating if the bomb has been selected or not |
| `bombs.location` | int | yes | | an integer representing the index/position of the bomb in the array of tiles |
| `outcome` | int | yes | | string either `win` or `loss` |
| `payout` | int | yes | | The total amount including the bet amount to be given to player |



:::note Both `bomb` and `diamond` have the exact same `tile` schema.
:::





## Autobet

This is a feature where the player can decide to play N bets in a row automatically. 

#### Request `Action`:
```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Autobet",
    "gameId": "og-mines",
    "eventId": "autobet-id-1",
    "data": {
        "betAmount": 0.001,
        "maxBombs": 3,
        "maxTiles": 25,
        "currentPicks": [10, 12],
        "onWin": 0,
        "onLoss": 0,
        "stopOnProfit": 0,
        "stopOnLoss": 0,
        "autobetMax": 3
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


:::info Note
- That if `stopOnProfit` or `stopOnLoss` are either set to 0 or not included in the event message, that means these features are not used in the autobet
- Same goes for `onWin` & `onLoss`. 0 value (or ommitted) means the **bet resets** to the originl value with each bet in autobetting
:::


#### Response `Update` when hitting a :bomb:

```json:no-line-numbers
{
    "action": "Autobet",
    "eventType": "RoundUpdate",
    "eventId": "autobet-id-1",
    "data": {
        "nextActions": [
            "NewBet",
            "EndAutobet"
        ],
        "bombs": [
            {
                "Picked": true,
                "Location": 10
            },
            {
                "Picked": false,
                "Location": 15
            },
            {
                "Picked": true,
                "Location": 10
            }
        ],
         "diamonds": [
            {
                "picked": true,
                "location": 12
            }
        ],
        "payout": "0",
        "outcome": "loss",
        "roundEnded": true
    },
    "roundId": "01ecdebb-f59c-44e4-baaf-440b7f5cfbc7",
    "balance": 90.61266688468878,
    "gameId": "og-mines"
}
```
| Field Name | Type  | Description|
|----|---|-----|
| `autobetCount` | int | A counter incremented on each bet placed in `Autobet` | 
| `autobetPayout` | float | This  tallies up the total payout given to player for all the bets placed|
| `roundEnded` | int | This is the total number of bets to place in a row. 0 means infinite |

:::info Note:
- The bet immediately settles in a win or a loss.
- The engine gives out all the locations of the bombs and shows which ones were picked
- The rest of the tiles are automatically diamonds by default. The only diamonds in the output results will be the ones picked during the autobet
:::

So by triggering `Autobet`
- The engine starts the **first bet**
- `autobetCount` is incremented by 1
- The first round ends showing the payout and the generated multiplier.


**response `update`: user winning the bet**

```json:no-line-number
{
    "action": "NewBet",
    "eventType": "RoundUpdate",
    "eventId": "newbet-1d4dddddd",
    "data": {
        "nextActions": [
            "NewBet",
            "EndAutobet"
        ],
        "bombs": [
            {
                "picked": false,
                "location": 4
            },
            {
                "picked": false,
                "location": 11
            },
            {
                "picked": false,
                "location": 14
            }
        ],
        "diamonds": [
            {
                "picked": true,
                "location": 10
            },
            {
                "picked": true,
                "location": 12
            }
        ],
        "payout": "0.00129",
        "outcome": "win",
        "nextBetAmount": "0.001",
        "autobetPayout": "0.00645",
        "autobetAmount": "0.007",
        "autobetCount": "7",
        "roundEnded": true
    },
    "roundId": "d9dacab8-7d2b-4ff8-a2ec-373e05ffda88",
    "balance": 90.60798688468878,
    "gameId": "og-mines"
}
```