sap.ui.define([
	"gs/fin/bangalore/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox"
], function (BaseController, JSONModel, BusyIndicator, Fragment, MessageBox) {
	"use strict";

	return BaseController.extend("gs.fin.bangalore.controller.GuidedAssistant", {
		onInit: function () {
            this.getView().setModel(new JSONModel({
                Percentage: 0
            }), "GuideOverview");
             this.loadInitialData(); 
        },

        handleGuideNavigation: function(oEvent){
            var oPage = this.getView().byId("idGuidedAssistant");
            var iPosition = oEvent.getSource().getBindingContext("Suggesstion").getObject("Seq");
            var aPanels = this.getView().byId("GuidePanel").getItems();
            aPanels.map(function(oPanel, i){
                oPanel.setExpanded(i === (iPosition-1));
            });
            oPage.scrollToElement()
        },

        loadInitialData: function(){
                $.ajax({
                    type: "GET",
                    timeout: 50000,
                    url: "./model/data/GuidedAssistant.json",
                    data: null,
                    success: function (data) {
                        this.getView().setModel(new JSONModel(data), "Suggesstion");
                    }.bind(this)
                });
        },

        onSuggesstionClick: function(oEvent){
            var oGuideOverview = this.getView().getModel("GuideOverview");
            var oSuggModel = this.getView().getModel("Suggesstion");
            var sPath = oEvent.getSource().getBindingContext("Suggesstion").getPath(); 
            var iCurrentValue = oEvent.getParameter("selected") ? oGuideOverview.getProperty("/Percentage") + 10 : oGuideOverview.getProperty("/Percentage") - 10;
            oGuideOverview.setProperty("/Percentage", iCurrentValue); 

           oSuggModel.setProperty("/"+sPath.split("/")[1]+"/Completed", oEvent.getParameter("selected"));
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

        onActivateConfigParamPress: function(){
            MessageBox.confirm("Do you want to proceed with the creation?", {
                styleClass: "sapUiSizeCompact",
				actions: ["Confirm", MessageBox.Action.CLOSE],
				emphasizedAction: "Confirm",
				onClose: function (sAction) {
                    BusyIndicator.show(0);
                    if(sAction === "Confirm"){
                        setTimeout(function(){
                            this.getRouter().navTo("DefineApplication");
                            BusyIndicator.hide();
                        }.bind(this),2000)
                    }
				}.bind(this)
			});
        }
	});
});