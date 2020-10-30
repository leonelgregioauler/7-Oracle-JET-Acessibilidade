/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */

define(
  ['knockout',
    'accUtils',
    'ojs/ojarraytreedataprovider',
    'ojs/ojarraydataprovider',
    'ojs/ojknockout-keyset',
    'ojs/ojtreeview',
    'ojs/ojavatar',
    'ojs/ojknockout',
    'ojs/ojformlayout',
    'ojs/ojlabel',
    'ojs/ojconverterutils-i18n',
    'ojs/ojlabelvalue',
    'ojs/ojinputtext',
    'ojs/ojdatetimepicker',
    'ojs/ojinputnumber',
    'ojs/ojselectsingle',
    'ojs/ojradioset'],
  function (ko, accUtils, ArrayTreeDataProvider, ArrayDataProvider, KeySet) {
    function OrganizationViewModel() {
	  var self = this;
      const deptURL = 'https://apex.oracle.com/pls/apex/accjet/hr/departments/';
      const empURL = 'https://apex.oracle.com/pls/apex/accjet/hr/employees/';

      self.deptDP = ko.observable();
      self.depArray = ko.observable();
      self.empArray = ko.observable();
      self.depsDataProvider = ko.observable();
      self.dataProvider = ko.observable();
      self.expanded = new KeySet.ObservableKeySet().add(['research']);
      self.itemSelected = ko.observable(false);
      self.empDetails = ko.observable();

      fetch(empURL)
        .then((response) => {
          return response.json();
        })
        .then((body) => {
          let tempArray = self.createTreeData(body.items);
          self.empArray(new ArrayDataProvider(body.items, { keyAttributes: 'empno' }));
          self.dataProvider(new ArrayTreeDataProvider(tempArray, { keyAttributes: 'id' }));
        });

      fetch(deptURL)
        .then((response) => {
          return response.json();
        })
        .then((body) => {
          let tempArray = body.items.map(item => {
            return {
              value: item.deptno,
              label: item.dname
            }
          })
          self.depArray(tempArray);
          self.deptDP(new ArrayDataProvider(body.items, { keyAttributes: 'deptno' }));
        });

      self.createTreeData = (baseData) => {
        let org = {
          Accounting: { children: [] },
          Research: { children: [] },
          Sales: { children: [] },
          Operations: { children: [] }
        };
        baseData.forEach(emp => {
          switch (emp.deptno) {
            case 10:
              org.Accounting.children.push({ title: emp.ename, id: emp.empno, isLeaf: true });
              break;
            case 20:
              org.Research.children.push({ title: emp.ename, id: emp.empno, isLeaf: true });
              break;
            case 30:
              org.Sales.children.push({ title: emp.ename, id: emp.empno, isLeaf: true });
              break;
            case 40:
              org.Operations.children.push({ title: emp.ename, id: emp.empno, isLeaf: true });
              break;
            default:
              org.Accounting.children.push({ title: emp.ename, id: emp.empno, isLeaf: true });
          }
        });
        let finalOrg = [
          {
            title: 'Accounting', id: 'accounting', isLeaf: false, children: org.Accounting.children
          },
          {
            title: 'Research', id: 'research', isLeaf: false, children: org.Research.children
          },
          {
            title: 'Sales', id: 'sales', isLeaf: false, children: org.Sales.children
          },
          {
            title: 'Operations', id: 'operations', isLeaf: false, children: org.Operations.children
          }];

        return finalOrg;
      };

      let jobsArray = [
        {label:'CLERK', value: 'CLERK'},
        {label:'SALESPERSON', value: 'SALESPERSON'},
        {label:'ANALYST', value: 'ANALYST'},
        {label:'MANAGER', value: 'MANAGER'}
      ]
      self.jobOptions = new ArrayDataProvider(jobsArray, {keyAttributes: 'value'});

      self.isLeaf = (value) => {
        return value;
      };

      self.getInitials = (value) => {
        return value.title.slice(0, 1);
      };

      self.getItemText = (context) => {
        return context.data.dname;
      }

      self.selectionHandler = (event) => {
        let temp = event.detail.value.values();
        if (temp.size > 0) {
          fetch(empURL + temp.entries().next().value[0])
            .then(response => response.json())
            .then(emp => {
              let tempObj = {
                empno: emp.empno,
                ename: emp.ename,
                job: emp.job,
                mgr: emp.mgr,
                hiredate: emp.hiredate,
                sal: emp.sal,
                deptno: emp.deptno
              };
              self.empDetails(tempObj);
              self.depsDataProvider(new ArrayDataProvider(self.depArray(), {keyAttributes: 'value'}));
              self.itemSelected(true);
            });
        } else {
          self.itemSelected(false);
        }
      }

	  self.setKeyTrap = function (event) {
	  	event.target.focus();
}

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
      self.connected = function () {
        accUtils.announce('Organization tab loaded.', 'polite');
        document.title = "Introduction : Organization  -- Accessibility Learning Path";
        // Implement further logic if needed
      };

      /**
       * Optional ViewModel method invoked after the View is disconnected from the DOM.
       */
      self.disconnected = function () {
        // Implement if needed
      };

      /**
       * Optional ViewModel method invoked after transition to the new View is complete.
       * That includes any possible animation between the old and the new View.
       */
      self.transitionCompleted = function () {
        // Implement if needed
      };
    }

    /*
     * Returns an instance of the ViewModel providing one instance of the ViewModel. If needed,
     * return a constructor for the ViewModel so that the ViewModel is constructed
     * each time the view is displayed.
     */
    return OrganizationViewModel;
  }
);
