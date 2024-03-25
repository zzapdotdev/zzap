// import React from "react";
// import { defineConfig } from "zzap";

// export default defineConfig({
//   siteTitle: "Pokedex",
//   contentFolder: "./content",
//   outputFolder: "./dist",
//   cssFiles: [
//     {
//       path: "../../node_modules/@picocss/pico/css/pico.css",
//     },
//   ],
//   layout(props) {
//     return (
//       <>
//         <html lang="en">
//           <head>
//             <meta charSet="UTF-8" />
//             <meta
//               name="viewport"
//               content="width=device-width, initial-scale=1.0"
//             />
//             <link rel="stylesheet" href="/pico.css" />
//             {props.head}
//           </head>
//           <body className="container">
//             <nav
//               style={{
//                 marginBottom: "2rem",
//               }}
//             >
//               <ul>
//                 <li>
//                   <strong>Pokedex (zaap)</strong>
//                 </li>
//               </ul>
//               <ul>
//                 <li>
//                   <a href="/">Home</a>
//                 </li>
//               </ul>
//             </nav>
//             {props.children}
//           </body>
//         </html>
//       </>
//     );
//   },
// });

// // async dynamic(context) {
// //   const pages: Array<{ path: string; children: JSX.Element }> = [];
// //   const limit = 5000;
// //   let nextUrl = `https://pokeapi.co/api/v2/pokemon?limit=${limit}`;

// //   const pokemonList: Array<{
// //     name: string;
// //     url: string;
// //   }> = [];

// //   while (nextUrl) {
// //     const paginatedPokemons = await fetch(nextUrl);
// //     const pokemons: {
// //       count: number;
// //       next: string;
// //       previous: any;
// //       results: Array<{
// //         name: string;
// //         url: string;
// //       }>;
// //     } = await paginatedPokemons.json();

// //     pokemonList.push(...pokemons.results);

// //     nextUrl = pokemons.next;
// //   }

// //   context.addPage({
// //     path: "/",
// //     children: (
// //       <div className="">
// //         <h1 className="">Pokedex</h1>
// //         <ul>
// //           {pokemonList.map((pokemon) => (
// //             <li key={pokemon.name}>
// //               <a href={`/pokemon/${pokemon.name}`}>{pokemon.name}</a>
// //             </li>
// //           ))}
// //         </ul>
// //       </div>
// //     ),
// //   });

// //   const ps = pokemonList.map(async (pokemon) => {
// //     const detailedPokemonResponse = await fetch(pokemon.url);
// //     const detailedPokemon: {
// //       name: string;
// //       url: string;
// //     } = await detailedPokemonResponse.json();

// //     context.addPage({
// //       path: `/pokemon/${pokemon.name}`,
// //       children: (
// //         <>
// //           <h1>{detailedPokemon.name}</h1>
// //           <img
// //             src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.url
// //               .split("/")
// //               .slice(-2, -1)}.png`}
// //             alt={pokemon.name}
// //           />
// //         </>
// //       ),
// //     });
// //   });

// //   await Promise.all(ps);
// // },
