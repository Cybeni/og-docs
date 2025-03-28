# Get Round Details

All round information is stored in the backend game database. This information can be useful to players in order to see their historical gameplay. This is also useful for them in order to verify that the round was not tampered with. 

Games like Limbo also add this as part of the game component where players can click on previous generated limbo multipliers to see the outcome.

## Request

- **Method:** GET
- **URL:** `http://<gateway-url>/v1/games/<game_id>/rounds/<round_id>?game_session_id=<game_session_id>`

**Path Parameters:**

|Parameter |	Type |	Description	| Required |
| --- | --- | --- | --- |
|game_id |	String |Unique code that identifies which game to get round details of	| Yes |
|round_id| string | Unique id of a historical round that was played | yes |


**Query Parameters:**

|Parameter |	Type |	Description	| Required |
| --- | --- | --- | --- |
|game_session_id |	String | The unique identifier of the game session. Important to authenticate player.	| Yes |

**Example**

```shell
curl --location 'http://localhost:3000/v1/games/og-limbo/rounds/12dbf97b-2b91-498d-ac5b-727995059af2?game_session_id=some-game-session-id'
```


## Response: Limbo Example

#### 200 ok

:::tip :white_check_mark:
```json:no-line-numbers
{
    "clientSeed": "jzjdf784hf",
    "nonce": 2,
    "isVerifiable": true,
    "serverSeed": "khsfASKFkasodf834965hsdvs9d8ch",
    "roundOutcome": {
        "betAmount": "1",
        "multiplier": "1.01",
        "payout": "1.01",
        "generatedMultiplier": "7",
        "payoutMultiplier": "1.01"
    }
}
```
:::

:::info IMPORTANT
The `isVerifiable` field means that the player's current server seed he is using is not the same as the one used for this round. Meaning that we could safely show that `serverSeed` to the player and thus he can **verify** that the game was not tempered with
:::


If `isVerifiable` is `false` then the `serverSeed` key will not be in the JSON response. Instead there will the the hashed server seed instead: 

:::tip :white_check_mark:

```json:no-line-numbers
{
    "clientSeed": "HoLgR34Fhn",
    "nonce": 4,
    "isVerifiable": false,
    "serverSeedHashed": "489c143e1e3a16b80b8e96f4b468d4d974f20d5dac69704de5efac3371eea0d5",
    "roundOutcome": {
        "betAmount": "1",
        "multiplier": "1.01",
        "payout": "1.01",
        "generatedMultiplier": "7",
        "payoutMultiplier": "1.01"
    }
}
```
:::


#### 500 Error

If a wrong `round_id` is placed. 
::: danger :collision:
```json
{
    "eventType": "error",
    "message": "No state was found for this round and game.",
    "code": "ROUND_DETAILS_NOT_FOUND"
}
```
:::