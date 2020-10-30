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
    'ojs/ojcorerouter',
    'ojs/ojmodulerouter-adapter',
    'ojs/ojknockoutrouteradapter',
    'ojs/ojnavigationlist'
  ],
  function (accUtils, ko, ArrayDataProvider, CoreRouter, ModuleRouterAdapter, KnockoutRouterAdapter) {
    function IntroViewModel(params) {
	  var self = this;

      // setup router for tabbar states
      const routes = [
        { path: '', redirect: 'overview' }, // Default route redirects to 'overview'
        { path: 'overview', detail: { label: 'Overview' } },
        { path: 'organization', detail: { label: 'Organization' } },
        { path: 'employees', detail: { label: 'Employees' } },
        { path: 'departments', detail: { label: 'Departments' } }
      ];

      // Create ADP with partial array, excluding first redirect route
      self.dataProvider = new ArrayDataProvider(routes.slice(1), {
        keyAttributes: 'path'
      });

      // Create the router with the routes
      let overviewRouter = params.parentRouter.createChildRouter(routes);

      // Create ModuleRouterAdapter instance
      self.module = new ModuleRouterAdapter(
        overviewRouter,
        {
          viewPath: 'views/',
          viewModelPath: 'viewModels/'
        }
      );

      // Create an observable to react to the current router state path
      self.selection = new KnockoutRouterAdapter(overviewRouter);

      // Synchronize the router, causing it to go to its default route
      overviewRouter.sync();


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
        accUtils.announce('Introduction page loaded.', 'assertive');
        document.title = "Introduction -- Accessibility Learning Path";
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
    return IntroViewModel;
  }
);
