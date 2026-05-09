# Makefile для RyazhaAI Switch

TARGET := RyazhaAI
BUILD := build
SOURCES := source.cpp

# Настройки для Switch
include $(DEVKITPRO)/libnx/switch_rules

# Компиляция
$(BUILD)/$(TARGET).nro: $(SOURCES)
	$(CXX) $(CXXFLAGS) $(INCLUDES) $(SOURCES) -o $(BUILD)/$(TARGET).elf
	$(OBJCOPY) -O binary $(BUILD)/$(TARGET).elf $(BUILD)/$(TARGET).nro

clean:
	rm -rf $(BUILD)

.PHONY: clean
