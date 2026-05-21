#include <string.h>
#include <stdio.h>
#include <stdlib.h>

#include <switch.h>

// RYAZHA AI .nro — открывает веб-апплет со страницей AI на GitHub Pages

int main(int argc, char* argv[])
{
    socketInitializeDefault();
    nxlinkStdio();
    consoleInit(NULL);

    // Новый API libnx (>= 4.x): PadState вместо deprecated hidScanInput/hidKeysDown
    PadState pad;
    padConfigureInput(1, HidNpadStyleSet_NpadStandard);
    padInitializeDefault(&pad);

    printf("\x1b[2J\x1b[1;1H");

    printf("\x1b[36m");
    printf("    +---------------------------------------+\n");
    printf("    |                                       |\n");
    printf("    |      RYAZHA AI for Switch             |\n");
    printf("    |                                       |\n");
    printf("    |  Умный помощник для Nintendo Switch!  |\n");
    printf("    |                                       |\n");
    printf("    +---------------------------------------+\n");
    printf("\x1b[0m\n");

    printf("\x1b[32m");
    printf("  Возможности:\n");
    printf("     - AI помощник для Switch CFW\n");
    printf("     - Ответы на вопросы о Ryazhenka\n");
    printf("     - FAQ и помощь по взлому\n");
    printf("\x1b[0m\n");

    printf("\x1b[33m");
    printf("  Требования:\n");
    printf("     - WiFi подключение\n");
    printf("     - Ryazhenka CFW или Atmosphere\n");
    printf("     - Homebrew Menu (hbmenu)\n");
    printf("\x1b[0m\n");

    printf("\x1b[35m");
    printf("  Управление:\n");
    printf("     [A] - Открыть RYAZHA AI в браузере\n");
    printf("     [+] - Выход\n");
    printf("\x1b[0m\n");

    printf("\x1b[90m");
    printf("  Создано командой Ryazhenka\n");
    printf("  Dimasick-git & Ryazhenka-Helper-01\n");
    printf("  v2.1.0 | github.com/Dimasick-git/RyazhaAI\n");
    printf("\x1b[0m\n");

    const char* websiteUrl = "https://dimasick-git.github.io/RyazhaAI";

    printf("\n\x1b[37m  Нажми [A] для запуска...\x1b[0m\n");

    while (appletMainLoop())
    {
        padUpdate(&pad);
        u64 kDown = padGetButtonsDown(&pad);

        if (kDown & HidNpadButton_A)
        {
            printf("\n\x1b[36m  Запуск RYAZHA AI...\x1b[0m\n");
            printf("\x1b[33m  Открываем браузер Switch...\x1b[0m\n\n");

            WebCommonConfig config;
            WebCommonReply reply;

            Result rc = webPageCreate(&config, websiteUrl);

            if (R_SUCCEEDED(rc))
            {
                webConfigSetWhitelist(&config, "^https?://");
                webConfigSetFooter(&config, true);
                webConfigSetPointer(&config, true);
                webConfigSetKeyRepeatFrame(&config, 4, 8);

                printf("\x1b[32m  Загрузка интерфейса...\x1b[0m\n");
                printf("\x1b[90m  URL: %s\x1b[0m\n\n", websiteUrl);

                rc = webConfigShow(&config, &reply);

                if (R_SUCCEEDED(rc)) {
                    printf("\x1b[32m  Веб-апплет закрыт\x1b[0m\n");
                } else {
                    printf("\x1b[31m  Ошибка показа веб-страницы: 0x%x\x1b[0m\n", rc);
                }
            }
            else
            {
                printf("\x1b[31m  Ошибка создания веб-апплета: 0x%x\x1b[0m\n", rc);
                printf("\x1b[33m  Проверь подключение к интернету!\x1b[0m\n");
            }

            printf("\n\x1b[37m  Нажми [A] для повтора или [+] для выхода\x1b[0m\n");
        }

        if (kDown & HidNpadButton_Plus)
            break;

        consoleUpdate(NULL);
    }

    printf("\n\x1b[36m  До встречи в RYAZHA AI!\x1b[0m\n");
    printf("\x1b[35m  Спасибо что используешь Ryazhenka!\x1b[0m\n");
    consoleUpdate(NULL);

    consoleExit(NULL);
    socketExit();

    return 0;
}
