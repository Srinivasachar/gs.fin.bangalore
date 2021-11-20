sap.ui.define(
    [
      "gs/fin/bangalore/controller/BaseController",
      "sap/ui/model/json/JSONModel",
      "sap/ui/core/BusyIndicator",
      "sap/ui/core/Fragment"
    ],
    function (BaseController, JSONModel, BusyIndicator, Fragment) {
      "use strict";
  
      return BaseController.extend("gs.fin.bangalore.controller.Overview", {
        onInit: function () {
          var aTileContainer =
             [
              {
                Header: "ACR Guided Assistance",
                Subheader: "Assistance",
                Key: 0
              },
              {
                Header: "Intelligent artefacts creation",
                Subheader: "Creation",
                Key: 1
              },
            ];
          this.getView().setModel(new JSONModel(aTileContainer), "TileCollection");
          //this.openKickStartDialog();
        },
  
        openKickStartDialog: function(){
          if (!this._oDialog) {
              Fragment.load({
                  name: "gs.com.GSInnovation.Fragment.Kickstarter",
                  controller: this
              }).then(function (oDialog) {
                  this._oDialog = oDialog;
                  this.getView().addDependent(this._oDialog);
                  this.onDialogOpen();
              }.bind(this));
          } else {
              this.onDialogOpen();
          }
        },
  
        onDialogOpen : function () {
          this._oDialog.open();
      },
  
      onDialogClose : function () {
          this._oDialog.close();
      },
      
        handleTilePress: function(oEvent){
          switch(oEvent.getSource().data("key")){
              case 0:
                  this.getRouter().navTo("GuidedAssistant");
                  break;
              case 1:
                  this.getRouter().navTo("FirstView");
                  break;
          }
        }
      });
    }
  );