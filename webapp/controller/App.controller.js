sap.ui.define(
  [
    "gs/fin/bangalore/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/base/Log",
  ],
  function (BaseController, JSONModel, Log) {
    "use strict";

    return BaseController.extend("gs.fin.bangalore.controller.App", {
      onInit: function () {
        var oViewModel,
          fnSetAppNotBusy,
          iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

        oViewModel = new JSONModel({
          busy: true,
          delay: 0,
        });
        this.setModel(oViewModel, "appView");

        fnSetAppNotBusy = function () {
          oViewModel.setProperty("/busy", false);
          oViewModel.setProperty("/delay", iOriginalBusyDelay);
        };

        var oRouter = this.getRouter();

        oRouter.attachBypassed(function (oEvent) {
          var sHash = oEvent.getParameter("hash");
          // do something here, i.e. send logging data to the backend for analysis
          // telling what resource the user tried to access...
          Log.info(
            "Sorry, but the hash '" + sHash + "' is invalid.",
            "The resource was not found."
          );
        });

        oRouter.attachRouteMatched(function (oEvent) {
          var sRouteName = oEvent.getParameter("name");
          // do something, i.e. send usage statistics to backend
          // in order to improve our app and the user experience (Build-Measure-Learn cycle)
          Log.info(
            "User accessed route " +
              sRouteName +
              ", timestamp = " +
              new Date().getTime()
          );
        });

        // this.getOwnerComponent().getModel().metadataLoaded().
        //     then(fnSetAppNotBusy);

        // apply content density mode to root view
        // this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
      },
    });
  }
);
