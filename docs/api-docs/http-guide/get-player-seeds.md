# Get Player Seeds

:::info Important
Seeds are generated at the player level, meaning the same server seed and client seed are used across all games for a single player. For more information on seeds see [how the random number generator works](../../rng/README.md)
:::
## Request 

- **Method:** GET
- **URL:** `http://<gateway-url>/v1/player/seeds/<game_session_id>`

**Path Parameters:**

|Parameter |	Type |	Description	| Required |
| --- | --- | --- | --- |
|game_session_id |	String | The unique identifier of the game session. Important to authenticate player.	| Yes |

**Example**

```shell
curl -X GET 'http://localhost:3000/v1/player/seeds/80ebf563-43b2-4647-ba55-1d0842bd458d'
```

## Responses

#### 200 ok

:::tip :white_check_mark:
```json 
{
    "server_seed_hashed": "a83f3ce6dab1e8a1d335bf648601dbf8ee12e53fdc3058bf2096e1873c1fd74d",
    "next_server_seed_hashed": "7da56b0fff9637db47e4f42f0ad1c6920cd58a299c72ff1fb50c481c7f1f7353",
    "client_seed": "bb39c594"
}
```
:::

::: info Note
The returned server seed is **hashed** as well as the next server seed to be used. This is because we cannot expose the current and next server seeds to player as it will be a major vulnerability.
:::

#### 500 Internal Server Error

This will be returned if a `game_session_id` is incorrect and thus fails to authenticate the player.

::: danger :collision:
```json:no-line-numbers
{
    "type": "Error",
    "message": "Authentication Failed",
    "code": "AUTHENTICATION_FAILED"
}
```
:::



# Post Player Seeds

## Request
- **Method:** POST
- **URL:** `https://<gateway-url>/v1/player/seeds/<game_session_id>`

**Headers:** 

| Key | Value |
| --- | ---| 
| Content-Type | application/json |

**Path Parameters** 

| Parameter | Type | Description |
| --- | --- | --- |
|game_session_id |	String | The unique identifier of the game session. Important to authenticate player. |

**Body:**

| Key | Type |	Required | Description	|
| --- | --- | --- | --- |
| clientSeed |	String | Yes |  A player-chosen random string to be added to the RNG |


**Example**

```shell
curl -X POST 'http://localhost:3000/v1/player/seeds/80ebf563-43b2-4647-ba55-1d0842bd458d' \
--header 'Content-Type: application/json' \
--data '{
    "clientSeed": "fhskdHG76GF"
}'
```


## Responses


#### 200 ok 
Empty response on success

:::tip :white_check_mark:
```json:no-line-numbers
{}
```
:::


#### 500 Internal Server Error

This will be returned if a player tries to rotate seeds while one or more of their rounds are active.

::: danger :collision:
```json:no-line-numbers
{
    "type": "Error",
    "message": "Cannot change seeds with an active limbo bet",
    "code": "CHANGE_SEED_FAILED"
}
```
:::

#### 422 Unprocessable Entity

This will be returned if the request body has incorrect data. For example a missing `clientSeed`

::: warning :-1:
```json:no-line-numbers
{
    "type": "Error",
    "message": "clientSeed not found in request body.",
    "code": "BAD_REQUEST_PARAMS"
}
```
:::