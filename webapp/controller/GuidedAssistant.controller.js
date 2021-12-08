sap.ui.define(
  [
    "gs/fin/bangalore/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/ui/core/message/Message",
  ],
  function (
    BaseController,
    JSONModel,
    BusyIndicator,
    Fragment,
    MessageBox,
    library,
    Message
  ) {
    "use strict";
    var MessageType = library.MessageType;
    return BaseController.extend(
      "gs.fin.bangalore.controller.GuidedAssistant",
      {
        onInit: function () {
          var oMessageManager, oModel, oView;
          oView = this.getView();

          this.getRouter()
            .getRoute("GuidedAssistant")
            .attachPatternMatched(this.routeMatched, this);
          // set message model
          oMessageManager = sap.ui.getCore().getMessageManager();
          oView.setModel(oMessageManager.getMessageModel(), "message");

          // or just do it for the whole view
          oMessageManager.registerObject(oView, true);
        },

        routeMatched: function (oEvent) {
          this.getView().setModel(
            new JSONModel({
              Percentage: 0,
            }),
            "GuideOverview"
          );
          this.loadInitialData();
        },

        handleGuideNavigation: function (oEvent) {
          var oPage = this.getView().byId("idGuidedAssistant");
          var iPosition = oEvent
            .getSource()
            .getBindingContext("Suggesstion")
            .getObject("Seq");
          var aPanels = this.getView().byId("GuidePanel").getItems();
          aPanels.map(function (oPanel, i) {
            oPanel.setExpanded(i === iPosition - 1);
          });
          oPage.scrollToElement();
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

        onSuggesstionClick: function (oEvent) {
          var oGuideOverview = this.getView().getModel("GuideOverview");
          var oSuggModel = this.getView().getModel("Suggesstion");
          var sPath = oEvent
            .getSource()
            .getBindingContext("Suggesstion")
            .getPath();
          var iCurrentValue = oEvent.getParameter("selected")
            ? oGuideOverview.getProperty("/Percentage") + 10
            : oGuideOverview.getProperty("/Percentage") - 10;
          oGuideOverview.setProperty("/Percentage", iCurrentValue);

          oSuggModel.setProperty(
            "/" + sPath.split("/")[1] + "/Completed",
            oEvent.getParameter("selected")
          );
        },

        onSummaryGraph: function () {
          if (!this.SummaryGraphDialog) {
            Fragment.load({
              name: "gs.fin.bangalore.Fragment.Summary",
              controller: this,
            }).then(
              function (oDialog) {
                this.SummaryGraphDialog = oDialog;
                this.getView().addDependent(this.SummaryGraphDialog);
                this.onDialogOpen();
              }.bind(this)
            );
          } else {
            this.onDialogOpen();
          }
        },
        onDialogOpen: function () {
          this.SummaryGraphDialog.open();
        },

        onDialogClose: function () {
          this.SummaryGraphDialog.close();
        },

        onActivateConfigParamPress: function () {
          if (this.validateSteps()) {
            this.getView().byId("idMessageManager").firePress();
            return;
          }
          BusyIndicator.show(0);
          MessageBox.confirm("Do you want to proceed with the creation?", {
            styleClass: "sapUiSizeCompact",
            actions: ["Confirm", MessageBox.Action.CLOSE],
            emphasizedAction: "Confirm",
            onClose: function (sAction) {
              if (sAction !== "Confirm") {
                BusyIndicator.hide();
                return;
              }
              setTimeout(
                function () {
                  this.getRouter().navTo("ReportCategory");
                }.bind(this),
                2000
              );
            }.bind(this),
          });
        },

        validateSteps: function () {
          var oView = this.getView();
          var aSuggesstModel = oView.getModel("Suggesstion").getData();
          var bValidSteps = true;
          var oMessageManager = sap.ui.getCore().getMessageManager();
          oMessageManager.removeAllMessages();
          aSuggesstModel.map(function (oGuide) {
            if (!oGuide.Completed) {
              bValidSteps = false;
              var oMessage = new Message({
                message: "Mandatory fields " + oGuide.Subtitle,
                type: MessageType.Error,
                target: "/Dummy",
                processor: this.getView().getModel(),
              });
              oMessageManager.addMessages(oMessage);
            }
          }, this);
          return bValidSteps;
        },

        handleMessageManager: function (oEvent) {
          var oSourceControl = oEvent.getSource();
          this.getMessagePopover().then(function (oMessagePopover) {
            oMessagePopover.openBy(oSourceControl);
          });
        },

        getMessagePopover: function () {
          var oView = this.getView();

          // create popover lazily (singleton)
          if (!this._pMessagePopover) {
            this._pMessagePopover = Fragment.load({
              id: oView.getId(),
              name: "gs.fin.bangalore.Fragment.MessagePopover",
            }).then(function (oMessagePopover) {
              oView.addDependent(oMessagePopover);
              return oMessagePopover;
            });
          }
          return this._pMessagePopover;
        },

        handlePanelInfo: function (oEvent) {
          var oSource = oEvent.getSource();
          var sInformation = oSource
            .getBindingContext("Suggesstion")
            .getObject("Information");
          var oView = this.getView();
          if (!this._pPopover) {
            this._pPopover = Fragment.load({
              id: oView.getId(),
              name: "gs.fin.bangalore.Fragment.InfoPopover",
              controller: this,
            }).then(function (oPopover) {
              oView.addDependent(oPopover);
              return oPopover;
            });
          }

          this._pPopover.then(function (oPopover) {
            oPopover.setModel(
              new JSONModel({ Information: sInformation }),
              "PopoverInfo"
            );
            oPopover.openBy(oSource);
          });
        },
      }
    );
  }
);
