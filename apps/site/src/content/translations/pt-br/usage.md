---
title: Guia de uso
sourceHash: 4101ae648cca44fe
---

A API completa do `animated-fluent-emojis`, um tópico por página. Para a
instalação e o seu primeiro emoji, comece pelo [README](../README.md).

As props abaixo são compartilhadas por todos os adaptadores; cada seção de
framework indica como cada prop é escrita ali. O componente busca um manifest
pequeno do asset site na primeira vez que um emoji é renderizado, nunca no
momento da importação. Enquanto ele carrega, `Emoji` renderiza um placeholder
vazio e `aria-hidden` com o tamanho final, para que o layout não se desloque. Se
o id for desconhecido, ele renderiza o seu nó `fallback`, ou nada. Se o manifest
não puder ser carregado, ele renderiza o seu nó `fallback`, ou nada, e tenta de
novo na próxima montagem, na próxima chamada a `preloadEmojis` ou quando o
navegador voltar a ficar online.

## Instalação

```sh
bun add animated-fluent-emojis
```

## Guia

- [Frameworks](guide/frameworks.md): React, Vue, Svelte, Astro, HTML puro e
  `createEmoji`.
- [Props](guide/props.md): cada prop, o seu tipo e o seu valor padrão.
- [Comportamento](guide/behavior.md): hover e foco, movimento reduzido, fallback
  e reprodução.
- [Assets](guide/assets.md): imagens e sprite sheets HD, pré-carregamento e o
  asset site.
- [Lookup](guide/lookup.md): encontre emojis por glifo, texto ou descrição.
- [Tipos](guide/types.md): os tipos exportados.
