---
next: "/api-docs/websocket-guide.md"
---
# Retrieve Game Configs

Each game has its own set of configurations which are hosted on the game CMS (details on CMS [here](../game-cms.md)). Most important set of configs for client integrations are the maximum and minimum bet limits imposed on the games.


# Request:
- **Method:** `GET`
- **URL:** `https://<gateway-url>/v1/games/configs?game_id=og-blackjack&game_session_id=<some-game-session-id>`

```shell
curl -X GET  'https://localhost:2000/v1/games/configs?game_id=og-blackjack&game_session_id=6722c17d-3cf7-40a3-9463-52a418c22b57'
```

**Query Parameters**

| Field Name | Required | Description | 
| ------ | ------ | ------|
|`game_id` | yes | This is required to get the configs of a specific game. Regarding a list of game ids, consult the dev team |
|`game_session_id` | yes | This is a uuid that is given to a game once its loaded on the platorm | 


::: info Note 
The `game_session_id` is required as a way to authenticate the request. This ensures that the endpoint is only called with a user session in place. Internally this session_id is also used to ahtientcate the player.
:::

# Responses

#### 200 ok
:::tip :white_check_mark:
```json:no-line-numbers
{
    "id": 1,
    "user_created": "5388c17d-3cf7-40a3-9463-52a418c11be7",
    "date_created": "2025-02-10T14:48:07.299Z",
    "user_updated": "5388c17d-3cf7-40a3-9463-52a418c11be7",
    "date_updated": "2025-02-13T16:15:02.601Z",
    "game_id": "og-blackjack",
    "active": true,
    "max_bet": "5000.00000",
    "min_bet": "0.00000",
    "custom_props": {
        "perfect_pairs_max_bet": "5000.0",
        "perfect_pairs_min_bet": "0.0",
        "poker_max_bet": "5000.0",
        "poker_min_bet": "0.0"
    }
}
```
:::

#### 422 Unprocessable Entity

If query parameters are missing: 

::: warning :-1:
```json:no-line-numbers
{
    "type": "Error",
    "message": "'game_session_id' not found in query parameters",
    "code": "MISSING_QUERY_PARAM"
}
```
:::

# Post game configurations

Game configs can be updated while the engine is live. The below is the request made to update the live engine configurations

- **Method:** POST
- **URL:** `https://<gateway-url/v1/games/configs`

**Headers**
| Key | Value | Description |
| -- | -- | -- |
| Authorization | Bearer `<token>` | This is the token requierd to make authorize this request. The token should match Directus CMS' generated token|
|Content-Type | application/json | This labels the type of content in the body of the request | 


**Example:**
```shell:no-line-numbers
curl -X POST 'http://localhost:3000/v1/games/configs' \
-H 'Authorization: Bearer VoTEoaY9BGSlQ7xc-IaHHD8Ww0MQ5f4r' \
-H 'Content-Type: application/json' \
-d '{
    "data": [
        {
            "game_id": "og-blackjack",
            "min_bet": "0",
            "max_bet": "5000",
            "custom_props": {
                "perfect_pairs_max_bet": "1000.00",
                "perfect_pairs_min_bet": "0.001",
                "poker_max_bet": "500.00",
                "poker_min_bet": "0.001"
            }
        }
    ]
}'
```

:::info Important
- Regarding the schema in the `data` payload please look at how the data is stored in CMS (directus). The schema follows exactly what directus CMS uses in its SDK as output
- Note that this endpoint is rarely ever needed to be called manually or from any other service. With Directus Flows, this is setup as a webhook when the CMS data changes. 
:::

# Response

#### 200 ok
::: tip :white_check_mark:
```json:no-line-numbers
{
    "success": true
}
```
:::