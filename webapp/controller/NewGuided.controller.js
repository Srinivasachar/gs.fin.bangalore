sap.ui.define(
    [
      "gs/fin/bangalore/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/ui/core/BusyIndicator",
      "sap/ui/core/Fragment"
    ],
    function (BaseController, JSONModel, BusyIndicator, Fragment) {
      "use strict";
  
      return BaseController.extend("gs.fin.bangalore.controller.NewGuided", {
        onInit: function () {
            this.getRouter().getRoute("NewGuided").attachPatternMatched(this.routeMatched, this);
        },

        routeMatched: function (oEvent) {
           this.loadInitialData(); 
        },

        loadInitialData: function () {
            $.ajax({
              type: "GET",
              timeout: 50000,
              url: "./model/data/GuidedAssistant.json",
              data: null,
              success: function (data) {
                this.getView().setModel(new JSONModel(data), "Suggesstion");
              }.bind(this),
            });
          },

        gotoNextStep: function(oEvent){
            debugger;
        },

        completedHandler: function(){
            debugger;
        }
      });
    }
  );