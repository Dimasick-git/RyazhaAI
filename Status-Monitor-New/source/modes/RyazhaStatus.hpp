class MainMenu;

class RyazhaStatusOverlay : public tsl::Gui {
private:
    char FPSavg_c[16];
    char RefreshRate_c[16];
    FpsCounterSettings settings;
    size_t fontsize = 0;
    ApmPerformanceMode performanceMode = ApmPerformanceMode_Invalid;
    bool skipOnce = true;
    bool runOnce = true;

    // Repositioning variables
    int frameOffsetX = 0;
    int frameOffsetY = 0;
    bool isDragging = false;
    size_t framePadding = 10;
    static constexpr int screenWidth = 1280;
    static constexpr int screenHeight = 720;
    static constexpr int border = 8;

    bool originalUseRightAlignment = ult::useRightAlignment;

    // Store actual rendered dimensions
    size_t actualTotalWidth = 0;
    size_t actualTotalHeight = 0;

public:
    RyazhaStatusOverlay() { 
        tsl::hlp::requestForeground(false);
        disableJumpTo = true;
        GetConfigSettings(&settings);
        apmGetPerformanceMode(&performanceMode);
        if (performanceMode == ApmPerformanceMode_Normal) {
            fontsize = settings.handheldFontSize;
        }
        else if (performanceMode == ApmPerformanceMode_Boost) {
            fontsize = settings.dockedFontSize;
        }
        
        // Load saved frame offsets
        frameOffsetX = settings.frameOffsetX;
        frameOffsetY = settings.frameOffsetY;
        framePadding = settings.framePadding;
        
        if (ult::limitedMemory) {
            tsl::gfx::Renderer::get().setLayerPos(std::max(std::min((int)(frameOffsetX*1.5 + 0.5) - tsl::impl::currentUnderscanPixels.first, 1280-32 - tsl::impl::currentUnderscanPixels.first), 0), 0);
        }
        
        FullMode = false;
        TeslaFPS = settings.refreshRate;
        if (settings.disableScreenshots) {
            tsl::gfx::Renderer::get().removeScreenshotStacks();
        }
        deactivateOriginalFooter = true;
        StartFPSCounterThread();
    }

    ~RyazhaStatusOverlay() {
        TeslaFPS = 60;
        EndFPSCounterThread();
        FullMode = true;
        fixForeground = true;
        ult::useRightAlignment = originalUseRightAlignment;
        if (settings.disableScreenshots) {
            tsl::gfx::Renderer::get().addScreenshotStacks();
        }
        deactivateOriginalFooter = false;
    }

    virtual tsl::elm::Element* createUI() override {
        auto* Status = new tsl::elm::CustomDrawer([this](tsl::gfx::Renderer *renderer, u16 x, u16 y, u16 w, u16 h) {
            // Calculate text dimensions for 2 lines
            const auto [textWidth1, textHeight1] = renderer->getTextDimensions("FPS: 60.0", false, fontsize);
            const auto [textWidth2, textHeight2] = renderer->getTextDimensions("Hz: 60", false, fontsize);
            const size_t maxTextWidth = std::max(textWidth1, textWidth2);
            const size_t margin = (fontsize / 8);
            
            // Inner rectangle dimensions (content area)
            const size_t innerWidth = maxTextWidth + margin;
            const size_t innerHeight = textHeight1 * 2;
            
            // Total dimensions including border
            const size_t totalWidth = innerWidth + (2 * border);
            const size_t totalHeight = innerHeight + (2 * border);
            
            // Store actual dimensions for input handling
            actualTotalWidth = totalWidth;
            actualTotalHeight = totalHeight;
            
            int _frameOffsetX = ult::limitedMemory ? std::max(0, frameOffsetX - (1280-448)) : frameOffsetX;
            
            // Clamp to screen bounds (accounting for total size including border)
            const int posX = std::max(int(framePadding), std::min(_frameOffsetX, static_cast<int>(screenWidth - totalWidth - framePadding)));
            const int posY = std::max(int(framePadding), std::min(frameOffsetY, static_cast<int>(screenHeight - totalHeight - framePadding)));
            
            // Draw the rounded rectangle (background)
            const tsl::Color bgColor = settings.backgroundColor;
            
            renderer->drawRoundedRectSingleThreaded(
                posX, 
                posY, 
                totalWidth, 
                totalHeight,
                16, 
                aWithOpacity(bgColor)
            );
            
            // Calculate text positions
            const int textX = posX + border + (margin / 2);
            const int textY1 = posY + border + (fontsize - margin);
            const int textY2 = textY1 + fontsize;
            
            // Draw the text
            const tsl::Color fpsColor = getFpsColor(useOldFPSavg ? FPSavg_old : FPSavg);
            const tsl::Color hzColor = getHzColor((float)refreshRate);
            renderer->drawString(FPSavg_c, false, textX, textY1, fontsize, fpsColor);
            renderer->drawString(RefreshRate_c, false, textX, textY2, fontsize, hzColor);
        });

        tsl::elm::HeaderOverlayFrame* rootFrame = new tsl::elm::HeaderOverlayFrame("", "");
        rootFrame->setContent(Status);

        return rootFrame;
    }

    virtual void update() override {
        apmGetPerformanceMode(&performanceMode);
        if (performanceMode == ApmPerformanceMode_Normal) {
            fontsize = settings.handheldFontSize;
        }
        else if (performanceMode == ApmPerformanceMode_Boost) {
            fontsize = settings.dockedFontSize;
        }
        
        // Update FPS
        if (FPSavg > 0 && FPSavg < 254) {
            snprintf(FPSavg_c, sizeof(FPSavg_c), "FPS: %.1f", FPSavg);
        } else {
            strcpy(FPSavg_c, "FPS: N/A");
        }

        // Update Refresh Rate
        if (refreshRate > 0) {
            snprintf(RefreshRate_c, sizeof(RefreshRate_c), "Hz: %d", refreshRate);
        } else {
            strcpy(RefreshRate_c, "Hz: N/A");
        }
    
        if (!skipOnce) {
            if (runOnce) {
                isRendering = true;
                leventClear(&renderingStopEvent);
                runOnce = false;
            }
        } else {
            skipOnce = false;
        }
    }

    virtual bool handleInput(u64 keysDown, u64 keysHeld, const HidTouchState &touchPos, HidAnalogStickState joyStickPosLeft, HidAnalogStickState joyStickPosRight) override {
        if (isKeyComboPressed(keysHeld, keysDown)) {
            isRendering = false;
            leventSignal(&renderingStopEvent);
            runOnce = true;
            skipOnce = true;
            TeslaFPS = 60;
            lastSelectedItem = "Ryazha Status";
            lastMode = "";
            if (skipMain) {
                lastMode = "return";
                tsl::goBack();
            }
            else {
                tsl::setNextOverlay(filepath.c_str(), "--lastSelectedItem 'Ryazha Status'");
                tsl::Overlay::get()->close();
            }
            return true;
        }
        return false;
    }
};
