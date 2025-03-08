# Introduction
The Engine has two modes of communication to the client. A **websocket connection** and an **HTTP REST API**. Both serve different purposes. 

#### Websocket
The Websocket connection is used to play game(s) so it needs to be initiated on game load. All user interactions with the game will be translated to websocket payload messages to the engine. The engine will respond back to client in order for the player to progress through a game round. The websocket connection can be kept open throughout the player's game session. 

#### HTTP REST API
The rest API is used for more round-indipendent requests. Such as the provably fair modal, getting user's balance, getting game configurations etc... These endpoints can be used in between rounds or in the middle of rounds if needed, there is no restriction in place to open both a websocket and calling https endpoints. But they are also round agnostic meaning they can be used outside of the games completely. Example to get historical account of rounds on some part of the platform if needed.