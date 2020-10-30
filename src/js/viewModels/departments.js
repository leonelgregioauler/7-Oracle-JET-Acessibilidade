/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */

define(
  ['accUtils',
    'jquery',
    'knockout',
    'ojs/ojarraydataprovider',
    'ojs/ojcontext',
    'ojs/ojknockouttemplateutils',
    'ojs/ojconverter-number',
    'ojs/ojdatagrid',
    'ojs/ojfilmstrip',
    'ojs/ojchart',
    'ojs/ojpagingcontrol',
    'ojs/ojformlayout'],
  function (accUtils, $, ko, ArrayDataProvider, Context, KnockoutTemplateUtils, NumberConverter) {
    function DepartmentsViewModel() {
	  var self = this;

      self.KnockoutTemplateUtils = KnockoutTemplateUtils;
      const deptURL = 'https://apex.oracle.com/pls/apex/accjet/hr/departments/';
      const empURL = 'https://apex.oracle.com/pls/apex/accjet/hr/employees/';
      self.dataReady = ko.observable(false);
      self.accountingCount = ko.observable(0);
      self.researchCount = ko.observable(0);
      self.salesCount = ko.observable(0);
      self.operationsCount = ko.observable(0);
      self.pagingModel = ko.observable();
      self.depts = ko.observableArray();

      self.getItemInitialDisplay = function (index) {
        return index < 1 ? '' : 'none';
      };

      fetch(empURL).then(response => response.json()).then(data => {
        self.processEmpData(data);
      });

      self.deptTotals = ko.observableArray([]);
      self.chartDataProvider = new ArrayDataProvider(self.deptTotals, { keyAttributes: 'id' });
      self.totalSalary = 0;

      self.processEmpData = (data) => {
        let tempArray = data.items;
        self.deptTotals([
          {
            id: 0,
            series: 'Accounting',
            group: 'Department',
            value: 0
          },
          {
            id: 1,
            series: 'Research',
            group: 'Department',
            value: 0
          },
          {
            id: 2,
            series: 'Sales',
            group: 'Department',
            value: 0
          },
          {
            id: 3,
            series: 'Operations',
            group: 'Department',
            value: 0
          }
        ]);
        tempArray.forEach(item => {
          switch (item.deptno) {
            case 10:
              self.totalSalary += item.sal;
              self.deptTotals()[0].value += item.sal;
              self.accountingCount(self.accountingCount() + 1);
              break;
            case 20:
              self.totalSalary += item.sal;
              self.deptTotals()[1].value += item.sal;
              self.researchCount(self.researchCount() + 1);
              break;
            case 30:
              self.totalSalary += item.sal;
              self.deptTotals()[2].value += item.sal;
              self.salesCount(self.salesCount() + 1);
              break;
            case 40:
              self.totalSalary += item.sal;
              self.deptTotals()[3].value += item.sal;
              self.operationsCount(self.operationsCount() + 1);
              break;
            default:
              console.log('Unknown department: ' + item.deptno);
          }
        });
      };

      self.getEmpCount = (val) => {
        switch (val) {
          case 'accounting':
            return self.accountingCount();
          case 'research':
            return self.researchCount();
          case 'sales':
            return self.salesCount();
          case 'operations':
            return self.operationsCount();
          default:
            return 0;
        }
      };

      self.usdNumberConverter = new NumberConverter.IntlNumberConverter({
        style: "currency",
        currency: "USD",
        currencyDisplay: "code",
        pattern: "¤ ##,##0.00"
      });

      self.dgDataProvider = ko.observable();
      $.getJSON(deptURL).then((depts) => {
        let tempDeptArray = [];
        let tempArray = depts.items.map(dept => {
          tempDeptArray.push({ name: (dept.dname).toLowerCase(), loc: (dept.loc).toLowerCase() });
          return {
            deptno: dept.deptno,
            dname: dept.dname,
            loc: dept.loc
          };
        });
        self.depts(tempDeptArray);
        self.dgDataProvider(new ArrayDataProvider(tempArray, { keyAttributes: 'deptno' }));
        self.dataReady(true);

        let filmStrip = document.getElementById('deptFilmstrip');
        let busyContext = Context.getContext(filmStrip).getBusyContext();
        busyContext.whenReady().then(() => {
          // Set the Paging Control pagingModel
          self.pagingModel(filmStrip.getPagingModel());
        });
      });

      self.styleName = (string) => {
        string = string.toLowerCase();
        return string.charAt(0).toUpperCase() + string.slice(1);
      };

      self.getCellClassName = (cellContext) => {
        let key = cellContext.keys.column;
        if (key === 'deptno') {
          return 'oj-helper-justify-content-right small-cell';
        }
        if (key === 'dname' || key === 'loc') {
          return 'oj-sm-justify-content-flex-start med-cell';
        }
        return '';
      };

      self.getCellWidth = (cellContext) => {
        let key = cellContext.data;
        if (key === 'deptno') {
          return 'width:20%';
        }
        if (key === 'dname' || key === 'loc') {
          return 'width:40%';
        }
        return '';
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
        accUtils.announce('Departments tab loaded.', 'polite');
        document.title = "Introduction : Departments  -- Accessibility Learning Path";
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
    return DepartmentsViewModel;
  }
);
