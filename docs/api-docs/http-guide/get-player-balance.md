# Get Player Balance

Retrieve a player’s current balance on the platform


## Request

- **Method:** GET 
- **URL:** `https://<gateway-url>/v1/player/balance?game_session_id=<game_session_id>&game_id=<game_id>`

**Query Parameters**:
|Parameter |	Type |	Description	| Required |
| --- | --- | --- | --- |
|game_session_id |	String |	The unique identifier of the game session. Important to authenticate player.	| Yes |
|game_id |	String |	A code give to a game as identifier	| Yes |


```shell:no-line-numbers
curl -X GET 'https://localhost:3000/v1/player/balance?game_session_id=80ebf563-43b2-4647-ba55-1d0842bd458d&game_id=og-blackjack'
```


## Responses

#### 200 ok

:::tip :white_check_mark:  
```json:no-line-numbers
{
    "balance": 970.5515118730164,
    "currency": "USD"
}
```
:::

#### 500 Internal Server Error

This will mostly occur if the game_session_id is invalid & thus player was not authenticated
:::danger :collision:
```json:no-line-numbers
{
    "type": "Error",
    "message": "Authentication Failed",
    "code": "AUTHENTICATION_FAILED"
}
```
:::

#### 422 Unprocessable Entity
This might be returned if an input parameter is incorrect. For example a bad game id or parameter left out.
::: warning :-1:
```json:no-line-numbers
{
    "type": "Error",
    "message": "Fetch Balance Failed",
    "code": "FETCH_BALANCE_FAILED"
}
```
:::