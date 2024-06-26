sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        'sap/ui/core/Fragment',
        "sap/ui/layout/SplitPane",
        "sap/ui/layout/SplitterLayoutData"
    ],
    function (Controller, Fragment, SplitPane, SplitterLayoutData) {
        "use strict";
        return Controller.extend("Emp_Table.controller.Projects", {
            onInit: function () {
                var oController = this;
                var oRouter = oController.getOwnerComponent().getRouter()
                oRouter.getRoute("Projects").attachMatched(oController._onRouteMatched, oController);
                // var oModel = oController.getOwnerComponent().getModel()
                // var viewModel = oController.getOwnerComponent().getModel("viewModel")
            },
            _onRouteMatched: function (oEvent) {
                var oController = this;
                var oModel = oController.getView().getModel()
                var projectsItems = oModel.getProperty("/EmployeeProjects")
                var oArgs, oView;
                oArgs = oEvent.getParameter("arguments");
                oView = oController.getView();

                var index = projectsItems.findIndex(item => item.id == oArgs.id)

                oView.bindElement({
                    path: "/EmployeeProjects/" + index,
                });
            },
            onNavBack: function () {
                var oController = this;
                var oRouter = oController.getOwnerComponent().getRouter();
                oRouter.navTo("App");
            },
            onSelectionchange: function (oEvent) {
                var oController = this;
                var oModel = oController.getView().getModel();
                var viewModel = oController.getView().getModel("viewModel");

                var oSelectedItem = oEvent.getParameter('listItem')

                var data = oModel.getProperty("/EmployeeProjects");
                var rawData = $.extend(true, [], data);
                viewModel.setProperty("/rawData", rawData);

                viewModel.setProperty("/footerVisible", true);


                var oSplitter = oEvent.getSource().getParent().getParent()
                if (oSplitter.getPanes() && oSplitter.getPanes()[1]) {
                    oSplitter.removePane(1);
                }
                oSplitter.getPanes()[0].getLayoutData().setSize("75%");
                var oSplitterLayoutData = new SplitterLayoutData({
                    size: "25%"
                });
                var oSplitPane = new SplitPane({
                    layoutData: oSplitterLayoutData
                });
                var oContext = oSelectedItem.getBindingContext();

                var sFragmentId = this.createId("fragment_" + new Date().getTime());

                Fragment.load({
                    id: sFragmentId,
                    name: "Emp_Table.fragments.EditProjectDetails",
                    type: "XML",
                    controller: this
                }).then(function (oFragment) {
                    oFragment.bindElement({
                        path: oContext.sPath
                    })
                    oSplitPane.setContent(oFragment);
                    oSplitter.addPane(oSplitPane);
                }.bind(this));

            },
            onClose: function (oEvent) {
                var oController = this;
                var oTable = oController.getView().byId("projectsTable");
                oTable.getSelectedItem().setSelected(false)
                var oSplitter = oController.getView().getContent()[0].getContent()[0].getRootPaneContainer();
                oSplitter.getPanes()[0].getLayoutData().setSize("100%");
                oSplitter.removePane(1);
            },
            onSave: function (oEvent) {
                var oController = this;
                var oModel = oController.getView().getModel();
                var viewModel = oController.getView().getModel("viewModel");

                viewModel.setProperty("/footerVisible", false);

                var oSplitter = oController.getView().getContent()[0].getContent()[0].getRootPaneContainer()
                oSplitter.getPanes()[0].getLayoutData().setSize("100%");
                oSplitter.removePane(1);

                var oTable = oSplitter.getPanes()[0].getContent();

                if (oTable.getMode() == 'MultiSelect') {
                    oTable.getSelectedItems().forEach(item => item.setSelected(false))
                } else {
                    oTable.getSelectedItem().setSelected(false)
                }
            },

            onCancel: function (oEvent) {
                var oController = this;
                var oModel = oController.getView().getModel();
                var viewModel = oController.getView().getModel("viewModel");


                var rawData = viewModel.getProperty("/rawData");
                oModel.setProperty("/EmployeeProjects", rawData);

                viewModel.setProperty("/footerVisible", false);

                var oSplitter = oController.getView().getContent()[0].getContent()[0].getRootPaneContainer()
                oSplitter.getPanes()[0].getLayoutData().setSize("100%");
                oSplitter.removePane(1);

                var oTable = oSplitter.getPanes()[0].getContent();

                if (oTable.getMode() == 'MultiSelect') {
                    oTable.getSelectedItems().forEach(item => item.setSelected(false))
                } else {
                    oTable.getSelectedItem().setSelected(false)
                }

            }
        });
    }
);