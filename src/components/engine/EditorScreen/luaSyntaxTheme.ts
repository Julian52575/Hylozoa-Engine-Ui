import type { Monaco } from "@monaco-editor/react";
import { LUA_KEYWORDS, LUA_BUILTINS, GLOBAL_FUNCTIONS, LIFECYCLE_CALLBACKS, TYPE_MEMBERS } from "./luaCompletions";

/**
 * Remplace le tokenizer Lua par défaut de Monaco par une version qui reconnaît
 * en plus les types (Vec2, Transform...) et fonctions (instantiate, get_transform...)
 * de l'API Hylozoa comme des catégories de tokens à part, pour pouvoir les colorer.
 */
export function registerHylozoaLuaTheme(monaco: Monaco) {
  const typeNames = Object.keys(TYPE_MEMBERS);
  const apiFunctionNames = GLOBAL_FUNCTIONS.map((f) => f.label);
  const callbackNames = LIFECYCLE_CALLBACKS.map((f) => f.label);

  monaco.languages.setMonarchTokensProvider("lua", {
    defaultToken: "",
    tokenPostfix: ".lua",

    keywords: LUA_KEYWORDS,
    builtins: LUA_BUILTINS,
    hylozoaTypes: typeNames,
    hylozoaFunctions: apiFunctionNames,
    hylozoaCallbacks: callbackNames,

    symbols: /[=><!~?:&|+\-*\/\^%]+/,

    tokenizer: {
      root: [
        // identifiants -> on vérifie d'abord nos catégories custom, puis le reste
        [
          /[A-Za-z_][A-Za-z0-9_]*/,
          {
            cases: {
              "@hylozoaTypes": "type.hylozoa",
              "@hylozoaCallbacks": "function.hylozoa.callback",
              "@hylozoaFunctions": "function.hylozoa.api",
              "@keywords": "keyword",
              "@builtins": "predefined",
              "@default": "identifier",
            },
          },
        ],

        { include: "@whitespace" },

        // nombres
        [/\d+\.\d*([eE][+-]?\d+)?/, "number.float"],
        [/0[xX][0-9a-fA-F]+/, "number.hex"],
        [/\d+/, "number"],

        // chaînes
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/\[(=*)\[/, { token: "string", next: "@longstring" }],

        // ponctuation / opérateurs
        [/[{}()\[\]]/, "@brackets"],
        [/@symbols/, "operator"],
        [/[;,.]/, "delimiter"],
      ],

      whitespace: [
        [/[ \t\r\n]+/, ""],
        [/--\[(=*)\[/, { token: "comment", next: "@longcomment" }],
        [/--.*$/, "comment"],
      ],

      longstring: [
        [/[^\]]+/, "string"],
        [/\]\]/, { token: "string", next: "@pop" }],
        [/./, "string"],
      ],

      longcomment: [
        [/[^\]]+/, "comment"],
        [/\]\]/, { token: "comment", next: "@pop" }],
        [/./, "comment"],
      ],
    },
  });

  monaco.editor.defineTheme("hylozoa-lua-theme", {
    base: "vs",
    inherit: true,
    rules: [
      // Types du moteur (Vec2, Transform, NoiseInfo...) -> vert profond
      { token: "type.hylozoa", foreground: "0E7C42" },
      // Fonctions de l'API Hylozoa (instantiate, get_transform...) -> orange/brun foncé
      { token: "function.hylozoa.api", foreground: "B25000" },
      // Callbacks du moteur (onUpdate, onNoise...) -> violet profond, italique
      { token: "function.hylozoa.callback", foreground: "9B2393", fontStyle: "italic" },
      // Mots-clés Lua (local, function, if, end, do, return...) -> bleu franc
      { token: "keyword", foreground: "0000FF" },
      // Fonctions natives Lua (math, table, string, print, pairs...) -> cyan foncé
      { token: "predefined", foreground: "1B6E88" },
      { token: "comment", foreground: "008000" },
      { token: "string", foreground: "A31515" },
      { token: "number", foreground: "098658" },
      { token: "number.float", foreground: "098658" },
      { token: "number.hex", foreground: "098658" },
    ],
    colors: {
    //   "editor.background": "#FFCCCC",
    },
  });

  monaco.editor.setTheme("hylozoa-lua-theme");
}