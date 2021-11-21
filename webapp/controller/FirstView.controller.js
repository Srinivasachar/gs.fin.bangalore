sap.ui.define(
  [
    "gs/fin/bangalore/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Core",
    "sap/ui/unified/FileUploaderParameter",
    "sap/m/MessageToast"
  ],
  function (
    BaseController,
    JSONModel,
    BusyIndicator,
    Core,
    FileUploaderParameter,
    MessageToast
  ) {
    "use strict";

    return BaseController.extend("gs.fin.bangalore.controller.FirstView", {
      onInit: function () {
        this.getRouter().getRoute("FirstView").attachPatternMatched(this.routeMatched, this);
        if (!this.FileUpload) {
          this.FileUpload = this.loadFragment({
            name: "gs.fin.bangalore.Fragment.FileUpload",
          });
        }
        this.FileUpload.then(
          function (oDialog) {
            this.onInitialzeFileUpload();
            oDialog.open();
          }.bind(this)
        );

        this.getView().setModel(
          new JSONModel({
            Code: "",
            UploadDetails: null,
            CDSCollections: []
          }),
          "CodeEditorModel"
        );
        this.getView().setModel(new JSONModel([]), "CDSViewsCollection");
      },

      routeMatched: function(oEvent){
        this.OdataModel = this.getView().getModel();
        this.readCDSViewsUsingFile();
      },

      readCDSViewsUsingFile: function(){
        var oFileUploadJSON = this.getView().getModel("CDSViewsCollection");
        this.OdataModel.read("/CdsModelInfoSet",{
            success: function(oResponse){
                oFileUploadJSON.setProperty("/", oResponse.results);
            }.bind(this)
        })
      },

      openCDSViewsF4Help: function(){
        if (!this.CDSF4Help) {
            this.CDSF4Help = this.loadFragment({
              name: "gs.fin.bangalore.Fragment.ListItems",
            });
          }
          this.CDSF4Help.then(
            function (oDialog) {
              oDialog.open();
            }.bind(this)
          );
      },

      onCDSF4Confirmation: function(oEvent){
        var oSelectedItem = oEvent.getParameter("selectedItem");
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        oFileUploadJSON.setProperty("/UploadDetails/CDSViewName", oSelectedItem.getTitle());
      },

      onInitialzeFileUpload: function () {
         var oFileUploader = this.getView().byId("fileUploader");
        this.uploadPath =
        this.getView().getModel().sServiceUrl + "/UploadCDSViewSet";
        oFileUploader.setUploadUrl(this.uploadPath);
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        oFileUploadJSON.setProperty("/UploadDetails", {
          FileName: "",
          FileNameValueState: "None",
          FileContent: "",
          FileUploaded: false,
          CDSViewName: "",
        });
      },

      handleUploadPress: function (oEvent) {
        var oFileUploader = oEvent.getSource().getParent().getContent()[0];
        oFileUploader.removeAllHeaderParameters();
        var aHeaderParameters = [
          {
            name: "Slug",
            value: "",
          },
          {
            name: "filename",
            value: oFileUploader.getValue(),
          },
          {
            name: "x-csrf-token",
            value: this.OdataModel.getHeaders()["x-csrf-token"],
          },
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
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        oFileUploadJSON.setProperty("/UploadDetails/FileUploaded", true);
      },

      handleUploadStart: function (oEvent) {
          BusyIndicator.show(0);
      },

      handleUploadComplete: function (oEvent) {
        BusyIndicator.hide();
        if (oEvent.getParameter("status") !== 201) {
          return;
        }
        MessageToast.show("File Uploaded Successfully!")
        // var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        // var responseRaw = oEvent.getParameter("responseRaw");
        // oFileUploadJSON.setProperty("/UploadDetails/fileContent", responseRaw);
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
        // this.FileUpload.then(
        //   function (oDialog) {
        //     this.readCodeFromAPI("I_TAXITEM");
        //     oDialog.close();
        //   }.bind(this)
        // );
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

      createCDSViewFromXML: function () {
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        var oModel = this.getView().getModel();
        BusyIndicator.show();
        oModel.create(
          "/CdsModelInfoSet",
          {
            Filename: "test.xml",
            Fileversion: "0000000003",
            Cdsviewname: "ZRK_TAXITEM",
          },
          {
            success: function (oResponse) {
                oFileUploadJSON.setProperty("/Code", window.atob(oResponse.Filecontent));
                oFileUploadJSON.checkUpdate(true);
                MessageToast.show("Successfully create CDS View");
                this.FileUpload.then(
                    function (oDialog) {
                      oDialog.close();
                    }.bind(this)
                );
                BusyIndicator.hide();
            }.bind(this),
            error: function (oError) {
                debugger;
            },
          }
        );
      },

      updateCDSView: function(){
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        this.OdataModel.update("/CdsModelInfoSet(Filename='test.xml',Fileversion='0000000003',Cdsviewname='ZRK_TAXITEM')",{
            Filename: "test.xml",
            Fileversion: "0000000003",
            Cdsviewname: "ZRK_TAXITEM",
            Cdssqlviewname:"",
            Filecontent: window.btoa(oFileUploadJSON.getProperty("/Code"))
        },{
            success: function(oResponse){
                debugger;
            }.bind(this),
            error: function(oError){
                debugger;
            }.bind(this)
        });
      },

      getValuesByTagName: function (sResponseRaw, sTagName) {
        var sResponseProperties = jQuery.parseXML(sResponseRaw).getElementsByTagName("m:properties")[0],
            oElementsInProperties = sResponseProperties.getElementsByTagName(sTagName)[0];
        //In Internet Explorer (IE) browser, the elements property 'innerHTML' does not work.
        //Hence we do a workaround to fetch the childNotes first, and get the wholeText from it.
        //This workaround also works in other browsers but makes the execution slow.
        //Hence we keep innerHTML usage in all other browsers and use childNodes only in IE.
        if (oElementsInProperties && !Device.browser.msie) {
            return oElementsInProperties.innerHTML;
        } else if (oElementsInProperties && oElementsInProperties.childNodes.length) {
            return oElementsInProperties.childNodes[0].wholeText;
        }
        return "";
    },

    });
  }
);
