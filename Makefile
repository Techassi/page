.PHONY: build build_html build_css

build:
	$(MAKE) build_css && $(MAKE) build_html

build_html:
	hugo --minify

build_css:
	cd ./themes/term && pnpm build