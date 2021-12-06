sap.ui.define(
  [
    "gs/fin/bangalore/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
  ],
  function (BaseController, JSONModel, BusyIndicator, Fragment) {
    "use strict";

    return BaseController.extend("gs.fin.bangalore.controller.ReportCategory", {
      onInit: function () {
        this.getRouter()
            .getRoute("ReportCategory")
            .attachPatternMatched(this.routeMatched, this);
      },

      routeMatched: function(){
        this.loadInitialData();
      },

      loadInitialData: function () {
        $.ajax({
          type: "GET",
          timeout: 50000,
          url: "./model/data/ReportDefinition/ReportCategory.json",
          data: null,
          success: function (data) {
            this.getView().setModel(new JSONModel(data), "ReportCategory");
            BusyIndicator.hide();
          }.bind(this),
        });
      },
      handleActivityNav: function () {
          this.getRouter().navTo("DefineApplication");
      },
    });
  }
);
