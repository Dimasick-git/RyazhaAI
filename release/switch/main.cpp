#include <switch.h>
#include <iostream>
#include <string>
#include <fstream>

// Web app для RyazhaAI
// Запускает встроенный браузер с dist/index.html

int main(int argc, char* argv[]) {
    consoleInit();
    padConfigureInput(1, PADSTATE_DEFAULT_Touch, PADSTATE_DEFAULT_BUTTONS);
    
    // Создаем окно браузера
    WebConfig web = {
        .url = "file://dist/index.html",
        .exit = false,
        .whitelist = nullptr
    };
    
    consoleInit();
    printf("🥛 RYAZHA AI - Nintendo Switch\n");
    printf("🎮 AI Assistant for Switch CFW\n\n");
    printf("Press + to exit\n");
    
    // Основной цикл
    while (appletMainLoop()) {
        padUpdate(&kdown);
        
        if (kdown & HidNpadButton_Plus) {
            break;
        }
        
        consoleUpdate(nullptr);
    }
    
    consoleExit();
    return 0;
}
