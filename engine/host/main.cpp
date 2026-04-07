#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <nlohmann/json.hpp>

extern "C" {
    void engine_create(const char* settingsPath);
    void engine_init(void);
    void engine_run(void);
    void engine_pause(void);
    void engine_stop(void);
    void engine_shutdown(void);

    bool scene_create(const char* jsonContent);
    bool scene_destroy(u_int64_t sceneId);
    bool scene_load_uuid(u_int64_t sceneId);
    bool scene_load_name(const char* sceneName);
    bool scene_unload_uuid(u_int64_t sceneId);
    bool scene_unload_name(const char* sceneName);
    const char* scene_list(void);

    void layer_create(char *layerName);
    void layer_destroy(char *layerName);
    const char *layer_list(void);
}

void fixJsonIds(nlohmann::json& j) {
    // 1. Fix sceneID (String -> Number)
    if (j.contains("sceneID") && j["sceneID"].is_string()) {
        try {
            j["sceneID"] = std::stoull(j["sceneID"].get<std::string>());
        } catch (...) {}
    }

    // 2. Parcours des entités
    if (j.contains("Entities") && j["Entities"].is_array()) {
        for (auto& entity : j["Entities"]) {
            
            // Fix UUID (String -> Number)
            if (entity.contains("UUID") && entity["UUID"].is_string()) {
                try {
                    entity["UUID"] = std::stoull(entity["UUID"].get<std::string>());
                } catch (...) {}
            }

            // --- NOUVEAU : Gestion du Parent ---
            if (entity.contains("Parent")) {
                if (entity["Parent"].is_null()) {
                    // Si c'est null, on supprime carrément la clé
                    entity.erase("Parent");
                } 
                else if (entity["Parent"].is_string()) {
                    // Si c'est une string, on convertit en nombre
                    try {
                        entity["Parent"] = std::stoull(entity["Parent"].get<std::string>());
                    } catch (...) {}
                }
            }
        }
    }
}


int main(int argc, char* argv[]) {
    if (argc > 2) {
        engine_create(argv[1]);
        engine_init();

        std::ifstream sceneFile(argv[2]);
        if (!sceneFile.is_open()) {
            std::cerr << "Erreur: impossible d'ouvrir le fichier: " << argv[2] << std::endl;
            return 84;
        }
        std::ostringstream sceneBuffer;
        sceneBuffer << sceneFile.rdbuf();
        std::string sceneContent = sceneBuffer.str();
        try {
            nlohmann::json sceneJson = nlohmann::json::parse(sceneContent);
            fixJsonIds(sceneJson);
            std::cout << "Parsed JSON content: " << sceneJson.dump(4) << std::endl; // Affiche le contenu JSON parsé
            scene_create(sceneJson.dump().c_str());

        } catch (const nlohmann::json::parse_error& e) {
            std::cerr << "Erreur de parsing JSON: " << e.what() << std::endl;
            return 84;
        }
            

        // u_int64_t sceneId = static_cast<u_int64_t>(std::stoull(argv[3]));
        // scene_load_uuid(sceneId);
        engine_run();
        // scene_unload_uuid(sceneId);
        // scene_destroy(sceneId);
        engine_shutdown();
    } else {
        std::cout << "Usage: " << argv[0] << " <settings_path> <scene_path> <scene_id>" << std::endl;
        return 84;
    }
    return 0;
}