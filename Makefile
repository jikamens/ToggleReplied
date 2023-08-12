# Copyright (c) 2017 Jonathan Kamens.
#
# This Source Code Form is subject to the terms of the Mozilla Public License,
# v. 2.0. If a copy of the MPL was not distributed with this file, You can
# obtain one at http://mozilla.org/MPL/2.0/.

all: ToggleReplied.xpi

FILES=LICENSE $(wildcard _locales/*/*.json) $(wildcard api/*/*.js) \
	$(wildcard api/*/*.json) background.html background.js manifest.json

ToggleReplied.xpi: $(FILES)
	rm -f $@.tmp
	zip -r $@.tmp $(FILES)
	mv $@.tmp $@

clean: ; -rm -f ToggleReplied.xpi
