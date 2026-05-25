#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <switch.h>

int main(int argc, char* argv[])
{
 consoleInit(NULL);
 
 printf("\x1b[2J"); // Clear console
 printf("\x1b[1;1H"); // Move cursor to top
 
 printf("\x1b[32m"); // Green color
 printf("╔════════════════════════════════════════╗\n");
 printf("║ ║\n");
 printf("║ AI Chat Launcher ║\n");
 printf("║ ║\n");
 printf("╚════════════════════════════════════════╝\n\n");
 printf("\x1b[0m"); // Reset color
 
 printf("\x1b[37m"); // White color
 printf("Запуск AI чата с облачным хранилищем...\n\n");
 
 // URL вашего сайта (замените на свой)
 const char* url = "https://golden-zabaione-9de72e.netlify.app/";
 
 printf("Открытие браузера...\n");
 printf("URL: %s\n\n", url);
 
 // Открываем веб-браузер
 WebCommonConfig config;
 WebCommonReply reply;
 
 Result rc = webPageCreate(&config, url);
 
 if (R_SUCCEEDED(rc)) {
 webConfigSetWhitelist(&config, "^http*");
 webConfigSetFooter(&config, false);
 
 rc = webConfigShow(&config, &reply);
 
 if (R_SUCCEEDED(rc)) {
 printf("\x1b[32m Браузер успешно открыт!\x1b[0m\n");
 } else {
 printf("\x1b[31m Ошибка открытия браузера: 0x%x\x1b[0m\n", rc);
 }
 } else {
 printf("\x1b[31m Ошибка создания веб-страницы: 0x%x\x1b[0m\n", rc);
 }
 
 printf("\n\x1b[33mНажмите [+] для выхода\x1b[0m\n");
 
 // Initialize pad
 PadState pad;
 padConfigureInput(1, HidNpadStyleSet_NpadStandard);
 padInitializeDefault(&pad);
 
 // Main loop
 while (appletMainLoop())
 {
 padUpdate(&pad);
 u64 kDown = padGetButtonsDown(&pad);
 
 if (kDown & HidNpadButton_Plus)
 break;
 
 consoleUpdate(NULL);
 }
 
 consoleExit(NULL);
 return 0;
}
