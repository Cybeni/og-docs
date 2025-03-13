# Gateway

The gateway is an Express.js app written in javascript that contains all the communication endpoints between the frontend and the engine. It also has direct communication with redis for caching state, with a postgresql DB to load seeds, persistante round states, and clear sessions. As stated in the introduction the gateway uses both a websocket connection for playing game rounds as well as http endpoints for various features such as clearing game session, getting user balance and others. See the [API Docs](../api-docs/introduction.md) for a full documentation of how to use all these endpoints.


## On Server Startup

Below is a brief overview of what happens when the application starts:

1.	**Import and Configure:** The app imports required dependencies (Express, WebSocket support, file-based routing, logging, etc.) and sets up logging (via Morgan) 
2. Setsup `CORS` rules (supporting wildcards).
3.	**Initialize External Services:** Before creating the server, it attempts to connect to external services like NATS and Redis, and load game configuration defaults from Directus. If any critical initialization fails, the application logs the error and exits.
4.	**Set Up Express:** An Express instance is created, configured to parse JSON request bodies, and enhanced with WebSocket support.
5.	**File-based Routing:** The express-file-routing library is used to mount routes automatically, including potential WebSocket endpoints.
6.	**Error Handling:** A custom error-handling middleware is applied to catch and respond to errors gracefully.
7.	**Server Listening:** Finally, the app starts listening on the specified port, ready to accept incoming requests and WebSocket connections.


## The Websocket

### High‐Level Overview
1.	Client opens a WebSocket connection to the server.
2.	Server initializes a **Session** object to handle authentication and game‐related data (including round state, player seeds, etc.).
3.	The client **Authenticates** by sending a message of type "Authenticate". Once authenticated, the session is stored in a Map of active WebSocket connections.
4.	Subsequent client actions flow through the **`GameEvent` class**, which identifies the appropriate game logic and **publishes** the action to an internal event bus (NATS) if needed.
5.	The game service (in another process) consumes these actions from NATS, processes the game logic, and **publishes updates back** to the same NATS event bus. See [gameservice](../full-documentation/gameservice.md) for more details on this process.
6.	The gateway (through the Session instance) **consumes these updates**, applies changes to the round state, and pushes the updates back to the client over the same WebSocket. The `GameUpdate` class is responsible for performing these tasks.

### Lifecycle of a websocket action:

![websocket Action Lifecycle](/images/gateway-action-lifecycle-light.png#light)
![websocket Action Lifecycle](/images/gateway-action-lifecycle-dark.png#dark)


- **Top half (`GameEvent`):** Client’s action request is identified, validated, published to the game service via NATS, and eventually triggers game updates.
- **Bottom half (`GameUpdate`):** The game update is consumed, validated, triggers local state updates (potentially calls platform transactions), stores the updated round state, and sends the response back to the client.



### Key Libraries and Their Roles
1.	**Express.js:** Even though the code references Express.js at a high level, the actual WebSocket upgrade handling is done via a custom route or a library that ties into Express.
2.	**ws (WebSocket library):** The code in `export const ws = async (ws, req) => { ... }` uses typical `ws` library–style callbacks `ws.on('message', ...)`, `ws.on('close', ...)` etc ...
3.	**NATS (JetStream / nats.js):**
    - Used to publish client actions to downstream game services (publishAction in GameEvent) and to consume game updates.
    - The Session class sets up “consumers” and “message iterators,” so each session can listen to updates intended for that specific game session.
4. **Redis:**
    - Holds the latest round state and seed data for each player, ensuring a consistent single source of truth.
    - The code frequently checks Redis for any existing round state to keep the front end in sync.
5.	**Big.js:**
    - Used to handle potentially large or precise numeric calculations, particularly around bet amounts, payouts, etc.
6. **Joi:**
    - Used in `GameEvent` to validate incoming messages from the client (the shape of JSON, required fields, allowed values, etc.).



### Detailed Flow

### 1. WebSocket Entrypoint 
```javascript
(export const ws = async (ws, req) => { ... })
```

**Purpose:** The main gateway that handles all incoming WebSocket messages from the client.

**Session Creation:**
```javascript
let session
try {
    session = new Session(req.query.game_session_id, ws)
} catch (err) {
    ws.send(err.asString())
    ws.close()
}
```
- A new Session object is constructed, which sets up an internal representation of the user’s state and identifies them via `game_session_id`.
- If no `game_session_id` is provided, a GameError is thrown and the WebSocket is immediately closed.

**Message Handling:**

```javascript
ws.on('message', async (msg) => {
    // parse JSON
    // authenticate session
    // load & update round state
    // instantiate a dynamic "GameEvent" class for the chosen game
    // publish to NATS if needed
    // catch any errors and send them back to the client
});
```


**Authentication:**
- The very first message of type `Authenticate` triggers `await session.authenticate()`. See [websocket guide](../api-docs/websocket-guide.md) for details on payload schemas.
    - The authentication steps are descibed below in [the session manager section](/full-documentation/gateway.md#_2-session-management-session-js)
- On success, the session is registered in a Map (wsClients) so the server knows this client is authenticated.
- A “successful authentication” confirmation is sent back to the client.


**Subsequent Actions:**

on any request that comes in after authentication: 
- We check that the client is authenticated (`wsClients.has(session.gameSessionId)`). If not, it’s an error.
- We locate the correct `GameEvent` subclass from `gameClass[msg?.gameId]?.event`
- Retrieve the latest round state from Redis:

```javascript
const [state, _] = await event.getGameState()
state ? session.state = state : session.resetState()
```

- Call `event.handleEvent()` to process the request. Any resulting payload gets sent back over the WebSocket.

**Connection Close Handling**

```javascript
ws.on('close', async () => {
    // remove session from list of live sessions
    wsClients.delete(session.gameSessionId)
    ...
});
```
- Cleans up resources, removes the client from the active sessions Map, and triggers session teardown logic (closing the consumer, etc.) as explained above.


### 2. Session Management (`session.js`)

**Constructor**

```javascript
constructor(gameSessionId, wsConnection) {
    this.wsConnection = wsConnection
    this.gameSessionId = gameSessionId
    this.state = { metadata: { game_session_id: this.gameSessionId } }
    ...
}
```
- Stores initial metadata (player/game session IDs) in `this.state`.


**:key: authenticate()**
::: tip What authenticating a session does:
1.	Calls into Platform see [guide to platrofm API](./platform-api-guide.md) to validate the player’s credentials.
2.	Sets up the NATs consumer via `initialiseSessionConsumer()`. Each session creates a specialized consumer that listens for updates intended for that particular `gameSessionId`.
3.	Subscribes to consumer deletion events via `RestartConsumerOnDeletion()`. If the consumer is ever deleted behind the scenes, it automatically recreates it.
4.	Seeds: Calls `loadSeeds()`, which either retrieves the seeds from the DB or generates new ones if none exist, then caches them in Redis.
5. Adds a `ws` callback on `close` in order to shutdown consumer, close subscriptions and delete cache when client disconnects
:::


**NATS Consumer Lifecycle**

- `initialiseSessionConsumer()`: Ensures the required JetStream stream is present, adds a consumer for this.`gameSessionId`, and starts an async iterator to consume messages.
- `RestartConsumerOnDeletion()`: Watches for the `$JS.EVENT.ADVISORY.CONSUMER.DELETED.<streamName>.<gameSessionId>` subject; if triggered, the consumer is re‐initialized.
- `removeSessionConsumer():` Cleans up the consumer on WebSocket close.

**handleGameResponse**

Once a consumer is created from the above `initialiseSessionConsumer`, a consumer callback function is required in order for NATs to do something with the messages that are being consumed. Thats where the `handleGameresponse` callback comes in: 

```javascript
handleGameResponse = async (subject, rawMessage) => {
    // parse the message JSON
    // find the correct GameUpdate class for the game
    // call handleUpdate()
    // update the session's state
    // send the result to the client
}
```

- This method is invoked when the game service publishes updates for the specific `<gameSessionId>`, and gateway consumer reads it.
- A `GameUpdate` subclass is instantiated; it handles the logic for the update message, sending payouts, saves updated state to memory & cache.
- Finally, the update is forwarded to the client’s WebSocket via update.send(this.wsConnection).



**resetState():**
- Clears out everything in `session.state` except for metadata. That is needed when the round closes.


### 3. Game Event Handling (GameEvent Class)
**Purpose:**

When the client sends an action (e.g., “Open,” “Hit,” “Stand,” etc.), the `GameEvent` class is used to:
1.	Validate incoming JSON (via `Joi`).
2.	Ensure the user has sufficient funds (for betting) if needed.
3.	Publish the action to NATS so that the actual game service can process it asynchronously.

#### validateInputs()
- Uses a `Joi` schema (`gameEventSchema`) to ensure the message shape is correct, verifying fields like type, action, `gameId`, and data.
#### handleEvent()
There are 2 possible event types for the websocket (apart from `Authenticate`): `RoundState` & `RoundAction`
- If it’s `RoundAction`, it tries to set an idempotent key so the same action doesn’t get processed multiple times.
- Publishes the event to NATS (via `publishAction()`).
- If it’s `RoundState`, it returns the entire game state from the server/Redis (for instance, if the client wants to re‐fetch the current round state).

#### publishAction()

- Publishes to the correct NATS subject (based on the `gameId`).
- Retries a few times if the stream or JetStream manager is temporarily unavailable.

#### getGameState()
- Fetches the current round state from Redis. If not found, tries the database.
- This ensures the server’s memory is consistent with the shared store in Redis or the DB.



### Putting It All Together (Referencing the Diagram)

1.	**Client Action Request**
    - The front‐end calls the WebSocket with JSON: `{ type: "GameEvent", action: "Open", gameId: "...", data: {...} }`.
    - The server identifies the game and uses `GameEvent` to parse and validate the request.
2.	**Load Current Round State**
    - `event.getGameState()` checks Redis to see if a round is currently open, merges it into the Session.
3.	**Validate Request’s Action**
    - For example, if the action is “Bet,” verify the user’s balance.
4.	**Publish to Game Service**
    - After the server decides the request is valid, it uses NATS to publish the action to the back‐end game microservice.
5.	**Consume Game Updates**
    - The gameservice processes the action, calculates the next game state, and publishes an update event to the same NATS stream. (**also publishes the new state**)
    - The server’s Session has an open JetStream consumer that receives that update.
6.	**Identify Game & Validate Metadata**
    - The server receives the update message, picks the right GameUpdate class, and checks the round data.
7.	**Call Platform Transactions (if needed)**
    - If the update says “Round Closed, user won X,” the server calls Platform to process the payout.
8.	**Update Round State in Redis**
    - The updated data is written to Redis for persistent caching.
9.	**Respond to Client**
    - Finally, the server sends the final or intermediate update (new cards, new totals, a “round closed” message, etc.) back to the client’s WebSocket.



### Important Details to Note
- **Idempotency:**

In `GameEvent.handleEvent()`, there is a check for duplicates using an idempotent key (`setIdempotentKey(this.actionId)`). This prevents double‐executing the same action.
- **Session Ties:**

Each WebSocket connection is tied to exactly one Session. When the connection closes, the session is cleaned up (closing its NATS subscription, etc.).
- **Redis as a Synchronization Layer:**

Round states are not stored only in memory but also in Redis. This ensures that if a user opens another browser tab or the server restarts, the state remains consistent.
- **Error Handling:**

Custom `GameError` objects are thrown throughout the code, ensuring consistent error messages to the client with an understandable structure (including error codes, descriptions, and references to the relevant `eventId`).
- **Platform Interaction:**

The Platform class is used throughout the gateway to handle outside calls (authentication or transaction/payout).
- **NATS Consumer Lifecycle:**

Each session has a dedicated consumer. If the consumer is ever deleted abruptly or the server restarts, `RestartConsumerOnDeletion()` ensures it will be recreated.

