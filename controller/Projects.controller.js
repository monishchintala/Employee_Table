sap.ui.define(
    ["sap/ui/core/mvc/Controller",],
    function (Controller) {
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
            }
        });
    }
);