import{_ as n,e as a,f as e,o as t}from"./app-DXB1c3K0.js";const o={};function p(l,s){return t(),a("div",null,s[0]||(s[0]=[e(`<h1 id="get-round-details" tabindex="-1"><a class="header-anchor" href="#get-round-details"><span>Get Round Details</span></a></h1><p>All round information is stored in the backend game database. This information can be useful to players in order to see their historical gameplay. This is also useful for them in order to verify that the round was not tampered with.</p><p>Games like Limbo also add this as part of the game component where players can click on previous generated limbo multipliers to see the outcome.</p><h2 id="request" tabindex="-1"><a class="header-anchor" href="#request"><span>Request</span></a></h2><ul><li><strong>Method:</strong> GET</li><li><strong>URL:</strong> <code>http://&lt;gateway-url&gt;/v1/games/&lt;game_id&gt;/rounds/&lt;round_id&gt;?game_session_id=&lt;game_session_id&gt;</code></li></ul><p><strong>Path Parameters:</strong></p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Required</th></tr></thead><tbody><tr><td>game_id</td><td>String</td><td>Unique code that identifies which game to get round details of</td><td>Yes</td></tr><tr><td>round_id</td><td>string</td><td>Unique id of a historical round that was played</td><td>yes</td></tr></tbody></table><p><strong>Query Parameters:</strong></p><table><thead><tr><th>Parameter</th><th>Type</th><th>Description</th><th>Required</th></tr></thead><tbody><tr><td>game_session_id</td><td>String</td><td>The unique identifier of the game session. Important to authenticate player.</td><td>Yes</td></tr></tbody></table><p><strong>Example</strong></p><div class="language-bash line-numbers-mode" data-highlighter="prismjs" data-ext="sh"><pre><code><span class="line"><span class="token function">curl</span> <span class="token parameter variable">--location</span> <span class="token string">&#39;http://localhost:3000/v1/games/og-limbo/rounds/12dbf97b-2b91-498d-ac5b-727995059af2?game_session_id=some-game-session-id&#39;</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div></div></div><h2 id="response-limbo-example" tabindex="-1"><a class="header-anchor" href="#response-limbo-example"><span>Response: Limbo Example</span></a></h2><h4 id="_200-ok" tabindex="-1"><a class="header-anchor" href="#_200-ok"><span>200 ok</span></a></h4><div class="hint-container tip"><p class="hint-container-title">✅</p><div class="language-json" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;clientSeed&quot;</span><span class="token operator">:</span> <span class="token string">&quot;jzjdf784hf&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;nonce&quot;</span><span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;isVerifiable&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;serverSeed&quot;</span><span class="token operator">:</span> <span class="token string">&quot;khsfASKFkasodf834965hsdvs9d8ch&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;roundOutcome&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;betAmount&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;multiplier&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.01&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;payout&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.01&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;generatedMultiplier&quot;</span><span class="token operator">:</span> <span class="token string">&quot;7&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;payoutMultiplier&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.01&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre></div></div><div class="hint-container info"><p class="hint-container-title">IMPORTANT</p><p>The <code>isVerifiable</code> field means that the player&#39;s current server seed he is using is not the same as the one used for this round. Meaning that we could safely show that <code>serverSeed</code> to the player and thus he can <strong>verify</strong> that the game was not tempered with</p></div><p>If <code>isVerifiable</code> is <code>false</code> then the <code>serverSeed</code> key will not be in the JSON response. Instead there will the the hashed server seed instead:</p><div class="hint-container tip"><p class="hint-container-title">✅</p><div class="language-json" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;clientSeed&quot;</span><span class="token operator">:</span> <span class="token string">&quot;HoLgR34Fhn&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;nonce&quot;</span><span class="token operator">:</span> <span class="token number">4</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;isVerifiable&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;serverSeedHashed&quot;</span><span class="token operator">:</span> <span class="token string">&quot;489c143e1e3a16b80b8e96f4b468d4d974f20d5dac69704de5efac3371eea0d5&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;roundOutcome&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span></span>
<span class="line">        <span class="token property">&quot;betAmount&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;multiplier&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.01&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;payout&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.01&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;generatedMultiplier&quot;</span><span class="token operator">:</span> <span class="token string">&quot;7&quot;</span><span class="token punctuation">,</span></span>
<span class="line">        <span class="token property">&quot;payoutMultiplier&quot;</span><span class="token operator">:</span> <span class="token string">&quot;1.01&quot;</span></span>
<span class="line">    <span class="token punctuation">}</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre></div></div><h4 id="_500-error" tabindex="-1"><a class="header-anchor" href="#_500-error"><span>500 Error</span></a></h4><p>If a wrong <code>round_id</code> is placed.</p><div class="hint-container caution"><p class="hint-container-title">💥</p><div class="language-json line-numbers-mode" data-highlighter="prismjs" data-ext="json"><pre><code><span class="line"><span class="token punctuation">{</span></span>
<span class="line">    <span class="token property">&quot;eventType&quot;</span><span class="token operator">:</span> <span class="token string">&quot;error&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;message&quot;</span><span class="token operator">:</span> <span class="token string">&quot;No state was found for this round and game.&quot;</span><span class="token punctuation">,</span></span>
<span class="line">    <span class="token property">&quot;code&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ROUND_DETAILS_NOT_FOUND&quot;</span></span>
<span class="line"><span class="token punctuation">}</span></span>
<span class="line"></span></code></pre><div class="line-numbers" aria-hidden="true" style="counter-reset:line-number 0;"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></div>`,20)]))}const r=n(o,[["render",p],["__file","get-round-details.html.vue"]]),c=JSON.parse('{"path":"/api-docs/http-guide/get-round-details.html","title":"Get Round Details","lang":"en-US","frontmatter":{},"headers":[{"level":2,"title":"Request","slug":"request","link":"#request","children":[]},{"level":2,"title":"Response: Limbo Example","slug":"response-limbo-example","link":"#response-limbo-example","children":[]}],"git":{"updatedTime":1743172952000,"contributors":[{"name":"Cybeni","username":"Cybeni","email":"mail2048@pm.me","commits":1,"url":"https://github.com/Cybeni"}],"changelog":[{"hash":"5bb8649a3e05fcd2d3e61a37201400596d5703ae","date":1743172952000,"email":"mail2048@pm.me","author":"Cybeni","message":"New endpoint GET round details","commitUrl":"https://github.com/bernardcosta/Tangiers/commit/5bb8649a3e05fcd2d3e61a37201400596d5703ae"}]},"filePathRelative":"api-docs/http-guide/get-round-details.md"}');export{r as comp,c as data};
