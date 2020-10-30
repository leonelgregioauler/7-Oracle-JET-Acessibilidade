/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */

define(
  ['accUtils',
    'knockout',
    'ojs/ojarraydataprovider',
    'ojs/ojvalidation-base',
    'ojs/ojconverterutils-i18n',
    'ojs/ojknockout',
    'ojs/ojtable',
    'ojs/ojvalidation-datetime',
    'ojs/ojvalidation-number',
    'ojs/ojdialog',
    'ojs/ojlabel',
    'ojs/ojinputtext',
    'ojs/ojinputnumber',
    'ojs/ojvalidationgroup',
    'ojs/ojavatar',
    'ojs/ojmessages',
    'ojs/ojformlayout'
  ],
  function (accUtils, ko, ArrayDataProvider, ValidationBase, ConverterUtilsI18n) {
    function EmployeesViewModel() {

	  var self = this;
      const empURL = 'https://apex.oracle.com/pls/apex/accjet/hr/employees/';
      const deptURL = 'https://apex.oracle.com/pls/apex/accjet/hr/departments/';

      self.createMessage = (data) => {
        return {
          severity: 'confirmation',
          summary: 'Updates saved',
          detail: 'The changes for employee ' + data.ename + ' have been saved.',
          closeAffordance: 'defaults',
          autoTimeout: -1,
          sound: 'defaults',
          timestamp: ConverterUtilsI18n.IntlConverterUtils.dateToLocalIso(new Date())
        };
      };

      self.positionObject = {
        my: { vertical: 'top', horizontal: 'start' },
        at: { vertical: 'top', horizontal: 'start' },
        /* desta forma, a mensagem de save aparece dentro da tab, ao invés da janela */
        /* of: 'window' */
        of: '#table'
      };

      self.messages = ko.observableArray([]);
      self.messagesDataprovider = ko.observable();
      self.messagesDataprovider(new ArrayDataProvider(self.messages));

      self.selectedRow = ko.observable();
      self.activeRow = ko.observable();

      // edit dialog data variables
      self.editEmployeeId = ko.observable();
      self.editEmployeeName = ko.observable();
      self.editJob = ko.observable();
      self.editSal = ko.observable();
      self.editHireDate = ko.observable();
      self.editMgr = ko.observable();
      self.editComm = ko.observable();
      self.editDeptNo = ko.observable();

      self.groupValid = ko.observable();

      // detail data variables
      self.detailEmployeeId = ko.observable();
      self.detailEmployeeName = ko.observable();
      self.detailJob = ko.observable();
      self.detailSal = ko.observable();
      self.detailHireDate = ko.observable();
      self.detailMgr = ko.observable();
      self.detailComm = ko.observable();
      self.detailDeptNo = ko.observable();

      const salOptions = {
        style: 'currency',
        currency: 'USD'
      };
      const salaryConverter = ValidationBase.Validation.converterFactory('number').createConverter(salOptions);

      // for date fields
      const dateOptions = {
        formatStyle: 'date',
        dateFormat: 'medium'
      };
      const dateConverter = ValidationBase.Validation.converterFactory('datetime').createConverter(dateOptions);

      self.formatSal = data => salaryConverter.format(data);
      self.formatDate = data => dateConverter.format(data);

      self.deptMap = ko.observable();
      $.getJSON(deptURL).then(depts => {
        self.deptMap(new Map(Array.from(depts.items.map(dept => [dept.deptno, dept]))));
      });

      self.data = ko.observableArray();
      self.empMap = ko.observable();
      $.getJSON(empURL)
        .then(users => {
          self.empMap(new Map(Array.from(users.items.map(emp => [emp.empno, emp]))));
          let tempArray = users.items.map(item => {
            return {
              empno: item.empno,
              ename: item.ename,
              job: item.job,
              hiredate: item.hiredate,
              sal: item.sal,
              mgr: item.mgr,
              comm: item.comm,
              deptno: item.deptno
            };
          });
          self.data(tempArray);
        });

      self.dataProvider = new ArrayDataProvider(
        self.data, { keyAttributes: 'empno' }
      );

      self.isDisabled = ko.observable(true);
      self.selectionChangedHandler = (event) => {
        let data = self.selectedRow().data;
        if (event.detail.previousValue.key) {
          document.getElementById(event.detail.previousValue.key + '-btn').setProperty('disabled', true);
        }
        if (event.detail.value.key) {
        document.getElementById(data.empno + '-btn').setProperty('disabled', false);
        }
      };

      self.editRow = (event) => {
        event.detail.originalEvent.stopPropagation();
        let data = self.selectedRow().data;
        document.getElementById('editDialog').open();
        self.editEmployeeId(data.empno);
        self.editEmployeeName(data.ename);
        self.editJob(data.job);
        self.editSal(data.sal);
        self.editHireDate(data.hiredate);
        self.editMgr(data.mgr);
        self.editComm(data.comm);
        self.editDeptNo(data.deptno);
      };

      self.save = () => {
        // save edits to employee
        let url = empURL + self.editEmployeeId();
        let newData = {
          ename: self.editEmployeeName(),
          job: self.editJob(),
          sal: self.editSal(),
          hiredate: self.editHireDate(),
          mgr: self.editMgr(),
          comm: self.editComm(),
          deptno: self.editDeptNo()
        };

        self.updateData(url, newData)
          .then(() => {
            document.getElementById('editDialog').close();
            let newMessage = self.createMessage({ ename: self.editEmployeeName() });
            self.messages.push(newMessage);
            let element = document.getElementById('table');
            let currentRow = element.currentRow;
            if (currentRow != null) {
              self.data.splice(currentRow.rowIndex, 1, {
                empno: self.editEmployeeId(),
                ename: self.editEmployeeName(),
                job: self.editJob(),
                sal: self.editSal(),
                hiredate: self.editHireDate()
              });
              document.getElementById(currentRow.rowKey + '-btn').setProperty('disabled', false);
            }
          });
      };

      self.cancel = () => {
        // cancel and close the dialog
        document.getElementById('editDialog').close();
      };

      self.updateData = (url, data) => {
        return fetch(url, {
          method: 'PUT', // 'GET', 'PUT', 'DELETE', etc.
          body: JSON.stringify(data), // Use correct payload (matching 'Content-Type')
          headers: { 'Content-Type': 'application/json' },
        })
          .then(response => response.json())
          .catch(error => console.error(error));
      };

      self.rowChangeHandler = (event) => {
        let data = event.detail;
        if (event.type === 'currentRowChanged' && data.value != null) {
          let rowIndex = data.value.rowIndex;
          let emp = self.data()[rowIndex];
          if (emp != null) {
            self.detailEmployeeId(emp.empno);
            self.detailEmployeeName(emp.ename);
            self.detailJob(emp.job);
            self.detailSal(salaryConverter.format(emp.sal));
            self.detailHireDate(emp.hiredate);
            self.detailMgr(self.getMgr(emp.mgr));
            self.detailDeptNo(self.getDept(emp.deptno));
          }
          self.activeRow(data.value);
        }
      };

      self.getDept = (id) => {
        if (id) {
          return self.deptMap().get(id).dname;
        }
        return 'No Department';
      };

      self.getMgr = (id) => {
        if (id) {
          return self.empMap().get(id).ename;
        }
        return 'No Manager';
      };

      // Below are a set of the ViewModel methods invoked by the oj-module component.
      // Please reference the oj-module jsDoc for additional information.

      /**
       * Optional ViewModel method invoked after the View is inserted into the
       * document DOM.  The application can put logic that requires the DOM being
       * attached here.
       * This method might be called multiple times - after the View is created
       * and inserted into the DOM and after the View is reconnected
       * after being disconnected.
       */
      self.connected = () => {
        accUtils.announce('Employees tab loaded.', 'polite');
        document.title = "Introduction : Employees  --  Accessibility Learning Path";
        // Implement further logic if needed
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      self.disconnected = () => {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      self.transitionCompleted = () => {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return EmployeesViewModel;
  }
);
