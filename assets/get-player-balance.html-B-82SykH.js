import{_ as s,e as n,f as e,o as t}from"./app-DXB1c3K0.js";const p={};function o(r,a){return t(),n("div",null,a[0]||(a[0]=[e(`<h1 id="get-player-balance" tabindex="-1"><a class="header-anchor" href="#get-player-balance"><span>Get Player Balance</span></a></h1><p>Retrieve a player’s current balance on the platform</p><h2 id="request" tabindex="-1"><a class="header-anchor" href="#request"><span>Request</span></a></h2><ul><li><strong>Method:</strong> GET</li><li><strong>URL:</strong> <code>https://&lt;gateway-url&gt;/v1/player/balance?game_session_id=&lt;game_session_id&gt;&amp;game_id=&lt;game_id&gt;</code></li></ul><p><strong>Query Parameters</strong>:</p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Required</th></tr></thead><tbody><tr><td>game_session_id</td><td>String</td><td>The unique identifier of the game session. Important to authenticate player.</td><td>Yes</td></tr><tr><td>game_id</td><td>String</td><td>A code give to a game as identifier</td><td>Yes</td></tr></tbody></table><div class="language-bash" data-highlighter="prismjs" data-ext="sh"><pre><code><span class="line"><span class="token function">curl</span> <span class="token parameter variable">-X</span> GET <span class="token string">&#39;https://localhost:3000/v1/player/balance?game_session_id=80ebf563-43b2-4647-ba55-1d0842bd458d&amp;game_id=og-blackjack&#39;</span></span>
<span class="line"></span></code></pre></div><h2 id="responses" tabindex="-1"><a class="header-anchor" href="#responses"><span>Responses</span></a></h2><h4 id="_200-ok" tabindex="-1"><a class="header-anchor" href="#_200-ok"><span>200 ok</span></a></h4><div class="hint-container tip"><p class="hint-container-title">✅</p><div class="language-json" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;balance&quot;</span><span class="token operator">:</span> <span class="token number">970.5515118730164</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;currency&quot;</span><span class="token operator">:</span> <span class="token string">&quot;USD&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre></div></div><h4 id="_500-internal-server-error" tabindex="-1"><a class="header-anchor" href="#_500-internal-server-error"><span>500 Internal Server Error</span></a></h4><p>This will mostly occur if the game_session_id is invalid &amp; thus player was not authenticated</p><div class="hint-container caution"><p class="hint-container-title">💥</p><div class="language-json" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Error&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Authentication Failed&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;AUTHENTICATION_FAILED&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre></div></div><h4 id="_422-unprocessable-entity" tabindex="-1"><a class="header-anchor" href="#_422-unprocessable-entity"><span>422 Unprocessable Entity</span></a></h4><p>This might be returned if an input parameter is incorrect. For example a bad game id or parameter left out.</p><div class="hint-container warning"><p class="hint-container-title">👎</p><div class="language-json" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Error&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Fetch Balance Failed&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;FETCH_BALANCE_FAILED&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre></div></div>`,16)]))}const l=s(p,[["render",o],["__file","get-player-balance.html.vue"]]),c=JSON.parse('{"path":"/api-docs/http-guide/get-player-balance.html","title":"Get Player Balance","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Request","slug":"request","link":"#request","children":[]},{"level":2,"title":"Responses","slug":"responses","link":"#responses","children":[]}],"git":{"updatedTime":1743175586000,"contributors":[{"name":"cybeni","username":"cybeni","email":"mail2048@pm.me","commits":1,"url":"https://github.com/cybeni"},{"name":"Cybeni","username":"Cybeni","email":"mail2048@pm.me","commits":1,"url":"https://github.com/Cybeni"}],"changelog":[{"hash":"9fb65b1b197d93552cd21fb3e33c67fc0809fca8","date":1743175586000,"email":"mail2048@pm.me","author":"Cybeni","message":"typo","commitUrl":"https://github.com/bernardcosta/Tangiers/commit/9fb65b1b197d93552cd21fb3e33c67fc0809fca8"},{"hash":"e1cbf965d465f1178f52e32a26074c6b95f92b79","date":1741643072000,"email":"mail2048@pm.me","author":"cybeni","message":"documenting http endpoints","commitUrl":"https://github.com/bernardcosta/Tangiers/commit/e1cbf965d465f1178f52e32a26074c6b95f92b79"}]},"filePathRelative":"api-docs/http-guide/get-player-balance.md"}');export{l as comp,c as data};
