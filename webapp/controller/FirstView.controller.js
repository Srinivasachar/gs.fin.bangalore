sap.ui.define(
  [
    "gs/fin/bangalore/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Core",
    "sap/ui/unified/FileUploaderParameter"
  ],
  function (BaseController, JSONModel, BusyIndicator, Core, FileUploaderParameter) {
    "use strict";

    return BaseController.extend("gs.fin.bangalore.controller.FirstView", {
      onInit: function () {
        if (!this.FileUpload) {
          this.FileUpload = this.loadFragment({
            name: "gs.fin.bangalore.Fragment.FileUpload",
          });
        }
        this.FileUpload.then(
          function (oDialog) {
            oDialog.open();
          }.bind(this)
        );

        this.getView().setModel(
          new JSONModel({
            Code: "",
            UploadDetails: null
          }),
          "CodeEditorModel"
        );
        setTimeout(function(){
            this.onInitialzeFileUpload();
        }.bind(this), 1000);  
      },

      onInitialzeFileUpload: function () {
        var oFileUploader = this.getView().byId("fileUploader");
        this.uploadPath =
          this.getView().getModel().sServiceUrl + "/UploadCDSViewSet";
        oFileUploader.setUploadUrl(this.uploadPath);

        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        oFileUploadJSON.setProperty("/UploadDetails", {
          fileName: "",
          fileNameValueState: "None",
          fileContent: ""
        });
      },

      handleUploadPress: function (oEvent) {
        var oFileUploader = oEvent.getSource().getParent().getContent()[0];
        oFileUploader.removeAllHeaderParameters();
        // {
        //     name: "x-csrf-token",
        //     value: this.getView().getModel().getHeaders()["x-csrf-token"],
        //   }
        var aHeaderParameters = [
          {
            name: "Slug",
            value: "",
          },
          {
            name: "filename",
            value: oFileUploader.getValue(),
          }
        ];
        aHeaderParameters.forEach(function (oHeaderParameter) {
          oFileUploader.addHeaderParameter(
            new FileUploaderParameter({
              name: oHeaderParameter.name,
              value: oHeaderParameter.value,
            })
          );
        });
        oFileUploader.upload();
      },

      handleUploadStart: function () {
        // var oConfigParamJSONModel = this.getView().getModel("configParamJSONModel");
        // oConfigParamJSONModel.setProperty("/uploadCP/newCPNameVisible", false);
        // this.busyDialog = sap.ui.xmlfragment("gs.fin.definestatutoryreportss1.fragment.BusyDialog", this);
        // this.getView().addDependent(this.busyDialog);
        // this.busyDialog.open();
    },

    handleUplodComplete: function(oEvent){
        if (oEvent.getParameter("status") !== 201) {
            return;
        }
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        var responseRaw = oEvent.getParameter("responseRaw");
        oFileUploadJSON.setProperty("/UploadDetails/fileContent",responseRaw );
    },

      readCodeFromAPI: function (sFile) {
        $.ajax({
          type: "GET",
          timeout: 50000,
          url: "./model/data/" + sFile + ".txt",
          data: null,
          success: function (data) {
            this.getView()
              .getModel("CodeEditorModel")
              .setProperty("/Code", data);
          }.bind(this),
        });
      },

      cancelFileUploadCreation: function () {
        this.FileUpload.then(
          function (oDialog) {
            this.readCodeFromAPI("I_TAXITEM");
            oDialog.close();
          }.bind(this)
        );
      },

      onSelectTab: function (oEvent) {
        var sFilterId = oEvent.getParameter("selectedKey");
        BusyIndicator.show(0);
        this.readCodeFromAPI(sFilterId);
        setTimeout(
          function () {
            BusyIndicator.hide();
          }.bind(this),
          700
        );
      },

      onActivateConfigParamPress: function () {
        if (!this.Transport) {
          this.Transport = this.loadFragment({
            name: "gs.fin.bangalore.Fragment.Transport",
          });
        }
        this.Transport.then(function (oDialog) {
          oDialog.open();
        });
      },
    });
  }
);
