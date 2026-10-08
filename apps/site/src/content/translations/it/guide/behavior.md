---
title: Comportamento
sourceHash: 1c585e5ee4f3bb6f
---

<a id="hover-and-focus"></a>

## Hover e focus

Con `playOnHover`, l'animazione viene riprodotta dopo l'esecuzione iniziale
quando il puntatore entra nell'emoji, e anche quando l'emoji si trova dentro un
`<button>` o un `<a>` che riceve il focus da tastiera (`:focus-visible`).

<a id="reduced-motion"></a>

## Movimento ridotto

Quando il sistema dell'utente chiede di ridurre il movimento
(`prefers-reduced-motion: reduce`), `autoPlay` viene ignorato e l'emoji resta
sul suo poster frame, il primo fotogramma dell'animazione. `playOnHover`
continua a riprodurre al passaggio del puntatore e al focus, perché è un'azione
esplicita dell'utente.

## Fallback

Se lo sprite sheet non si carica, `Emoji` mostra il fallback glyph: il carattere
Unicode nativo dell'emoji, etichettato con `alt`. Passa `fallback` per
renderizzare invece il tuo nodo, oppure `fallback={null}` per non renderizzare
nulla:

```jsx
<Emoji id="1f44b_wavinghand" fallback={<span>👋</span>} />
<Emoji id="1f44b_wavinghand" fallback={null} />
```

`onError` viene eseguito quando l'immagine fallisce (con l'evento) e quando
fallisce il manifest (senza). Il fallback glyph ha bisogno del manifest; quando
è il manifest stesso a fallire, viene quindi renderizzato solo un nodo
`fallback` esplicito. Un id sconosciuto renderizza il nodo `fallback`, oppure
niente; non chiama `onError` e, in sviluppo, avvisa una sola volta per id. La
richiesta del manifest si interrompe dopo 15 secondi e viene ritentata come
qualsiasi altro fallimento.

<a id="playback"></a>

## Riproduzione

L'autoplay aspetta che lo sprite sheet sia caricato, che l'emoji sia sullo
schermo e che la scheda sia visibile; gli emoji fuori schermo o in background
non si animano quindi. Le schede nascoste mettono in pausa tutti gli emoji e li
riprendono quando la scheda torna in primo piano. Cambiare `id` riavvia
l'esecuzione iniziale del nuovo emoji. Un `animationIterations` pari a `0`, un
numero negativo o `NaN` disattiva l'autoplay; `Infinity` equivale a
`'infinite'`. Finché l'autoplay è trattenuto, l'emoji mostra il suo poster
frame.

Usa `playing` per controllare tu stesso la riproduzione. `true` riproduce
`animationIterations` esecuzioni, scavalcando `autoPlay` e il movimento ridotto
(aspettando comunque l'immagine, il viewport e una scheda visibile); `false`
mette in pausa sul fotogramma corrente. Un'esecuzione terminata non riparte
quando si commuta, quindi per rigiocarla va rimontato il componente con una
nuova `key`. `onPlaybackEnd` viene eseguito una volta quando un'esecuzione
finita termina; non viene mai eseguito con `'infinite'` né quando l'emoji viene
smontato durante un'esecuzione.

```jsx
<Emoji id="1f389_partypopper" playing={isOpen} onPlaybackEnd={handleDone} />
```
