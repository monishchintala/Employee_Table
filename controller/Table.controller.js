sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/Device',
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    "sap/m/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/VBox",
    "sap/m/Label",
    "sap/m/Input",
    "sap/m/Select",
    'sap/ui/core/Fragment',
], function (Controller, JSONModel, Device, Filter, Sorter, Library, Dialog, Button, VBox, Label, Input, Select, Fragment) {
    "use strict";
    var ButtonType = Library.ButtonType;
    var fields = [
        {
            key: "id",
            value: "Employee ID"
        },
        {
            key: "name",
            value: "Name"
        },
        {
            key: "designation",
            value: "Designation"
        },
        {
            key: "phone",
            value: "PhoneNumber"
        },
        {
            key: "email",
            value: "Email"
        },
        {
            key: "salary",
            value: "Salary"
        },
        {
            key: "gender",
            value: "Gender"
        },
        {
            key: "joiningDate",
            value: "JoiningDate"
        },
        {
            key: "address",
            value: "Address"
        },
    ];
    var TableController = Controller.extend("Emp_Table.controller.Table", {
        onInit: function () {
            var oController = this;
            oController._mViewSettingsDialogs = {}

            this.mGroupFunctions = {
                designation: function (oContext) {
                    var name = oContext.getProperty("designation");
                    return {
                        key: name,
                        text: name
                    };
                },
            };

        },
        resetGroupDialog: function (oEvent) {
            this.groupReset = true;
        },

        getViewSettingsDialog: function (sDialogFragmentName) {
            var oController = this;
            var pDialog = oController._mViewSettingsDialogs[sDialogFragmentName];
            if (!pDialog) {
                pDialog = Fragment.load({
                    id: oController.getView().getId(),
                    name: sDialogFragmentName,
                    controller: oController
                }).then(function (oDialog) {
                    if (Device.system.desktop) {
                        oDialog.addStyleClass("sapUiSizeCompact");
                    }
                    return oDialog;
                });
                oController._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
            }
            return pDialog;
        },

        handleSortButtonPressed: function () {
            var oController = this;
            oController.getViewSettingsDialog("Emp_Table.fragments.SortDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleFilterButtonPressed: function () {
            this.getViewSettingsDialog("Emp_Table.fragments.FilterDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },

        handleGroupButtonPressed: function () {
            this.getViewSettingsDialog("Emp_Table.fragments.GroupDialog")
                .then(function (oViewSettingsDialog) {
                    oViewSettingsDialog.open();
                });
        },
        handleSortDialogConfirm: function (oEvent) {
            var oController = this
            var oTable = oController.byId("idEmpTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                aSorters = [];

            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));

            // apply the selected sort and group settings
            oBinding.sort(aSorters);
        },
        handleFilterDialogConfirm: function (oEvent) {
            var oTable = this.byId("idEmpTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                aFilters = [];

            mParams.filterItems.forEach(function (oItem) {
                var aSplit = oItem.getKey().split("___"),
                    sPath = aSplit[0],
                    sOperator = aSplit[1],
                    sValue1 = aSplit[2],
                    sValue2 = aSplit[3],
                    oFilter = new Filter(sPath, sOperator, sValue1, sValue2);
                aFilters.push(oFilter);
            });

            // apply filter settings
            oBinding.filter(aFilters);

            // update filter bar
            this.byId("vsdFilterBar").setVisible(aFilters.length > 0);
            this.byId("vsdFilterLabel").setText(mParams.filterString);
        },

        handleGroupDialogConfirm: function (oEvent) {
            var oTable = this.byId("idEmpTable"),
                mParams = oEvent.getParameters(),
                oBinding = oTable.getBinding("items"),
                sPath,
                bDescending,
                vGroup,
                aGroups = [];

            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                vGroup = this.mGroupFunctions[sPath];
                aGroups.push(new Sorter(sPath, bDescending, vGroup));
                // apply the selected group settings
                oBinding.sort(aGroups);
            } else if (this.groupReset) {
                oBinding.sort();
                this.groupReset = false;
            }
        },



        onEditPress: function (oEvent) {
            var oController = this;
            var oModel = oController.getView().getModel();
            var oI18nModel = oController.getView().getModel("i18n"); // Get the i18n model

            var oSelectedItem = oEvent.getSource().getParent();
            var oContext = oSelectedItem.getBindingContext();
            var data = oModel.getProperty(oContext.getPath());
            var oContext1 = $.extend(true, {}, data);

            var createDialogContent = sap.ui.xmlfragment("Emp_Table.fragments.EditDetailsDialog", oController);
            createDialogContent.setModel(oI18nModel, "i18n");
            oController.oDialog = new Dialog({
                title: "Edit Employee Details",
                contentWidth: "500px",
                content: createDialogContent,
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "Save",
                    press: function () {
                        for (const key in oContext1) {
                            const element = oContext1[key];
                            if (element != data[key]) {
                                oModel.getProperty(oContext.getPath()).visible = true;
                            }
                        }
                        oModel.setProperty(oContext.getPath(), data);
                        oController.oDialog.close();

                    }.bind(oController)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        oModel.setProperty(oContext.getPath(), oContext1);
                        oController.oDialog.close();
                    }.bind(oController)
                }),
                afterClose: function () {
                    oController.oDialog.destroy(); // Destroy the dialog
                }
            });
            // oController.getView().addDependent(oController.oDialog);
            oController.oDialog.setModel(oModel);
            oController.oDialog.setBindingContext(oContext);
            oController.oDialog.open();
        },

        onGenderChange: (oEvent) => {
            var oController = this
            var oModel = oEvent.getSource().getModel();

            var oSelectedItemIndex = oEvent.getParameter("selectedIndex")
            var oRadioButtons = oEvent.getSource().getButtons();
            var selectedRadioButton = oRadioButtons[oSelectedItemIndex].getText()

            var oSelectedItem = oEvent.getSource()
            var oBindingContext = oSelectedItem.getBindingContext()
            var sPath = oBindingContext.getPath()

            oModel.setProperty(sPath + '/gender', selectedRadioButton)
        },

        generateSelectItems: (data) => {
            let items = [];

            data.forEach(d => {
                var oItem = new sap.ui.core.Item({
                    key: d.value,
                    text: d.value,
                });
                items.push(oItem)
            })
            return items
        },

        generateFields: function (oEmployeeData) {
            var oController = this;
            var modelData = oController.getView().getModel()
            var items = [];
            fields.forEach((field, i) => {
                var id = "field" + i
                var oLabel = new Label({
                    text: field.value,
                    labelFor: id,
                    design: "Bold"
                });

                // Create the Input control
                var oInput;

                switch (field.key) {
                    case "designation":
                        oInput = new Select({
                            selectedKey: oEmployeeData[field.key],
                            items: oController.generateSelectItems(modelData.getData()['Designations'])
                            // items: {
                            //     path: "/Designations",
                            //     template: new sap.ui.core.Item({
                            //         key: "{value}",
                            //         text: "{value}"
                            //     })
                            // }
                        });
                        break

                    case "joiningDate":
                        oInput = new sap.m.DatePicker(id, {
                            placeholder: "Enter Date",
                            valueFormat: "yyyy-MM-dd",
                            displayFormat: "yyyy-MM-dd",

                            value: oEmployeeData[field.key],
                        });
                        break
                    case "gender":
                        oInput = new sap.m.RadioButtonGroup(id, {
                            columns: 2,
                            buttons: [
                                new sap.m.RadioButton({ text: "Male", selected: oEmployeeData[field.key] == "Male" }),
                                new sap.m.RadioButton({ text: "Female", selected: oEmployeeData[field.key] == "Female" }),
                            ]
                        });
                        break;

                    default:
                        oInput = new Input({
                            id: id,
                            value: oEmployeeData[field.key],
                            editable: field.key === "id" ? false : true,
                            placeholder: field.value
                        });
                        break;
                }

                // Place the controls in a container (e.g., a VBox)
                var oVBox = new VBox({
                    items: [oLabel, oInput]
                });
                oVBox.addStyleClass("customDialogPadding")
                items.push(oVBox)
            })

            return items
        },
    });
    return TableController;
});