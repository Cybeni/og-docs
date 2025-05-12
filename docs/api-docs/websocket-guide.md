# WebSocket Guide

## Talking to the Game Engine (Overview)

The primary channel for communication between the client (frontend) and the game engine is the WebSocket gateway. This gateway requires **event messages** in a specific JSON schema and responds back with a similar schema.

The gateway recognizes three inbound event message **types**:
- `RoundAction` - To be sent when a player performs some action
- `RoundState` - To be send when frontend wants the full state of the current game.
- `Authenticate` - To be send to authenticate the player after connecting to gateway.

For each of these, the gateway responds with these **event types**:
- `RoundUpdate` (in response to `RoundAction`)
- `RoundState` (in response to `RoundState`)
- `Authenticate` (in response to `Authenticate`)

Each game round has a state which changes depending on user actions. As a quick example, a blackjack `RoundAction` can be a "Split". The `RoundUpdate` response message will contain the neccessary data the frontend requires to show the player after such action. Internally, the engine also keeps a running state of that round in memory which is described later on how that will be used.

::: warning The gateway can also respond with type `Error` or `Warning` Event. In Most cases the client needs to show an error to the user unless stated otherwise in this documentation. See [error codes](#error-codes) for a list of error responses to be handled by frontend.
:::

Below is a step-by-step guide on how to connect, authenticate, and interact with the game engine.

## 1. Connect to gateway
This WebSocket is session-based, meaning it requires a `game_session_id` as a query parameter. The below ws should be called to connect to gateway/engine

```
wss://<gateway-url>/v1/ws?game_session_id=<session-id>
```

The `game_session_id` is retrieved from the user’s login session. It allows the gateway to authenticate the user, maintain their account information, and track game outcomes during play. For details on obtaining the `game_session_id`, consult the platform team. This session ID is also used internally to record the user’s results and process account transactions.

## 2. Authenticate

After establishing a WebSocket connection, the first Event message the client should send is Authenticate:

#### Request pyaload:
```json
{
    "eventType": "Authenticate",
    "eventId": "<some-unique-id>"
}
```
| Field       |  Type  | Description | 
| ----------- | ------ | ----------- |
| eventType        | string | Indicates the message type (in this case, Authenticate) |
| eventId   | string | A unique identifier (like a UUID) acting as an idempotency key.|

::: info  If the client resends a request with the same `eventId`, the gateway recognizes it as a duplicate and won’t reprocess it. Helpful if messages are delayed or lost. In general, frontend should always send a **different** `eventId` for different events but keep the **same** `eventId` when **retrying** the same event more than once
:::


#### Successful Response
On a successful authentication, the gateway will respond with:
```json
{
    "eventType": "Authenticate",
    "authenticated": true,
    "eventId": "<some-unique-id>",
}

```

:::info Note that the gateway responds back with the same `eventid` used in the requested event.
:::

#### Failed Response

If authentication fails, the gateway responds with:
```json
{
    "eventType": "Error",
    "message": "Authentication Failed",
    "code": "AUTHENTICATION_FAILED",
    "eventId": "<some-unique-id>"
}
```

Every `Error` event type will contain a `message` field and a `code`. Client does not neccesarily need to show this to the user. You might prefer a more generic error however, this is useful to trace back any issues to the code if any.

:::danger If client tries to call any other Event message before authenticating, the below response is thrown:
```json
{
    "eventtype": "Error",
    "message": "Client is not authenticated",
    "code": "CLIENT_NOT_AUTHENTICATED",
    "eventId": "<some-unique-id>"
}
```
:::


## 3. Send RoundState

After successful authentication, send `RoundState` to check if a user has an active game round in progress. This is especially helpful if the user closed the browser mid-game (e.g., Blackjack), allowing them to resume where they left off.

#### Request payload
```json
{
    "eventType": "RoundState",
    "gameId": "og-blackjack",
    "eventId": "<some-action-id>",
    "data" : {}
}
```

| Field       |  Type  | Description | 
| ----------- | ------ | ----------- |
| gameId     | string | Identifies the specific game (e.g., og-blackjack). Refer to the back office for a list of valid game IDs. |
| eventType        | string | Indicates the message type (in this case, RoundState) | 
| eventId   | string | A unique identifier (like a UUID) acting as an idempotency key|
| data        | object | An object containing any necessary data for the request. For `RoundState`, this can remain empty. | 


#### Successful Response

```json
{
    "eventType": "RoundState",
    "roundId": "36210984-c762-4af6-b40b-39054893749b",
    "data": {
        "action": "Hit",
        "nextActions": ["Hit", "Stand", "Surrender", "Double", "Split"],
        "roundEnded": false
        // ... more game specific data 
    },
    "eventId": "<some-unique-id>"
}
```


| Field       |  Type  | Description | 
| ----------- | ------ | ----------- |
| roundId     | string | The ID of the current game round |
| eventId   | string | A unique identifier (like a UUID) acting as an idempotency key |
| data        | object | An object containing **the current full state of the round** | 
| data.action        | string | The current stage or action in the game (e.g., "Hit") |  
| data.nextActions   | list | An array of possible moves the player can make next |

:::note 
- Each game may include its own additional fields in data, beyond `action` and `nextActions`. See the [full game schemas](/api-docs/full-game-specific-guide/blackjack.md) below for reference.
- It is very crucial that the next possible action the user can take is part of the `nextActions` set. So client **must only present these possible actions to the player**
:::

#### Using RoundUpdate Alongside RoundState

The frontend can use the `RoundState` schema to build or restore the client-side state whenever a user (re)joins a game. Meanwhile, `RoundUpdate` messages generally follow the same schema structure but provide only incremental or “truncated” updates relevant to that moment. This approach keeps the schemas consistent, so the client logic can handle both `RoundState` and `RoundUpdate` in a unified way.

#### Failed Response
If no active round is found (e.g., the user hasn’t started playing yet), the engine replies with:

```json
{
    "eventType": "Warning",
    "message": "No round is currently open. You can start a new round",
    "code": "GAME_ROUND_NOT_FOUND",
    "eventId": "<some-action-id>"
}
```
This means nothing was found in memory, and the user is free to begin a new round.

## 4. Send RoundAction
The next request made to the gateway should be a `RoundAction`. Any `RoundAction` should have a specific `action` field which determines what the user wants to do. To start a new round completely the action is `Bet`

```json
{
    "eventType": "RoundAction",
    "action": "Bet",
    "gameId": "og-blackjack",
    "eventId": "<some-unique-id>",
    "payload": {
        "betAmount": 10,
        "perfectPairsAmount": 5.5,
        "pokerBetAmount": 4.5
    }
}
```

All rounds always start with `Bet` (or `Autobet` see [Autobet](#Autobet)). This Event message, creates a new round id (UUID) internally which will be returned through the `RoundUpdate`. The engine will respond with a `RoundUpdate` type of that same `action`:


```json
{
    "eventType": "RoundUpdate",
    "action": "Bet",
    "eventId": "bet-Action-2s1",
    "data": {
        "nextActions": ["Hit", "Stand"],
        // ... more game specific data
    },
    "roundId": "36210984-c762-4af6-b40b-39054893749b"
}
```

## Summary of Round lifecycle

1. **Connect** via `wss://<gateway-url>/v1/ws?game_session_id=<session-id>`.
2. **Send** an `Authenticate` event.
3. **Receive** either a successful `Authenticate` response or an `Error`.
4. **Send** a `RoundState` event to retrieve current state.
5. **Receive** a `RoundState` response or a `Warning` if no active round.
    - Present the player with possible `nextActions` or by default `Bet` if there are no active rounds.
6. **Send** `RoundAction` event with an action that player chose from `nextActions` set (like `"Split"`, `"Hit"`, etc...).
7. **Receive** `RoundUpdate` events with the latest game info.
8. **Repeat** 6. & 7. until there are no more `nextActions`  (i.e. empty list) OR until `roundEnded` is `true` in `RoundUpdate`

## Error Codes
These are the error codes & warnings that can be sent by gateway where frontend is required to react. Note that any other error not in this list can occur but frontend is not required to perform any action on those other than notifying the user with a generic error to "try again later" or "refresh the page"

| Err Code | Received From | Description | Frontend Reaction | 
| -------- | ------------- | ----------- | ----------------- | 
| GAME_ROUND_NOT_FOUND | RoundState | will be returned if there are no active games being played | Should enable the user to `Bet` as the only option to start a new round.
| INSUFFICIENT_FUNDS | RoundAction | This can be returned if frontend allows the user to place a bet while player has no funds available | Show a message to user to fund the account|
| CLIENT_NOT_AUTHENTICATED | Any | Will be sent if a request is made before player is authenticated | Send Authenticate event to gateway |
| INVALID_NEXT_ACTION | roundUpdate | If `action` value is not part of `nextActions` list| |
| INVALID_BET_AMOUNT | roundUpdate | Bet amount outside limits| |
| BET_LIMIT_REACHED | roundUpdate |  going above limit thresholds during autobetting| |
| INVALID_AUTOBET_MAX | roundUpdate |  | |
| INVALID_STOP_ON_PROFIT | roundUpdate |  | |
| INVALID_STOP_ON_LOSS | roundUpdate |  | |
| INVALID_PAYLOAD_SCHEMA | roundUpdate | if input not a valid json| |
| INVALID_EVENT_TYPE | roundUpdate | if eventType filed has an unexpected string| |
| INVALID_ACTION | roundUpdate | action field missing (when doing a RoundAction eventType)| |
| INVALID_GAME_ID | roundUpdate | bad game code| |
| INVALID_CURRENCY | roundUpdate | missing or invalid currency| |
| INVALID_EVENT_INPUTS | roundUpdate | any other error not caught with a custom code (should technically  |never occur)|


:::note
there can be other error codes specific to each game. see [full game schemas](/api-docs/full-game-specific-guide/blackjack.md) for these codes 
:::


## Other Possible payloads

### Get Balance

Once a websocket connection is established **and authenticated**, a client retrieve the users balance through a ws connection. This is the request payload to get the balance:
```json
{
    "eventType": "GetBalance",
    "gameId": "{{limbo-id}}",
    "eventId": "balance-id-1dd",
    "data": {
        "currency": "USD"
    }
}
```
it follows the same input fields needed in the [HTTP GET /balance](/api-docs/http-guide/get-player-balance.md). The response payload will be:

```json
{
    "eventType": "BalanceUpdate",
    "eventId": "balance-id-1dd",
    "data": {
        "balance": 1224.840140402817,
        "currency": "USD"
    }
}
```

:::note This could also respond with an `error` message if something goes wrong in retrieving the balance from casino platform
:::


### Get config
The game configs could be changed in real-time through the CMS. These real-time updates trigger the [POST request webhook](/api-docs/http-guide/game-configs.md) which sends the new game configs to the gateway. The gateway then broadcasts these changes to **ALL clients** that are connected to the websocket server. Thus the clients have a passive, real time update of configs. The broadcasted message looks like:

```json
{
    "eventType": "UpdateConfig",
    "gameId": "og-limbo",
    "data": {
        "gameId": "og-limbo",
        "maxBet": "5000.00",
        "minBet": "0.00",
        "customProps": {
            "minTargetMultiplier": "1.01",
            "maxTargetMultiplier": "1000000.0",
            "minWinChance": "0.000099",
            "maxWinChance": "98.01980198"
        }
    }
}
```
It could be for any gameId that is currently available. So if a client is not interested in game's the user is not playing on that socket, that they could easily ignore/discard the incoming message.