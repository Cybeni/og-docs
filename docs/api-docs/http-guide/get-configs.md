# Get game configs

Each game has its own set of configurations which are hosted on the game CMS (details on CMS [here](../game-cms.md)). Most important set of configs for client integrations are the maximum and minimum bet limits imposed on the games.


#### Request:
```curl
curl -X GET  'https://<gateway-url>/v1/games/configs?game_id=og-blackjack&game_session_id=<some-game-session-id>'
```
| Field Name | Required | Description | 
| ------ | ------ | ------|
|`game_id` | yes | This is required to get the configs of a specific game. Regarding a list of game ids, consult the dev team |
|`game_session_id` | yes | This is a uuid that is given to a game once its loaded on the platorm | 


::: info Note 
The `game_session_id` is required as a way to authenticate the request. This ensures that the endpoint is only called with a user session in place. Internally this session_id is also used to ahtientcate the player.
:::

#### Response:
```json
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

