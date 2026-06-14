import Editor, { Monaco } from "@monaco-editor/react";
import { useState, useEffect, useRef } from "react";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs"; // Le lecteur de fichier de Tauri v2
import { Button } from "@/components/ui/button";
import { open } from "@tauri-apps/plugin-dialog";
import { useProjectStore } from "@/store/projectStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Loader2 } from "lucide-react";

interface EditorManagerProps {
  filePath: string;
  language?: string;
}

function FileEditor({ filePath, language = "lua" }: EditorManagerProps) {
  const [fileContent, setFileContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [saveStatus, setSaveStatus] = useState<
    "synced" | "modified" | "saving" | "error"
  >("synced");
  const contentRef = useRef(fileContent);

  useEffect(() => {
    async function loadFile() {
      try {
        setLoading(true);
        const content = await readTextFile(filePath);
        setFileContent(content);
        contentRef.current = content;
        setSaveStatus("synced");
      } catch (err) {
        console.error("Erreur lors de la lecture du fichier .lua :", err);
        setSaveStatus("error");
      } finally {
        setLoading(false);
      }
    }
    if (filePath) {
      loadFile();
    }
  }, [filePath]);

  useEffect(() => {
    if (saveStatus !== "modified") return;

    const delayDebounceTimer = setTimeout(async () => {
      try {
        setSaveStatus("saving");
        await writeTextFile(filePath, contentRef.current);
        setSaveStatus("synced");
      } catch (err) {
        console.error("Erreur lors de l'écriture du fichier .lua :", err);
        setSaveStatus("error");
      }
    }, 1000);

    return () => clearTimeout(delayDebounceTimer);
  }, [saveStatus, filePath]);

  const handleEditorChange = (value: string | undefined) => {
    const newValue = value || "";
    setFileContent(newValue);
    contentRef.current = newValue;
    if (saveStatus === "synced" || saveStatus === "error") {
      setSaveStatus("modified");
    }
  };

  const luaKeywords = [
    "and",
    "break",
    "do",
    "else",
    "elseif",
    "end",
    "false",
    "for",
    "function",
    "goto",
    "if",
    "in",
    "local",
    "nil",
    "not",
    "or",
    "repeat",
    "return",
    "then",
    "true",
    "until",
    "while",
  ];

  const luaBuiltins = [
    "print",
    "pairs",
    "ipairs",
    "tostring",
    "tonumber",
    "type",
    "table",
    "string",
    "math",
    "pcall",
    "error",
    "assert",
    "require",
    "select",
    "setmetatable",
    "getmetatable",
    "rawget",
    "rawset",
    "next",
    "unpack",
    "os",
  ];

  const handleEditorDidMount = (_: any, monaco: Monaco) => {
    if ((monaco as any).__hylozoaLuaProviderRegistered) return;
    (monaco as any).__hylozoaLuaProviderRegistered = true;

    monaco.languages.registerCompletionItemProvider("lua", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const keywordSuggestions = luaKeywords.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
          range: range,
        }));

        const builtinSuggestions = luaBuiltins.map((fn) => ({
          label: fn,
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: fn,
          range: range,
        }));

        const suggestions = [
          ...keywordSuggestions,
          ...builtinSuggestions,
          {
            label: "log_message",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "log_message('${1:message}')",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Moteur Hylozoa API",
            documentation: {
              value:
                "Enregistre un message dans la console du moteur Hylozoa.\n\n**Exemple :**\n```lua\nlog_message('${1:message}')\n```",
            },
          },
          {
            label: "get_transform",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "get_transform('${1:entity}')",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Moteur Hylozoa API",
            documentation: {
              value:
                "Récupère la transformation d'une entité.\n\n**Exemple :**\n```lua\nget_transform('${1:entity}')\n```",
            },
          },
          {
            label: "get_name",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "get_name('${1:entity}')",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Moteur Hylozoa API",
            documentation: {
              value:
                "Récupère le nom d'une entité.\n\n**Exemple :**\n```lua\nget_name('${1:entity}')\n```",
            },
          },
          {
            label: "destroy_entity",
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: "destroy_entity(${1:entity})",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Moteur Hylozoa API",
            documentation: {
              value:
                "Supprime instantanément l'entité spécifiée de la scène active et libère ses composants de la mémoire.\n\n**Exemple :**\n```lua\ndestroy_entity(${1:entity})\n```",
            },
          },
          {
            label: "onUpdate",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "onUpdate(entity,dt)\n\t${1:-- code here}\nend",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Callback Moteur (Optionnel)",
            documentation: {
              value:
                "Fonction de cycle de vie appelée automatiquement par le moteur à chaque frame si elle est présente dans le script.\n\n**Paramètres :**\n* `dt` (number) : Le *Delta Time* (temps écoulé depuis la dernière frame en secondes).\n\n**Exemple :**\n```lua\nfunction onUpdate(dt)\n  -- Faire tourner l'entité de 90 degrés par seconde\n  self.rotation = self.rotation + 90 * dt\nend\n```",
            },
          },
          {
            label: "onNoise",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText:
              "onNoise(entity,source,noiseInfo)\n\t${1:-- code here}\nend",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Callback Moteur (Optionnel)",
            documentation: {
              value:
                "Called when this entity hears a noise event. Requires the entity to have a noise listener component.\n\n**Parameters:**\n* `source` (Entity) : The entity that emitted the noise.\n* `noiseInfo` (table) : A table containing information about the noise event, such as its type and intensity.\n\n**Example:**\n```lua\nfunction onNoise(source, noiseInfo)\n  if noiseInfo.type == 'footstep' then\n    print('Heard a footstep from entity: ' .. source.id)\n  end\nend\n```",
            },
          },
          {
            label: "onCollisionBegin",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText:
              "onCollisionBegin(entity,other)\n\t${1:-- code here}\nend",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Callback Moteur (Optionnel)",

            documentation: {
              value:
                "Called when this entity begins colliding with another entity.\n\n**Parameters:**\n* `other` (Entity) : The entity with which this entity has begun colliding.\n\n**Example:**\n```lua\nfunction onCollisionBegin(other)\n  print('Collision started with entity: ' .. other.id)\nend\n```",
            },
          },
          {
            label: "onCollisionEnd",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText:
              "onCollisionEnd(entity,other)\n\t${1:-- code here}\nend",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Callback Moteur (Optionnel)",
            documentation: {
              value:
                "Called when this entity ends colliding with another entity.\n\n**Parameters:**\n* `other` (Entity) : The entity with which this entity has ended colliding.\n\n**Example:**\n```lua\nfunction onCollisionEnd(other)\n  print('Collision ended with entity: ' .. other.id)\nend\n```",
            },
          },
          {
            label: "onSensorEnter",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "onSensorEnter(entity,other)\n\t${1:-- code here}\nend",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Callback Moteur (Optionnel)",
            documentation: {
              value:
                "Called when this entity enters a sensor area.\n\n**Parameters:**\n* `other` (Entity) : The entity that triggered the sensor.\n\n**Example:**\n```lua\nfunction onSensorEnter(other)\n  print('Sensor entered by entity: ' .. other.id)\nend\n```",
            },
          },
          {
            label: "onSensorExit",
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: "onSensorExit(entity,other)\n\t${1:-- code here}\nend",
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
            detail: "Callback Moteur (Optionnel)",
            documentation: {
              value:
                "Called when this entity exits a sensor area.\n\n**Parameters:**\n* `other` (Entity) : The entity that triggered the sensor.\n\n**Example:**\n```lua\nfunction onSensorExit(other)\n  print('Sensor exited by entity: ' .. other.id)\nend\n```",
            },
          },
        ];
        return {
          suggestions: suggestions as any[],

        };
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 text-sm text-zinc-400 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Chargement du script...
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <Editor
        defaultLanguage={language}
        value={fileContent}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          wordBasedSuggestions: "currentDocument",
          quickSuggestions: true,
        }}
      />
    </div>
  );
}

export function EditorScreen() {
  const { currentCodeFilePath, setCurrentCodeFilePath } = useSessionStore();
  const { currentProjectPath } = useProjectStore();

  const handleFileSelect = async () => {
    try {
      const selected = await open({
        defaultPath: currentProjectPath || undefined,
        multiple: false,
        title: "Select a .lua file",
        filters: [
          {
            name: "Lua Files",
            extensions: ["lua"],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        setCurrentCodeFilePath(selected);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
    }
  };

  if (!currentCodeFilePath) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
        No file selected
        <Button onClick={handleFileSelect}>Select a file</Button>
      </div>
    );
  }

  return (
    <div className="w-full h-full mt-5">
      <FileEditor filePath={currentCodeFilePath} />
    </div>
  );
}
