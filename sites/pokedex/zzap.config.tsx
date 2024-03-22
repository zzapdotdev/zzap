import React from "react";
import { defineConfig } from "zzap";

export default defineConfig({
  siteTitle: "Pokedex",
  contentFolder: "./content",
  outputFolder: "./dist",
  cssFiles: [
    {
      path: "styles.css",
    },
  ],
  layout(props) {
    return (
      <>
        <html lang="en">
          <head>
            <meta charSet="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <link rel="stylesheet" href="/styles.css" />
            {props.head}
          </head>
          <body>{props.children}</body>
        </html>
      </>
    );
  },

  async dynamic() {
    const pages: Array<{ path: string; children: JSX.Element }> = [];
    const limit = 5000;
    let nextUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;

    const pokemonList: Array<{
      name: string;
      url: string;
    }> = [];

    while (nextUrl) {
      const paginatedPokemons = await fetch(nextUrl);
      const pokemons: {
        count: number;
        next: string;
        previous: any;
        results: Array<{
          name: string;
          url: string;
        }>;
      } = await paginatedPokemons.json();

      pokemonList.push(...pokemons.results);

      nextUrl = pokemons.next;
    }

    pages.push({
      path: "/",
      children: (
        <div className="container mx-auto">
          <h1 className="mb-8 text-center text-4xl font-bold text-gray-800">
            Pokedex
          </h1>
          <ul>
            {pokemonList.map((pokemon) => (
              <li key={pokemon.name}>
                <a href={`/pokemon/${pokemon.name}`}>{pokemon.name}</a>
              </li>
            ))}
          </ul>
        </div>
      ),
    });

    for (const pokemon of pokemonList) {
      pages.push({
        path: `/pokemon/${pokemon.name}`,
        children: (
          <>
            <h1>{pokemon.name}</h1>
            <img
              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.url
                .split("/")
                .slice(-2, -1)}.png`}
              alt={pokemon.name}
            />
          </>
        ),
      });
    }

    return pages;
  },
});
