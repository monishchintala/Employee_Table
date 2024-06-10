sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
  ],
  function (Controller) {
    "use strict";

    return Controller.extend("Emp_Table.controller.App", {
      onInit: function () {
        var oController = this;
        var viewModel = oController.getOwnerComponent().getModel("viewModel")
        viewModel.setProperty("/footerVisible", false)
      },
      onSave: function (oEvent) {
        var oController = this;
        var oModel = oController.getView().getModel();
        var viewModel = oController.getView().getModel("viewModel");


        var oData = oModel.getProperty("/EmployeeData");

        oData.forEach(element => {
          if (element.visible) element.visible = false;
        })
        oModel.setProperty("/EmployeeData", oData);

        viewModel.setProperty("/footerVisible", false);

        var oSplitter = oController.getView().getContent()[0].getPages()[0].getContent()[0].getItems()[0].getContent()[0].getRootPaneContainer()
        oSplitter.getPanes()[0].getLayoutData().setSize("100%");
        oSplitter.removePane(1);

        var oTable = oSplitter.getPanes()[0].getContent().getContent()[0];
        oTable.getSelectedItem().setSelected(false)
      },

      onCancel: function (oEvent) {
        var oController = this;
        var oModel = oController.getView().getModel();
        var viewModel = oController.getView().getModel("viewModel");



        var data = viewModel.getProperty("/rawData");
        var currentData = oModel.getProperty("/EmployeeData");

        currentData.forEach((element, i) => {
          if (element.visible) {
            element.visible = false;
            oModel.setProperty(`/EmployeeData/${i}`, data[i])
          }
        });


        // oModel.setProperty(sPath, data);


        viewModel.setProperty("/footerVisible", false);

        var oSplitter = oController.getView().getContent()[0].getPages()[0].getContent()[0].getItems()[0].getContent()[0].getRootPaneContainer()
        oSplitter.getPanes()[0].getLayoutData().setSize("100%");
        oSplitter.removePane(1);

        var oTable = oSplitter.getPanes()[0].getContent().getContent()[0];
        oTable.getSelectedItem().setSelected(false)

      }
    });
  }
);
