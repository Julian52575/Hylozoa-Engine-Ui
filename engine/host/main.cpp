#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <nlohmann/json.hpp>


// isRaw a boolean indicating whether the sceneData parameter is a raw JSON string (true) or a file path to a JSON file (false).
extern "C" {
    void project_create(const char* projectData, bool isRaw);

    void engine_create(const char *settings, bool isRaw);
    void engine_init(void);
    void engine_run(void);
    void engine_pause(void);
    void engine_unpause(void);
    void engine_stop(void);
    void engine_shutdown(void);

    bool scene_create(const char *sceneData, bool isRaw);
    bool scene_destroy_uuid(uint64_t sceneId);
    bool scene_destroy_name(const char* sceneName);
    bool scene_destroy(const char* scene, bool isUUID);

    bool scene_load_uuid(uint64_t sceneId);
    bool scene_load_name(const char* sceneName);
    bool scene_load(const char*scene, bool isUUID);

    bool scene_unload_uuid(uint64_t sceneId);
    bool scene_unload_name(const char* sceneName);
    bool scene_unload(const char*scene, bool isUUID);

    void layer_create(char *layerName);
    void layer_destroy(char *layerName);
    const char *layer_list(void);

    void generate_uuid(char* outPtr, size_t size);
}

void runEngine(std::string settingsPath,std::string mainID,  const std::vector<std::string>& scenePaths) {
    engine_create(settingsPath.c_str(), false);
    engine_init();
    for (const auto& scenePath : scenePaths) {
        std::cout << "Creating scene: " << scenePath << std::endl;
        if (!scene_create(scenePath.c_str(), false)) {
            std::cerr << "Failed to create scene." << std::endl;
            engine_shutdown();
            return;
        }
    }
    scene_load_uuid(std::stoull(mainID));
    engine_run();

    // scene_destroy_uuid(std::stoull(mainID));
    engine_shutdown();
}

void generateUUID() {
    char uuid[21];
    generate_uuid(uuid, sizeof(uuid));
    std::cout << uuid << std::endl;
}

void runEngineHylozoa(std::string settingsPath, std::string filePath) {
    engine_create(settingsPath.c_str(), false);
    engine_init();
    
    project_create(filePath.c_str(), false);
    engine_run();

    // scene_destroy_uuid(std::stoull(mainID));
    engine_shutdown();
}

int main(int argc, char* argv[]) {
    if (argc > 3 && std::string(argv[1]) == "run") {
        std::vector<std::string> args(argv + 4, argv + argc);
        runEngine(argv[2], argv[3], args);
    } else if (argc > 1 && std::string(argv[1]) == "generate-uuid") {
        generateUUID();
    }else if (argc > 3 && std::string(argv[1]) == "run-hylozoa") {
        runEngineHylozoa(argv[2], argv[3]);
    } else {
        std::cout << "Usage:" << std::endl;
        std::cout << "  " << argv[0] << " run <settingsPath> <mainID> [<scenesPath>...]" << std::endl;
        std::cout << "  " << argv[0] << " generate-uuid" << std::endl;
        std::cout << "  " << argv[0] << " run-hylozoa <settingsPath> <filePath>" << std::endl;
    }
    return 0;
}