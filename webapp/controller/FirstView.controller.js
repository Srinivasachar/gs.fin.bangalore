sap.ui.define([
	"gs/fin/bangalore/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator"
], function (BaseController, JSONModel, BusyIndicator) {
	"use strict";

	return BaseController.extend("gs.fin.bangalore.controller.FirstView", {
		onInit: function () {
			if (!this.FileUpload) {
				this.FileUpload = this.loadFragment({
					name: "gs.fin.bangalore.Fragment.FileUpload"
				});
			}
			this.FileUpload.then(function (oDialog) {
				oDialog.open();
			});
			this.getView().setModel(new JSONModel({
				"Code": ""
			}), "CodeEditorModel");
		},

		readCodeFromAPI: function (sFile) {
			$.ajax({
				type: "GET",
				timeout: 50000,
				url: "./model/data/" + sFile + ".txt",
				data: null,
				success: function (data) {
					this.getView().getModel("CodeEditorModel").setProperty("/Code", data);
				}.bind(this)
			});
		},

		cancelFileUploadCreation: function () {
			this.FileUpload.then(function (oDialog) {
				this.readCodeFromAPI("I_TAXITEM");
				oDialog.close();
			}.bind(this));
		},

		onSelectTab: function (oEvent) {
			var sFilterId = oEvent.getParameter("selectedKey");
			BusyIndicator.show(0);
			this.readCodeFromAPI(sFilterId);
			setTimeout(function(){
				BusyIndicator.hide();
			}.bind(this), 700);
		},

		onActivateConfigParamPress: function(){
			if (!this.Transport) {
				this.Transport = this.loadFragment({
					name: "gs.fin.bangalore.Fragment.Transport"
				});
			}
			this.Transport.then(function (oDialog) {
				oDialog.open();
			});
		}
	});
});