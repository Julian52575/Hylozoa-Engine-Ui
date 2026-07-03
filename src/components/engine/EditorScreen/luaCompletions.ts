import type { Monaco } from "@monaco-editor/react";

// ---------------------------------------------------------------------------
// DONNÉES STATIQUES — définies une seule fois, hors du composant React
// ---------------------------------------------------------------------------

export const LUA_KEYWORDS = [
  "and", "break", "do", "else", "elseif", "end", "false", "for", "function",
  "goto", "if", "in", "local", "nil", "not", "or", "repeat", "return",
  "then", "true", "until", "while",
];

export const LUA_BUILTINS = [
  "print", "pairs", "ipairs", "tostring", "tonumber", "type", "table",
  "string", "math", "pcall", "error", "assert", "require", "select",
  "setmetatable", "getmetatable", "rawget", "rawset", "next", "unpack", "os",
];

// Fonctions globales de l'API du moteur (kind: Function)
// Note: pas de `range` ni de `kind` monaco ici -> ajoutés au moment de la génération
type RawFunction = {
  label: string;
  insertText: string;
  detail: string;
  documentation: string;
  returns?: string; // type retourné, pour l'inférence (ex: "Transform")
};

export const GLOBAL_FUNCTIONS: RawFunction[] = [
  {
    label: "log_message",
    insertText: "log_message('${1:message}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Enregistre un message dans la console du moteur Hylozoa.\n\n**Exemple :**\n```lua\nlog_message('${1:message}')\n```",
  },
  {
    label: "get_transform",
    insertText: "get_transform(${1:entity})",
    detail: "Moteur Hylozoa API",
    documentation:
      "Récupère la transformation d'une entité.\n\n**Exemple :**\n```lua\nget_transform(${1:entity})\n```",
    returns: "Transform",
  },
  {
    label: "get_name",
    insertText: "get_name(${1:entity})",
    detail: "Moteur Hylozoa API",
    documentation:
      "Récupère le nom d'une entité.\n\n**Exemple :**\n```lua\nget_name(${1:entity})\n```",
  },
  {
    label: "destroy_entity",
    insertText: "destroy_entity(${1:entity})",
    detail: "Moteur Hylozoa API",
    documentation:
      "Supprime instantanément l'entité spécifiée de la scène active et libère ses composants de la mémoire.\n\n**Exemple :**\n```lua\ndestroy_entity(${1:entity})\n```",
  },
  {
    label: "instantiate",
    insertText: "instantiate('${1:prefabName}', ${2:position})",
    detail: "Moteur Hylozoa API",
    documentation:
      "Instancie un prefab dans la scène.\n\n**Exemple :**\n```lua\ninstantiate('${1:prefabName}', ${2:position})\n```",
  },
  {
    label: "is_key_pressed",
    insertText: "is_key_pressed('${1:key}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Vérifie si une touche est actuellement pressée.\n\n**Exemple :**\n```lua\nis_key_pressed('${1:key}')\n```",
  },
  {
    label: "is_key_released",
    insertText: "is_key_released('${1:key}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Vérifie si une touche est actuellement relâchée.\n\n**Exemple :**\n```lua\nis_key_released('${1:key}')\n```",
  },
  {
    label: "is_key_held",
    insertText: "is_key_held('${1:key}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Vérifie si une touche est actuellement maintenue.\n\n**Exemple :**\n```lua\nis_key_held('${1:key}')\n```",
  },
  {
    label: "is_mouse_button_pressed",
    insertText: "is_mouse_button_pressed(${1:button})",
    detail: "Moteur Hylozoa API",
    documentation:
      "Vérifie si un bouton de la souris est actuellement pressé.\n\n**Exemple :**\n```lua\nis_mouse_button_pressed(${1:button})\n```",
  },
  {
    label: "is_mouse_button_released",
    insertText: "is_mouse_button_released(${1:button})",
    detail: "Moteur Hylozoa API",
    documentation:
      "Vérifie si un bouton de la souris est actuellement relâché.\n\n**Exemple :**\n```lua\nis_mouse_button_released(${1:button})\n```",
  },
  {
    label: "load_scene",
    insertText: "load_scene('${1:sceneName}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Charge une scène dans le jeu.\n\n**Exemple :**\n```lua\nload_scene('${1:sceneName}')\n```",
  },
  {
    label: "unload_scene",
    insertText: "unload_scene('${1:sceneName}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Décharge une scène du jeu.\n\n**Exemple :**\n```lua\nunload_scene('${1:sceneName}')\n```",
  },
  {
    label: "has_tag",
    insertText: "has_tag('${1:entity}', '${2:tag}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Vérifie si une entité a un tag spécifique.\n\n**Exemple :**\n```lua\nhas_tag('${1:entity}', '${2:tag}')\n```",
  },
  {
    label: "add_tag",
    insertText: "add_tag('${1:entity}', '${2:tag}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Ajoute un tag à une entité.\n\n**Exemple :**\n```lua\nadd_tag('${1:entity}', '${2:tag}')\n```",
  },
  {
    label: "remove_tag",
    insertText: "remove_tag('${1:entity}', '${2:tag}')",
    detail: "Moteur Hylozoa API",
    documentation:
      "Supprime un tag d'une entité.\n\n**Exemple :**\n```lua\nremove_tag('${1:entity}', '${2:tag}')\n```",
  },
];

// Callbacks de cycle de vie (kind: Method), proposés uniquement en contexte global / top-level
export const LIFECYCLE_CALLBACKS: RawFunction[] = [
  {
    label: "onUpdate",
    insertText: "onUpdate(entity,dt)\n\t${1:-- code here}\nend",
    detail: "Callback Moteur (Optionnel)",
    documentation:
      "Fonction de cycle de vie appelée automatiquement par le moteur à chaque frame si elle est présente dans le script.\n\n**Paramètres :**\n* `dt` (number) : Le *Delta Time* (temps écoulé depuis la dernière frame en secondes).\n\n**Exemple :**\n```lua\nfunction onUpdate(dt)\n  self.rotation = self.rotation + 90 * dt\nend\n```",
  },
  {
    label: "onNoise",
    insertText: "onNoise(entity,source,noiseInfo)\n\t${1:-- code here}\nend",
    detail: "Callback Moteur (Optionnel)",
    documentation:
      "Appelée quand cette entité entend un bruit. Nécessite un composant d'écoute de bruit.\n\n**Paramètres :**\n* `source` (Entity)\n* `noiseInfo` (table)",
  },
  {
    label: "onCollisionBegin",
    insertText: "onCollisionBegin(entity,other)\n\t${1:-- code here}\nend",
    detail: "Callback Moteur (Optionnel)",
    documentation: "Appelée au début d'une collision avec une autre entité.",
  },
  {
    label: "onCollisionEnd",
    insertText: "onCollisionEnd(entity,other)\n\t${1:-- code here}\nend",
    detail: "Callback Moteur (Optionnel)",
    documentation: "Appelée à la fin d'une collision avec une autre entité.",
  },
  {
    label: "onSensorEnter",
    insertText: "onSensorEnter(entity,other)\n\t${1:-- code here}\nend",
    detail: "Callback Moteur (Optionnel)",
    documentation: "Appelée à l'entrée dans une zone de capteur.",
  },
  {
    label: "onSensorExit",
    insertText: "onSensorExit(entity,other)\n\t${1:-- code here}\nend",
    detail: "Callback Moteur (Optionnel)",
    documentation: "Appelée à la sortie d'une zone de capteur.",
  },
];

// Membres de types (kind: Field / Constructor), organisés par "namespace"
type RawMember = RawFunction & {
  isField?: boolean; // true = simple champ d'instance (ex: vec.x)
  isStatic?: boolean; // true = accessible uniquement via le nom du type (ex: Vec2.new(...))
};

export const TYPE_MEMBERS: Record<string, RawMember[]> = {
  Vec2: [
    {
      label: "new",
      insertText: "new(${1:x}, ${2:y})",
      detail: "Vec2.new(x, y)",
      documentation:
        "Crée un nouveau vecteur 2D.\n\n**Exemple :**\n```lua\nlocal pos = Vec2.new(10, 20)\n```",
      isStatic: true,
    },
    { label: "x", insertText: "x", detail: "number", documentation: "Composante X du vecteur.", isField: true },
    { label: "y", insertText: "y", detail: "number", documentation: "Composante Y du vecteur.", isField: true },
  ],
  Transform: [
    {
      label: "position",
      insertText: "position",
      detail: "Vec2",
      documentation: "Position de l'entité.",
      isField: true,
      returns: "Vec2",
    },
    {
      label: "rotation",
      insertText: "rotation",
      detail: "number",
      documentation: "Rotation de l'entité (en degrés).",
      isField: true,
    },
    {
      label: "scale",
      insertText: "scale",
      detail: "Vec2",
      documentation: "Échelle de l'entité.",
      isField: true,
      returns: "Vec2",
    },
  ],
  NoiseInfo: [
    {
      label: "noiseName",
      insertText: "noiseName",
      detail: "string",
      documentation: "Nom/identifiant du bruit émis.",
      isField: true,
    },
    {
      label: "position",
      insertText: "position",
      detail: "Vec2",
      documentation: "Position à laquelle le bruit a été émis.",
      isField: true,
      returns: "Vec2",
    },
    {
      label: "direction",
      insertText: "direction",
      detail: "Vec2",
      documentation: "Direction du bruit émis.",
      isField: true,
      returns: "Vec2",
    },
  ],
};

// Types des paramètres des callbacks de cycle de vie, par nom de paramètre.
// Sert à inférer le type d'un paramètre comme "noiseInfo" dans
// function onNoise(self, source, noiseInfo) -> noiseInfo est un NoiseInfo.
const CALLBACK_PARAM_TYPES: Record<string, Record<string, string>> = {
  onNoise: { source: "Entity", noiseInfo: "NoiseInfo" },
  onCollisionBegin: { other: "Entity" },
  onCollisionEnd: { other: "Entity" },
  onSensorEnter: { other: "Entity" },
  onSensorExit: { other: "Entity" },
};

// ---------------------------------------------------------------------------
// LOGIQUE DU PROVIDER
// ---------------------------------------------------------------------------

function toMonacoItem(
  monaco: Monaco,
  item: RawFunction | RawMember,
  range: any,
  kind: any
) {
  const isSnippet = /\$\{/.test(item.insertText);
  return {
    label: item.label,
    kind,
    insertText: item.insertText,
    insertTextRules: isSnippet
      ? monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
      : undefined,
    range,
    detail: item.detail,
    documentation: { value: item.documentation },
  };
}

/**
 * Tente de déterminer le type Lua d'une variable locale en cherchant
 * `local x = fonction(...)` dans le fichier, et en regardant le type
 * de retour connu de cette fonction (GLOBAL_FUNCTIONS.returns).
 * Heuristique simple — pas un vrai système de types.
 */
function inferVariableType(fileText: string, varName: string): string | null {
  // Cas 1 : local x = TypeName.methode(...) -> ex: Vec2.new(...) => type = "Vec2"
  const typeConstructorRegex = new RegExp(
    `local\\s+${varName}\\s*=\\s*([A-Za-z_][A-Za-z0-9_]*)\\.[A-Za-z_][A-Za-z0-9_]*\\s*\\(`
  );
  const ctorMatch = fileText.match(typeConstructorRegex);
  if (ctorMatch && TYPE_MEMBERS[ctorMatch[1]]) {
    return ctorMatch[1];
  }

  // Cas 2 : local x = get_transform(...) -> type = retour connu de la fonction
  const localAssignRegex = new RegExp(
    `local\\s+${varName}\\s*=\\s*([A-Za-z_][A-Za-z0-9_]*)\\s*\\(`
  );
  const assignMatch = fileText.match(localAssignRegex);
  if (assignMatch) {
    const fn = GLOBAL_FUNCTIONS.find((f) => f.label === assignMatch[1]);
    if (fn?.returns) return fn.returns;
  }

  // Cas 3 : function onNoise(self, source, noiseInfo) -> noiseInfo est un paramètre
  // de callback dont le type est connu via CALLBACK_PARAM_TYPES.
  const fnDefRegex = /function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)/g;
  let defMatch: RegExpExecArray | null;
  while ((defMatch = fnDefRegex.exec(fileText)) !== null) {
    const callbackName = defMatch[1];
    const params = defMatch[2].split(",").map((p) => p.trim());
    if (params.includes(varName) && CALLBACK_PARAM_TYPES[callbackName]?.[varName]) {
      return CALLBACK_PARAM_TYPES[callbackName][varName];
    }
  }

  return null;
}

type LocalSymbol = { name: string; type: string | null };

/**
 * Scanne tout le fichier pour extraire :
 * - les déclarations `local x`, `local x = ...`, `local a, b, c = ...`
 * - les paramètres de toutes les fonctions (nommées ou anonymes), y compris `self`
 * Retourne une liste dédupliquée de symboles avec leur type inféré si connu.
 * Heuristique simple, sans vraie analyse de portée (scope) : suffisant pour
 * proposer des suggestions utiles dans un petit script.
 */
function extractLocalSymbols(fileText: string): LocalSymbol[] {
  const found = new Map<string, string | null>();

  // 1) déclarations locales : "local a, b, c = ..." ou "local x"
  const localDeclRegex = /local\s+([A-Za-z_][A-Za-z0-9_]*(?:\s*,\s*[A-Za-z_][A-Za-z0-9_]*)*)/g;
  let localMatch: RegExpExecArray | null;
  while ((localMatch = localDeclRegex.exec(fileText)) !== null) {
    const names = localMatch[1].split(",").map((n) => n.trim());
    for (const name of names) {
      if (!found.has(name)) {
        found.set(name, inferVariableType(fileText, name));
      }
    }
  }

  // 2) paramètres de toutes les fonctions : "function foo(a, b, c)" ou "function(a, b)"
  const fnParamsRegex = /function\s*[A-Za-z_][A-Za-z0-9_]*\s*\(([^)]*)\)|function\s*\(([^)]*)\)/g;
  let fnMatch: RegExpExecArray | null;
  while ((fnMatch = fnParamsRegex.exec(fileText)) !== null) {
    const paramList = fnMatch[1] ?? fnMatch[2] ?? "";
    const params = paramList
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    for (const name of params) {
      if (!found.has(name)) {
        found.set(name, inferVariableType(fileText, name));
      }
    }
  }

  return Array.from(found.entries()).map(([name, type]) => ({ name, type }));
}

export function registerHylozoaLuaProvider(monaco: Monaco) {
  monaco.languages.registerCompletionItemProvider("lua", {
    triggerCharacters: [".", ":"],
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      };

      const textBeforeCursor = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      // Cherche une chaîne du type "a.b.c." juste avant le curseur
      const chainMatch = textBeforeCursor.match(
        /([A-Za-z_][A-Za-z0-9_]*(?:[.:][A-Za-z_][A-Za-z0-9_]*)*)[.:]\s*[A-Za-z0-9_]*$/
      );

      // --- Cas 1 : on tape après un "." ou ":" -> résoudre le type et ne montrer QUE ses membres ---
      if (chainMatch) {
        const parts = chainMatch[1].split(/[.:]/);
        const rootName = parts[0];

        // La racine est soit le nom du type lui-même (accès STATIQUE, ex: "Vec2.new"),
        // soit une variable dont on infère le type (accès INSTANCE, ex: "transform" -> "Transform")
        const rootIsTypeName = !!TYPE_MEMBERS[rootName];
        let currentType: string | null = rootIsTypeName
          ? rootName
          : inferVariableType(model.getValue(), rootName);
        // true tant qu'on est encore sur le premier segment ET que ce segment est le nom du type
        let isStaticAccess = rootIsTypeName;

        for (let i = 1; i < parts.length && currentType; i++) {
          const members = TYPE_MEMBERS[currentType] || [];
          const field = members.find((m) => m.label === parts[i]);
          currentType = field?.returns ?? null;
          // dès qu'on descend d'un niveau (a.b), on est forcément sur une instance,
          // plus jamais un accès statique (a.b.new n'a pas de sens)
          isStaticAccess = false;
        }

        if (currentType && TYPE_MEMBERS[currentType]) {
          const allMembers = TYPE_MEMBERS[currentType];
          const typeHasStaticMembers = allMembers.some((m) => m.isStatic);

          // Si le type n'a aucun membre statique (ex: Transform, NoiseInfo -> que des champs),
          // la distinction statique/instance n'a pas de sens : on montre tout.
          // Sinon (ex: Vec2 avec "new"), on filtre selon le mode d'accès détecté.
          const members = typeHasStaticMembers
            ? allMembers.filter((m) => (isStaticAccess ? m.isStatic : !m.isStatic))
            : allMembers;

          const suggestions = members.map((m) =>
            toMonacoItem(
              monaco,
              m,
              range,
              m.isField
                ? monaco.languages.CompletionItemKind.Field
                : monaco.languages.CompletionItemKind.Method
            )
          );
          return { suggestions };
        }

        // Type inconnu -> pas de suggestions plutôt que de tout montrer
        return { suggestions: [] };
      }

      // --- Cas 2 : contexte global -> keywords, builtins, fonctions API, callbacks, noms de types, variables locales ---
      const localSymbols = extractLocalSymbols(model.getValue()).filter(
        (s) => !LUA_KEYWORDS.includes(s.name)
      );

      const suggestions = [
        ...LUA_KEYWORDS.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range,
        })),
        ...LUA_BUILTINS.map((fn) => ({
          label: fn,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: fn,
          range,
        })),
        ...GLOBAL_FUNCTIONS.map((f) =>
          toMonacoItem(monaco, f, range, monaco.languages.CompletionItemKind.Function)
        ),
        ...LIFECYCLE_CALLBACKS.map((f) =>
          toMonacoItem(monaco, f, range, monaco.languages.CompletionItemKind.Method)
        ),
        ...Object.keys(TYPE_MEMBERS).map((typeName) => ({
          label: typeName,
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: typeName,
          range,
          detail: "Type Hylozoa API",
        })),
        ...localSymbols.map((s) => ({
          label: s.name,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: s.name,
          range,
          detail: s.type ?? "variable",
          // priorité plus haute que le reste : c'est le plus souvent ce qu'on veut taper
          sortText: `0_${s.name}`,
        })),
      ];

      return { suggestions };
    },
  });
}