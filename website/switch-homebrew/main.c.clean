#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <switch.h>

int main(int argc, char* argv[])
{
    consoleInit(NULL);
    
    printf("\x1b[2J");
    printf("\x1b[1;1H");
    
    printf("\x1b[32m");
    printf("AI Chat Launcher\n\n");
    printf("\x1b[0m");
    
    printf("\x1b[37m");
    printf("Starting AI Chat...\n\n");
    
    const char* url = "https://golden-zabaione-9de72e.netlify.app/";
    
    printf("Opening browser...\n");
    printf("URL: %s\n\n", url);
    
    WebCommonConfig config;
    WebCommonReply reply;
    
    Result rc = webPageCreate(&config, url);
    
    if (R_SUCCEEDED(rc)) {
        webConfigSetWhitelist(&config, "^http*");
        webConfigSetFooter(&config, false);
        
        rc = webConfigShow(&config, &reply);
        
        if (R_SUCCEEDED(rc)) {
            printf("Browser opened successfully!\n");
        } else {
            printf("Error opening browser: 0x%x\n", rc);
        }
    } else {
        printf("Error creating web page: 0x%x\n", rc);
    }
    
    printf("\nPress [+] to exit\n");
    
    PadState pad;
    padConfigureInput(1, HidNpadStyleSet_NpadStandard);
    padInitializeDefault(&pad);
    
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
