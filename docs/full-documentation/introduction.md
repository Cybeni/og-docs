---
next:
  text: "Gameservice Details"
  link: "/full-documentation/gameservice.md"
---
# Introduction

![Overview Diagram](/images/overview-diagram-light.png#light)
![Overview Diagram](/images/overview-diagram-dark.png#dark)

## Overview

The game engine consists of three microservices, each dedicated to a specific part of the system. Together, they form a powerful, highly scalable platform capable of handling complex gaming logic and user interactions.

## Gameservices

**Gameservices** is the core microservice written in Go. It handles all game logic built upon a cryptographically secure random number generator. Thanks to Go’s concurrency (via Goroutines), this service can scale both vertically (on a single machine) and horizontally (across multiple servers). See [understanding game service](./gameservice.md) for more detail.

## Gateway

The **Gateway** is an Express.js service that sits between the frontend and the Gameservices. It provides two main communication methods:
 - **WebSocket**: Used for real-time game rounds.
 - **HTTP**: Used for one-off calls (e.g., fetching user balance, game configurations, or back-office functions).

The Gateway maintains a direct connection to Redis, caching player game states to optimize performance and enable features like preventing multiple sessions of the same game. It also handles bet and win transactions by integrating with a separate back-office user platform where accounts and wallets are stored.  See [Understanding the gateway](./gateway.md)

For a detailed explanation of the gateway's schemas and request/response payloads to the client see the [api-docs](../api-docs/introduction.md)

## Gamestore

The **Gamestore** is a lightweight Go microservice responsible for persisting user actions and round states into a PostgreSQL database. This data provides valuable insights for reporting and analytics, and acts as a fallback to resume any active rounds left in progress. Gamestore, like Gameservices, scales effectively both vertically and horizontally. See [understanding the gamestore](./gamestore.md)

## NATs Event Bus

All internal communication among Gamestore, Gateway, and Gameservices flows through the NATs event bus. NATs is a high-performance message broker offering pub-sub, message streams, and queueing capabilities. It also handles load balancing across multiple instances of each service, making it crucial for horizontal scalability. See [understand the event bus](./nats.md) for more details.


## Key features

**Stateless system**

The system is **stateless**, meaning that none of the microservices stores round states in memory. For example the state is created at round start, saved in redis cache and sent to gameservices. From there, gameservices updates that state and sends it back to the gateway. The gateway updates the new state in redis cache. 

This makes the gameservice autoscale horizontally much more easily on cloud platforms. Because there is no need for a round to **always hit** the same server instance. If a round has 4 actions, those actions could easily be performed on any of the N instances live of the gameservice.

**Vertically scalable**

The gameservice & the gamesore has N workers each all listening concurrently for incoming messages to crunch. The number of workers is easily adjusted as needed to fully utilise server cores as efficiently as possible.

