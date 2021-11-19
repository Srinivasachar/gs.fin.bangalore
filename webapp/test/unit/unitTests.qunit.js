/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"gs.fin.bangalore/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
