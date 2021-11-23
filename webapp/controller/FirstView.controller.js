sap.ui.define(
  [
    "gs/fin/bangalore/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Core",
    "sap/ui/unified/FileUploaderParameter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter"
  ],
  function (
    BaseController,
    JSONModel,
    BusyIndicator,
    Core,
    FileUploaderParameter,
    MessageToast,
    Filter
  ) {
    "use strict";

    return BaseController.extend("gs.fin.bangalore.controller.FirstView", {
      onInit: function () {
        this.getRouter().getRoute("FirstView").attachPatternMatched(this.routeMatched, this);
        this.getView().setModel(
          new JSONModel({
            Code: "",
            BusyIndicator: true,
            UploadDetails: {
                FileName: "",
                FileNameValueState: "None",
                FileContent: "",
                FileUploaded: false,
                CDSViewName: ""
              },
            CDSCollections: [],
            UploadRules: this.getUploadRules()
          }),
          "CodeEditorModel"
        );
        this.getView().setModel(new JSONModel([]), "CDSViewsCollection");
      },

      handleDialog: function(oFragment){
        oFragment.then(
            function (oDialog) {
              oDialog.open();
            }.bind(this)
          );
      },

      routeMatched: function(oEvent){
        if (!this.FileUpload) {
            this.FileUpload = this.loadFragment({
              name: "gs.fin.bangalore.Fragment.FileUpload",
            });
          }
        this.handleDialog(this.FileUpload);
        this.OdataModel = this.getView().getModel();
        this.readCDSViewsUsingFile({
            "Filename": "test.xml",
            "Fileversion": "0000000003"
        }, true);
      },

      readCDSViewsUsingFile: function(oParams, bInitialize){
        BusyIndicator.show(0);
        var aFilters = [
            new Filter("Filename", "EQ", oParams.Filename),
            new Filter("Fileversion", "EQ", oParams.Fileversion)
         ];
         var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        var oCDSViewCollection = this.getView().getModel("CDSViewsCollection");
        this.OdataModel.read("/CdsModelInfoSet",{
            filters: [new Filter({ filters: aFilters, and: true})],
            success: function(oResponse){
                if(bInitialize){
                    this.onInitialzeFileUpload();
                }
                oCDSViewCollection.setProperty("/", oResponse.results);
                oFileUploadJSON.setProperty("/BusyIndicator", false);
                BusyIndicator.hide();
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
        var oResponse = oEvent.getParameter("responseRaw")
        MessageToast.show("File Uploaded Successfully!");
        var sFileVersion = this.getValuesByTagName(oResponse, "d:Fileversion");
        var sCDSViewName = this.getValuesByTagName(oResponse, "d:CdsViewName");
        var sFileName = this.getValuesByTagName(oResponse, "d:SourceFilename");
        //var sFileContent = this.getValuesByTagName(oResponse, "d:FileContent");
        var oFileUploadJSON = this.getView().getModel("CodeEditorModel");
        this.readCDSViewsUsingFile({
            "Filename": sFileName,
            "Fileversion": sFileVersion
        }, false);
         oFileUploadJSON.setProperty("/UploadDetails/FileName", sFileName);
         //oFileUploadJSON.setProperty("/UploadDetails/FileContent", sFileContent);
         oFileUploadJSON.setProperty("/UploadDetails/CDSViewName", sCDSViewName);
         //oFileUploadJSON.setProperty("/Code", window.atob(sFileContent));
         oFileUploadJSON.setProperty("/UploadDetails/FileVersion", sFileVersion);
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
        BusyIndicator.show(0);
        oModel.create(
          "/CdsModelInfoSet",
          {
            Filename: oFileUploadJSON.getProperty("/UploadDetails/FileName"), //"aaaaaaaa.xml"//"test.xml",
            Fileversion: oFileUploadJSON.getProperty("/UploadDetails/FileVersion"),
            Cdsviewname: oFileUploadJSON.getProperty("/UploadDetails/CDSViewName") //"ZRK_TAXRRRR" //"ZRK_TAXITEM",
          },
          {
            success: function (oResponse) {
                oFileUploadJSON.setProperty("/Code", window.atob(oResponse.Filecontent));
                oFileUploadJSON.checkUpdate(true);
                MessageToast.show("Draft objects created successfully");
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
        BusyIndicator.show(0);
        var sFileName = oFileUploadJSON.getProperty("/UploadDetails/FileName");
        var sFileVersion = oFileUploadJSON.getProperty("/UploadDetails/FileVersion");
        var sCDSViewName = oFileUploadJSON.getProperty("/UploadDetails/CDSViewName");


        this.OdataModel.update("/CdsModelInfoSet(Filename='"+sFileName+"',Fileversion='"+sFileVersion+"',Cdsviewname='"+sCDSViewName+"')",{
            Filename: sFileName, 
            Fileversion: sFileVersion,
            Cdsviewname: sCDSViewName, 
            Filecontent: window.btoa(oFileUploadJSON.getProperty("/Code"))
        },{
            success: function(oResponse){
                BusyIndicator.hide();
            }.bind(this),
            error: function(oError){
                BusyIndicator.hide();
            }.bind(this)
        });
      },

      getValuesByTagName: function (sResponseRaw, sTagName) {
        var sResponseProperties = jQuery.parseXML(sResponseRaw).getElementsByTagName(sTagName);
        sResponseProperties = sResponseProperties[0].innerHTML;
        return sResponseProperties;
    },

    getUploadRules :function(){
        var sFormattedtext = 
        "<ul><li>Create XML file using <a href=\"//www.draw.io\">draw.io</a></li>"+
        "<li>Steps to create <a>Documentation</a></li>"+
        "<li>Create CDS Views and edit on the fly</li></ul>"

        return sFormattedtext;
    }

    });
  }
);
