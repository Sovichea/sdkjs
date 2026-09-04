GRUNT = grunt
GRUNT_FLAGS = --no-color -v
SDK_PLATFORM ?=

OUTPUT_DIR = deploy
OUTPUT = $(OUTPUT_DIR)

COMPANY_NAME ?= ONLYOFFICE
PRODUCT_NAME ?= DocumentServer

COMPANY_NAME_LOW = $(shell echo $(COMPANY_NAME) | tr A-Z a-z)
PRODUCT_NAME_LOW = $(shell echo $(PRODUCT_NAME) | tr A-Z a-z)

PRODUCT_VERSION ?= 0.0.0
BUILD_NUMBER ?= 0

PUBLISHER_NAME ?= Ascensio System SIA

APP_COPYRIGHT ?= Copyright (C) $(PUBLISHER_NAME) 2012-$(shell date +%Y). All rights reserved

PUBLISHER_URL ?= https://www.onlyoffice.com/

GRUNT_ENV += PRODUCT_VERSION=$(PRODUCT_VERSION)
GRUNT_ENV += BUILD_NUMBER=$(BUILD_NUMBER)
GRUNT_ENV += APP_COPYRIGHT="$(APP_COPYRIGHT)"
GRUNT_ENV += PUBLISHER_URL="$(PUBLISHER_URL)"

# sdkjs's own build/ was migrated from Grunt to webpack (web-apps' build below is
# unaffected — it still uses Grunt). The new pipeline reads the same
# PRODUCT_VERSION/BUILD_NUMBER/APP_COPYRIGHT/PUBLISHER_URL via env vars, plus
# SDK_PLATFORM instead of a --desktop=true CLI flag, and it errors out on any
# stray CLI argument — so it must be invoked with no flags at all (no GRUNT_FLAGS).
# Recursive (=), not simple (:=): SDK_PLATFORM must expand at recipe-run time so
# the `desktop:` target-specific override below is picked up, not the empty
# top-level default in effect at parse time.
SDKJS_ENV = $(GRUNT_ENV)
SDKJS_ENV += SDK_PLATFORM=$(SDK_PLATFORM)

WEBAPPS_DIR := web-apps

WEBAPPS = $(OUTPUT)/$(WEBAPPS_DIR)
NODE_MODULES = build/node_modules ../$(WEBAPPS_DIR)/build/node_modules
#PACKAGE_JSON = build/package.json ../$(WEBAPPS_DIR)/build/package.json
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/api/documents/api.js
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/documenteditor/main/app.js
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/presentationeditor/main/app.js
WEBAPPS_FILES += ../$(WEBAPPS_DIR)/deploy/web-apps/apps/spreadsheeteditor/main/app.js
SDKJS_FILES += word/sdk-all.js

.PHONY: all desktop

all: $(WEBAPPS)

$(WEBAPPS): $(WEBAPPS_FILES)
	mkdir -p $(OUTPUT)/$(WEBAPPS_DIR) && \
		cp -r -t $(OUTPUT)/$(WEBAPPS_DIR) ../$(WEBAPPS_DIR)/deploy/** 

$(WEBAPPS_FILES): $(NODE_MODULES) $(SDKJS_FILES)
	cd ../$(WEBAPPS_DIR)/build  && \
		$(GRUNT_ENV) $(GRUNT) deploy-$(filter %editor documents,$(subst /, ,$(@D)))-component $(GRUNT_FLAGS)

$(SDKJS_FILES): $(NODE_MODULES)
	cd build && \
		$(SDKJS_ENV) npm run build

desktop: GRUNT_FLAGS += --desktop=true
desktop: SDK_PLATFORM = desktop
desktop: all
	
clean:
	rm -f $(WEBAPPS_FILES) $(SDKJS_FILES)

%/node_modules: %/package.json
	cd $(dir $@) && npm install
