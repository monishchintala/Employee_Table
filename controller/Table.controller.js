sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/ui/Device',
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    "sap/m/library",
    'sap/ui/core/Fragment',
    "sap/ui/layout/SplitPane",
    "sap/ui/layout/SplitterLayoutData"
], function (Controller, JSONModel, Device, Filter, Sorter, Library, Fragment, SplitPane, SplitterLayoutData) {
    "use strict";


    var TableController = Controller.extend("Emp_Table.controller.Table", {
        onInit: function () {
            var oController = this;
            var oModel = oController.getOwnerComponent().getModel();
            var viewModel = oController.getOwnerComponent().getModel("viewModel");

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
        // onItemPress: function (oEvent) {
        //     var oController = this;
        //     oController.onSelectionchange(oEvent, true)
        // },

        onSelectionchange: function (oEvent, flag) {
            var oController = this;
            var oModel = oController.getView().getModel();
            var viewModel = oController.getView().getModel("viewModel");

            var oTable = oEvent.getSource();

            var oSelectedItem = oEvent.getParameter('listItem')
            var mode = oTable.getMode();
            if (flag) {
                if (mode == 'SingleSelectLeft') {
                    oSelectedItem.setSelected(true)
                } else {
                    if (oSelectedItem.getSelected()) {
                        oSelectedItem.setSelected(false)
                    } else {
                        oSelectedItem.setSelected(true)
                    }
                }
            }

            var oSplitter = oController.getView().getParent().getParent()
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

            var selectedItems = oTable.getSelectedContexts();

            if (mode == 'SingleSelectLeft' || selectedItems.length === 1) {
                var oContext
                if (mode == 'SingleSelectLeft') {
                    oContext = oSelectedItem.getBindingContext();
                } else {
                    oContext = selectedItems[0];
                }
                viewModel.setProperty("/sPath", oContext.getPath())
                var sFragmentId = this.createId("fragment_" + new Date().getTime());
                Fragment.load({
                    id: sFragmentId,
                    name: "Emp_Table.fragments.EditDetailsDialog",
                    type: "XML",
                    controller: this
                }).then(function (oFragment) {
                    oSplitPane.setContent(oFragment);
                    oSplitter.addPane(oSplitPane);
                }.bind(this));
                oSplitter.setModel(oModel);
                oSplitter.setBindingContext(oContext);
            } else {
                oSplitPane.setContent(oController.createContent(oController, selectedItems));
                oSplitter.addPane(oSplitPane);
            }






        },
        onGenderChange: function (oEvent) {
            var oController = this
            var oModel = oEvent.getSource().getModel();
            var viewModel = oController.getView().getModel("viewModel");

            var oSelectedItemIndex = oEvent.getParameter("selectedIndex")
            var oRadioButtons = oEvent.getSource().getButtons();
            var selectedRadioButton = oRadioButtons[oSelectedItemIndex].getText()

            var oSelectedItem = oEvent.getSource()
            var oBindingContext = oSelectedItem.getBindingContext()
            var sPath = oBindingContext.getPath()

            oModel.setProperty(sPath + '/gender', selectedRadioButton)
            oModel.setProperty(sPath + '/visible', true)
            viewModel.setProperty("/footerVisible", true)
        },

        onChange: function (oEvent) {
            var oController = this;
            var oModel = oEvent.getSource().getModel();
            var viewModel = oController.getView().getModel("viewModel");
            var sPath = viewModel.getProperty("/sPath");
            oModel.setProperty(sPath + '/visible', true)
            viewModel.setProperty("/footerVisible", true)
        },

        onClose: function (oEvent) {
            var oController = this;
            var oTable = oController.getView().byId("idEmpTable");
            oTable.getSelectedItem().setSelected(false)
            var oSplitter = oController.getView().getParent().getParent();
            oSplitter.getPanes()[0].getLayoutData().setSize("100%");
            oSplitter.removePane(1);
        },
        onSwitch: function (oEvent) {
            var oController = this;
            var oTable = oEvent.getSource().getParent().getParent();
            var flag = oEvent.getSource().getState()
            if (flag) {
                oTable.setMode('MultiSelect')
            } else {
                oTable.setMode('SingleSelectLeft')
            }
        },

        createContent: function (oController, selectedItems) {

            var oToolbar = new sap.m.Toolbar({
                content: [
                    new sap.m.Title({ text: "Details" }),
                    new sap.m.ToolbarSpacer(),
                    new sap.m.Button({
                        icon: "sap-icon://decline",
                        tooltip: "Close",
                        type: "Transparent",
                        press: [oController.onClose, oController]
                    })
                ]
            });


            var content = oController.prepareItems(oController, selectedItems)



            var oForm = new sap.ui.layout.form.SimpleForm({
                title: "Edit Details",
                layout: "ResponsiveGridLayout",
                toolbar: oToolbar,
                content: content
            });

            return oForm;
        },
        onComboBoxChange: function (oEvent, selectedItems) {
            var oController = this;
            var oModel = oEvent.getSource().getModel();
            var viewModel = oController.getView().getModel("viewModel");

            var prop = oEvent.getSource().getProperty("name");
            var value = oEvent.getParameter("value");

            if (value === "< Keep Existing Values >") {
                return;
            } else {
                selectedItems.forEach(selectedItem => {
                    var sPath = selectedItem.sPath + "/" + prop
                    if (value === "< Leave Blank >") {
                        oModel.setProperty(sPath, "")
                    } else {
                        oModel.setProperty(sPath, value)
                    }
                    oModel.setProperty(selectedItem.sPath + '/visible', true)
                })
            }
            viewModel.setProperty("/footerVisible", true)
        },
        prepareItems: function (oController, selectedItems) {
            var oModel = oController.getView().getModel();

            var items = [];

            var props = [
                "name",
                "designation",
                "phone",
                "salary",
                "gender",
                "joiningDate",
                "address",
            ];

            props.forEach(prop => {
                var comboBox;
                if (["name", "phone", "joiningDate", "address"].includes(prop)) {
                    comboBox = new sap.m.Label()
                    var commonValue = oModel.getProperty(selectedItems[0].sPath + '/' + prop);
                    var sameValueExisted = selectedItems.every(item => {
                        var value = oModel.getProperty(item.sPath + '/' + prop);
                        return value == commonValue;
                    })
                    if (sameValueExisted) {
                        comboBox.setText(commonValue);
                    } else {
                        comboBox.setText("(multiple)");
                    }
                } else {
                    var aItems = [
                        {
                            text: "< Keep Existing Values >",
                            key: "< Keep Existing Values >",
                        },
                        {
                            text: "< Leave Blank >",
                            key: "< Leave Blank >",
                        },
                    ]
                    selectedItems.forEach(selectedItem => {
                        var value = oModel.getProperty(selectedItem.sPath + '/' + prop)
                        var index = aItems.findIndex(aItem => aItem.key == value)

                        if (index == -1) {
                            aItems.push({
                                text: value,
                                key: value,
                            })
                        }
                    })
                    var comboBox = new sap.m.ComboBox({
                        selectedKey: "< Keep Existing Values >",
                        items: aItems,
                        change: (oEvent) => oController.onComboBoxChange(oEvent, selectedItems),
                        name: prop
                    });
                }
                var vBox = new sap.m.VBox({
                    items: [
                        new sap.m.HBox({
                            alignItems: "Center",
                            width: "100%",
                            justifyContent: "Start",
                            items: [
                                new sap.m.Label({
                                    text: `{i18n>${prop}}: `,
                                    width: "120px"
                                }),
                                comboBox
                            ]
                        })
                    ]
                }).addStyleClass("sapUiTinyMarginTop sapUiTinyMarginBottom")
                items.push(vBox)
            })
            return items;
        },

        onItemPress: function (oEvent) {
            var oController = this;
            var oModel = oController.getView().getModel();
            var oContext = oEvent.getParameter("listItem").getBindingContext()
            var sPath = oContext.getPath()
            var id = oModel.getProperty(sPath + '/id')
            var oRouter = oController.getOwnerComponent().getRouter();
            oRouter.navTo("Projects", {
                id: id,
            });
        }
    });
    return TableController;
});