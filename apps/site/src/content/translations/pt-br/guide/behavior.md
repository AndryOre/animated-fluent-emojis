---
title: Comportamento
sourceHash: 1c585e5ee4f3bb6f
---

<a id="hover-and-focus"></a>

## Hover e foco

Com `playOnHover`, a animação é reproduzida após a execução inicial quando o
ponteiro entra no emoji, e também quando o emoji está dentro de um `<button>` ou
`<a>` que recebe o foco do teclado (`:focus-visible`).

<a id="reduced-motion"></a>

## Movimento reduzido

Quando o sistema do usuário pede para reduzir o movimento
(`prefers-reduced-motion: reduce`), `autoPlay` é ignorado e o emoji fica em seu
poster frame, o primeiro quadro da animação. `playOnHover` ainda reproduz no
hover e no foco, porque isso é uma ação explícita do usuário.

## Fallback

Se o sprite sheet falhar ao carregar, `Emoji` mostra o fallback glyph: o
caractere Unicode nativo do emoji, rotulado com `alt`. Passe `fallback` para
renderizar o seu próprio nó, ou `fallback={null}` para não renderizar nada:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` é executado quando a imagem falha (com o evento) e quando o manifest
falha (sem ele). O fallback glyph depende do manifest, então, quando o próprio
manifest falhou, só um nó `fallback` explícito é renderizado. Um id desconhecido
renderiza o nó `fallback`, ou nada; ele não chama `onError` e, em
desenvolvimento, avisa uma vez por id. A requisição do manifest desiste após 15
segundos e é repetida como qualquer outra falha.

<a id="playback"></a>

## Reprodução

O autoplay espera até que o sprite sheet tenha carregado, o emoji esteja na tela
e a aba esteja visível, então emojis fora da tela ou em segundo plano não
animam. Abas ocultas pausam todos os emojis e retomam quando a aba volta. Mudar
o `id` inicia de novo a execução inicial do novo emoji. `animationIterations`
igual a `0`, a um número negativo ou a `NaN` desativa o autoplay; `Infinity` é o
mesmo que `'infinite'`. Enquanto o autoplay está retido, o emoji mostra seu
poster frame.

Use `playing` para controlar a reprodução você mesmo. `true` reproduz
`animationIterations` execuções, sobrepondo-se a `autoPlay` e ao movimento
reduzido (ainda esperando pela imagem, pela viewport e por uma aba visível);
`false` pausa no quadro atual. Uma execução concluída não é reiniciada ao
alternar, então remonte com um novo `key` para reproduzir de novo.
`onPlaybackEnd` é executado uma vez quando uma execução finita termina; ele
nunca é executado para `'infinite'` ou quando o emoji é desmontado no meio de
uma execução.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```
