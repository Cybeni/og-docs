---
next: "/api-docs/full-game-specific-guide/limbo.md"
---
# Blackjack

This is a list of all possible actions for blackjack
```json:no-line-numbers
["Bet", "Split", "Hit", "Double", "Stand", "Surrender", "Peek"]
```

## Bet

#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Bet",
    "gameId": "og-blackjack",
    "eventId": "<some-event-uuid>",
    "data": {
        "betAmount": 52.5,
        "perfecPairsBetAmount": 35.5,
        "pokerBetAmount": 21.4
    }
}
```
::: tip for details about non blackjack-specific fields see [websocket guide](/api-docs/websocket-guide.md)
:::

| Field Name | Type | Required | Description|
|----|---|---|-----|
| `betAmount` | float | yes | The amount the user wants to bet for that hand | 
| `perfecPairsBetAmount` | float | no | This is the bet amount for the perfect pairs side bet|
| `pokerBetAmount` | float | no | This is the bet amount for the "21+1" side bet|

If betAmount is set to 0 (or ommitted) this is considered a round of "free play". This is only allowed provided that the bet limits configured via the engine's CMS have a "min bet limit" down to zero. Check out [how to retrieve the bet limits from CMS](/api-docs/http-guide/game-configs.md)

#### Response `Update`:

```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Bet",
    "roundId": "<current-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": ["Hit", "Stand", "Double", "Surrender", "Split"],
        "handIndex": 0,
        "handOwner": "Player",
        "dealerHand": {
            "cards": [
                {"value": 8, "suit": 2, "index": 7}
            ]
        },
        "playerHands": [
            {
                "cards": [
                    {"value": 10, "suit": 2, "index": 9 },
                    {"value": 10, "suit": 2, "index": 9 }
                ],
                "betAmount": "52.5"
            }
        ],
        "perfectPairs": {
            "payout": "887.5",
            "status": "perfectPair"
        },
        "poker": {
            "payout": "85.6",
            "status": "flush"
        }
    }
}
```

| Field Name | Type | Description |
|----|---|---|
| `dealerHand` | object | This contains the hand that was dealt to the dealer during `Bet`|
| `playerHands` | list | This contains the hand that was dealt to the player during `Bet`. |
| `handOwner` | string | This signals which hand is supposed to take the next action. Either the `Dealer` or the `Player`|
| `handIndex` | int | This is the index of the hand that is supposed to take the action next.|
| `perfectPairs` | object | This object will output the status and payout of the perfect pairs sidebet (if user opted in)|
| `poker` | object | This object will output the status and payout of the 21+1 sidebet (if user opted in) |

#### List of possible sidebet statues

- **Perfect Pairs:**
    ```json:no-line-numbers
    ["perfectPair", "colouredPair", "mixedPair", "sidebetLost"]
    ```
- **21+1 (poker) Sidebet:**
    ```json:no-line-numbers
    ["suitedTrips", "straightFlush", "threeOfAKind", "straight", "flush", "sidebetLost"]
    ```

::: info Notes
- `playerHands` is a list of "hand" objects. This is because due to splits, a user can end up having multiple hands. This is why `handIndex` is an important field. Because we want to keep track of which player hand is sending events. 
- The `betAmount` is moved from the global object into each player hand element. This is because a user might decide to double down on one split hand but keep the other hand with the same bet amount.
- The dealer only has one card, That is because the other card is "face down" in the game so it is not yet exposed to the client. It is however, already generated and saved in the game state.
- `handIndex` value starts from the highest hand and moves down to `0` as the final hand to play (when user has decided to `Split`)
:::


If the dealer's face up card is an Ace then the `nextActions` field will only be:
```json:no-line-numbers
 "nextActions": ["Peek"],
 ```
 This means that the dealer will have to "peek" on his second card before the round can continue. The player should be presentd with the option to insure their hand when user Peeks. See the [Peek action](#peek) on what the Peek request payload looks like (including insurance).

## The `Card` object

Each **hand**, (whether the dealer's or one of the player's) will have a `cards` object which is a list of cards for that hand. Each Card will **always** have the following format: 
```json:no-line-numbers
{"value": 9, "suit": 0, "index": 8}
```

- The `value` is the card's value in blackjack. This ranges from 1 to 10.
    - Ace always shows up as 1. (The backend takes care of when it should be used as 1 or 11)
    - The face cards (Jake, Queen & King) each have a value of 10.
    ```:no-line-numbers
    Ace = 1, Two = 2, Three = 3, ... Jack = 10, Queen = 10, King = 10
    ```
- The `suit` is 'Hearts', 'Diamonds', 'Clubs', 'Spades' but in their index form:
    ```:no-line-numbers
    Hearts = 0, Diamonds = 1, Clubs = 2, Spades = 3
    ```
- The `index` is the position of the card in the set of 13 consecutive cards:
    ```:no-line-numbers
    Ace = 0, Two = 1, Three = 2, ... Jack = 10, Queen = 11, King = 12
    ```

**Examples:**
- King of Spades: `{"value": 10, "suit": 3, "index": 12}` 
- Ace of Hearts: `{"value": 1, "suit": 0, "index": 0}`


## Hit

#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Hit",
    "eventId": "<some-event-uuid>",
    "gameId": "og-blackjack",
    "data": {}
}
```

**Fields:**
All the above fields are required as presented.

#### Response `Update`:
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Hit",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": ["Hit", "Stand", "Surrender" ],
        "handIndex": 0,
        "handOwner": "Player",
        "playerHands": [
            {
                "cards": [
                    {"value": 10, "suit": 1, "index": 12}
                ]
            }
        ]
    }
}
```

::: warning IMPORTANT
When `handOwner` and `handIndex` are added to the response the backend is telling the frontend **which hand will play next** (not which hand played last)
:::

**Fields:**

All the fields in the response are already described previously. Good to note that the `playerHands` only responds with one card. this is the new card that was hit to the player/dealer. As already stated these responses only show the differences that occured after the action. 

#### Response - User goes Bust:

```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Hit",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [],
        "roundEnded": true,
        "payout": "-52.5",
        "playerHands": [
            {
                "cards": [
                    {"value": 5, "suit": 1, "index": 4}
                ],
                "status": "Bust",
                "payout": "-52.5"
            }
        ]
    }
}
```
**Fields:**


| Field Name | Type | Description |
|----|---|---|
| `status` | string | This field is added whenever a hand ends its play, It can be either of: `Bust`, `Win`, `Push` |
| `payout` | string | This is the amount the user lost (or won depending on the `status`) in this hand. |
| `roundEnded` | bool | If there are no more actions to take, then this value will be `true` and no more actions are allowed to be send through the websocket. |
| `payout` | string | If round is closed, the backend will tally up all the player's winnings and losses into this field.  |


::: info Note
- The `payout` **does not** include sidebets. Sidebets are always considered indipendent of the game. Therefore the `payout` is the sum of all the `payout` fields inside the player's hands.
- Note: on a win, the amount in `payout` also includes the player's initial bet itself.
:::

## Split

#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Split",
    "gameId": "og-blackjack",
    "eventId": "<some-event-uuid>",
    "data": {}
}
```

#### Response `Update`:

```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Split",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [ "Stand", "Surrender", "Hit", "Double" ],
        "handIndex": 0,
        "handOwner": "Player",
        "playerHands": [
            {
                "isSplit": true,
                "cards": [
                    {"value": 10,"suit": 2,"index": 9},
                    {"value": 7, "suit": 2, "index": 6}
                ],
                "betAmount": "52.5"
            },
            {
                "isSplit": true,
                "cards": [
                    {"value": 10, "suit": 1, "index": 9},
                    {"value": 8, "suit": 0, "index": 7}
                ],
                "betAmount": "52.5"
            }
        ]
    }
}
```

#### Notes on split hands
- When a split is triggered, The player's hand is split into 2 hands. **The original hand will not exist in the state anymore**. It will be replaced by 2 split hands. 
The `RoundUpdate` will show the two new `playerHands`. So from the above you can see that the original hand's cards were: `{"value": 10,"suit": 2,"index": 9}`  & ` {"value": 10, "suit": 1, "index": 9},`
- If the player splits hand `0`, the 2 new hand indices will be `0`, & `1` I.e. **hand `0` was replaced with one of the split hands**. This keeps on going the same way if **multiple splits** are allowed. Ex: if the user splits hand `1` then the 2 new hands will be `1` & `2`. Currently, the player can split only once  (2 total hands). After which the backend will no longer send `Split` in `nextActions`
- The backend will always send back an update telling the frontend which hand index is to play next, **starting form highest hand index down to `0`** (playing right to left)


## Double

#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Double",
    "gameId": "og-blackjack",
    "eventId": "<some-event-uuid>",
    "data": {}
}   
```


#### Response `Update`:
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Double",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": ["Hit"],
        "handIndex": 0,
        "handOwner": "Dealer",
        "playerHands": [
            {
                "cards": [
                    {"value": 10, "suit": 1, "index": 12}
                ],
                "betAmount": "105"
            }
        ]
    }
}
```
This request doubles the hand's bet so `betAmount` will be double the original (for this hand) and a new card is dealt to that hand. No more actions are available after player doubles down on a hand. 

:::info Important
In the example above, `handOwner` was changed to `Dealer` meaning that the round is still not over, and there are dealer actions that needs to be taken. Another example would be if `handOwner` stays as `Player` but `handIndex` shifts by 1, meaning that the game moved over to the user's other hand. This only occurs on splits.
:::


**Response - User goes bust from doubling down:**

Note there are no more actions (even for the dealer) since if all user hands go bust there is no need to deal cards to the Dealer. The `roundEnded` field is set to `true`
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Double",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [],
        "roundEnded": true,
        "payout": "0",
        "playerHands": [
            {
                "cards": [
                    {"value": 5,"suit": 1,"index": 4}
                ],
                "status": "bust",
                "payout": "0",
                "betAmount": "105"
            }
        ]
    }
}
```

## Peek

#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Peek",
    "gameId": "og-blackjack",
    "eventId": "<some-event-uuid>",
    "data": {
        "acceptedInsurance": true
    }
}
```

| Field Name | Type | Required | Description |
|----|---|--- | ------- |
| `acceptedInsurance`| bool | yes |  `true` or `false` whether or not the user wants to insure his hand or not|


::: info The backend will automatically take half the original bet amount as insurance amount
:::


#### Response `Update`:

```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Peek",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": ["Hit", "Stand", "Double", "Surrender"],
        "handIndex": 0,
        "playerHands": [{}],
        "insurance": {
            "payout": "0",
            "status": "Insurance Lost"
        }
    }
}
```
Dealer did not have blackjack so the second dealer card still is not visible to player and not returned in the response. But you can see the insurance was resolved.

#### Response - Dealer got Blackjack (insurance won):
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Peek",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [],
        "handIndex": 0,
        "roundEnded": true,
        "status": "insurance_lost",
        "payout": "0",
        "playerHands": [
            {
                "status": "insurance_lost",
                "payout": "0"
            }
        ],
        "insurance": {
            "payout": "201.8",
            "status": "insurance_lost"
        }
    }
}
```
## Stand

#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Stand",
    "gameId": "og-blackjack",
    "eventId": "<some-event-uuid>",
    "data": {}
}
```

#### Response `Update`:
The response will simply return an empty `nextActions` for the current hand. Note that roundEnded is not set to `true` yet since there are dealer actions that need to be completed. Dealer actions are not presented to the user. They need to automatically be triggered by frontend as there will not be any options in `nextAction` other than `Hit` .
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Stand",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": ["Hit"],
        "handIndex": 0,
        "handOwner": "Dealer"
    }
}
```


## Surrender
#### Request `Action`:

```json:no-line-numbers
{
    "eventType": "RoundAction",
    "action": "Surrender",
    "gameId": "og-blackjack",
    "eventId": "<some-event-uuid>",
    "data": {}
}
```

When surrender is available as an action & triggered by player, the game ends immediately and half the bet amount is returned back to the user

#### Response `Update`:
```json:no-line-numbers
{
    "eventType": "RoundUpdate",
    "action": "Surrender",
    "roundId" : "<some-round-uuid>",
    "eventId": "<some-event-uuid>",
    "data": {
        "nextActions": [],
        "roundEnded": true,
        "payout": "26.25",
        "playerHands": [
            {
                "status": "Surrender",
                "payout": "26.25"
            }
        ]
    }
}
```

## Full Game State Example


```json:no-line-numbers
{
    "eventType": "RoundState",
    "roundId": "36210984-c762-4af6-b40b-39054893749b",
    "eventId": "<some-event-uuid>",
    "data": {
        "action": "Hit",
        "nextActions": ["Hit", "Stand"],
        "handIndex": 0,
        "handOwner": "Player",
        "betAmount": "1",
        "dealerHand": {
            "cards": [
                {"value": 1, "suit": 2, "index": 0 }
            ]
        },
        "playerHands": [
            {
                "cards": [
                    {"value": 4, "suit": 1, "index": 3 },
                    {"value": 4, "suit": 2, "index": 3 },
                    {"value": 10, "suit": 1, "index": 11 }
                ],
                "nextActions": [ "Hit", "Stand" ],
                "betAmount": "1"
            }
        ],
        "acceptedInsurance": true,
        "insuranceAmount": "0.5",
        "perfecPairsBetAmount": "1",
        "pokerBetAmount": "1",
        "perfectPairs": {
            "payout": "7",
            "status": "mixedPair"
        },
        "poker": {
            "payout": "0",
            "status": "sidebetLost"
        },
        "insurance": {
            "payout": "0",
            "status": "insurance_lost"
        }
    },
    "roundEnded": false
}
```









