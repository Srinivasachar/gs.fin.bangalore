sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment"
], function (Controller, UIComponent, JSONModel, BusyIndicator, ResourceModel, History, Fragment) {
	"use strict";

	return Controller.extend("gs.fin.bangalore.controller.BaseController", {
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onNavBack: function () {
			var oHistory, sPreviousHash;

			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				window.history.go(-1);
			}
		},
		onSummaryGraph: function(){
            if (!this.SummaryGraphDialog) {
                Fragment.load({
                    name: "gs.fin.bangalore.Fragment.Summary",
                    controller: this
                }).then(function (oDialog) {
                    this.SummaryGraphDialog = oDialog;
                    this.getView().addDependent(this.SummaryGraphDialog);
                    this.onDialogOpen();
                }.bind(this));
            } else {
                this.onDialogOpen();
            }
        },
        onDialogOpen : function () {
            this.SummaryGraphDialog.open();
        },
    
        onDialogClose : function () {
            this.SummaryGraphDialog.close();
        },
	});

});