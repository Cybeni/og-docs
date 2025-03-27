# Verify Game Round

## Request
- **Method:** POST
- **URL:** `https://<gateway-url>/v1/games/<game_id>/verify/<game_session_id>`

**Path Parameters**
| Parameter | Type | Description	|
| ---  | --- | --- |
| game_id |	String |  An indentifier given to a game |
| game_session_id |	String |  A session's unique identifier, important to authenticate player |



**Body:**

| Key | Type |	Required | Description	|
| --- | --- | --- | --- |
| clientSeed |	String | Yes |  A player-chosen random string to be added to the RNG |
| serverSeed |	String | Yes |  A casino-chosen random string to be added to the RNG |
| nonce |	int | Yes | The "rank" value representing the round played |


**Example**

```shell
curl -X POST 'https://localhost:3000/v1/games/og-blackjack/verify/80ebf563-43b2-4647-ba55-1d0842bd458d' \
--header 'Content-Type: application/json' \
--data '{ 
            "clientSeed": "kgrm5ysu",
            "serverSeed": "846f0f39047bca23377a51f557459edb847269aa8f85906212f68263f43f588e",
            "nonce": 20
        }'
```


## Responses

#### 200 ok

:::info Important
The output json will be dependent on which game id was passed. But all will follow the same state schema as detailed in the [full game specific guide](../full-game-specific-guide/limbo.md)
:::

:::tip :white_check_mark:
```json:no-line-numbers
{
    "action": "verify",
    "type": "RoundUpdate",
    "data": {
       // this will contain the neccessary information to show the player like baccarat cards or limbo multiplier. 
       // following the same state scheam
    }
}
```
:::

