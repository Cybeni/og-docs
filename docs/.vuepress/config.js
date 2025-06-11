import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
import { defineUserConfig } from 'vuepress'
import { markdownImagePlugin } from '@vuepress/plugin-markdown-image'


let nav = [{
    text: 'Home',
    link: '/README.md',
},
{
    text: 'Full System Description',
    link: '/full-documentation/introduction.md',
    children: [
        {
            text: 'Introduction',
            link: '/full-documentation/introduction.md'
        },
        {
            text: 'Gameservice Details',
            link: '/full-documentation/gameservice.md'
        },
        {
            text: 'Gateway Details',
            link: '/full-documentation/gateway.md'
        },
        {
            text: 'Event Bus Details',
            link: '/full-documentation/nats.md'
        },
        {
            text: 'Random Number Generator',
            link: '/full-documentation/rng.md',
        },
        {
            text: 'Game CMS',
            link: '/full-documentation/game-cms.md'
        }]
},
{
    text: 'Get Started',
    link: '/get-started/',
},
{
    text: 'API Docs',
    ariaLabel: 'API Docs Menu',
    link: '/api-docs/introduction.md',
    children: [
        {
            text: 'Introduction',
            link: '/api-docs/introduction.md',
            children: []
        },
        {
            text: 'HTTP Guide',
            children: [{
                text: "Introduction",
                link: '/api-docs/http-guide/introduction.md'
            },
            {
                text: "Get player balance",
                link: '/api-docs/http-guide/get-player-balance.md'
            },
            {
                text: "Get player seeds",
                link: '/api-docs/http-guide/get-player-seeds.md'
            },
            {
                text: "Verify game round",
                link: '/api-docs/http-guide/verify-game-round.md'
            },
            {
                text: "Get game configs",
                link: '/api-docs/http-guide/game-configs.md'
            },
            {
                text: "Get round details",
                link: '/api-docs/http-guide/get-round-details.md'
            }]
        },
        {
            text: 'Websocket Guide',
            link: '/api-docs/websocket-guide.md',
            children: []
        },
        {
            text: 'Game Integrations Guide',
            link: "/api-docs/full-game-specific-guide/blackjack.md",
            children: [{
                text: "Blackjack",
                link: "/api-docs/full-game-specific-guide/blackjack.md"
            },
            {
                text: "Limbo",
                link: "/api-docs/full-game-specific-guide/limbo.md"
            },
            {
                text: "Baccarat",
                link: "/api-docs/full-game-specific-guide/baccarat.md"
            },
            {
                text: "Dice",
                link: "/api-docs/full-game-specific-guide/dice.md"
            },
            {
                text: "Mines",
                link: "/api-docs/full-game-specific-guide/mines.md"
            }
        ]
        }]
}]



export default defineUserConfig({
    bundler: viteBundler(),
    base: "/og-docs/",
    theme: defaultTheme({

        logo: '/images/dark-bg-hexagonal.png', //https://www.virail.com/v4/images/logo-green.svg',
        logoDark: '/images/white-bg-hexagonal.png',
        repo: 'https://github.com/bernardcosta/Tangiers',
        repoLabel: 'Repository',
        navbar: [...nav,
            // {
            //     text: 'API playground',
            //     link: 'https://mapping.virail.app/docs'
            // },
            // {
            //     text: 'DB',
            //     link: 'https://mapping.virail.io'
            // }
        ],
        sidebar: nav,
        smoothScroll: true

    }),
    lang: 'en-US',
    title: 'Original Games Engine',
    description: 'Casino games built with a powerful custom game engine written in GO',
    plugins: [
        markdownImagePlugin({
          // Enable figure
          figure: true,
          // Enable image lazyload
          lazyload: true,
          // Enable image mark
          mark: true,
          // Enable image size
          size: true,
        }),
      ],
})