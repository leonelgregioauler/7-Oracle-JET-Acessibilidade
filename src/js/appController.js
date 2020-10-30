/**
 * @license
 * Copyright (c) 2014, 2020, Oracle and/or its affiliates.
 * The Universal Permissive License (UPL), Version 1.0
 * @ignore
 */
/*
 * Your application specific code will go here
 */
define(
  ['knockout',
    'ojs/ojknockouttemplateutils',
    'ojs/ojcorerouter',
    'ojs/ojmodulerouter-adapter',
    'ojs/ojknockoutrouteradapter',
    'ojs/ojurlparamadapter',
    'ojs/ojresponsiveutils',
    'ojs/ojresponsiveknockoututils',
    'ojs/ojarraydataprovider',
    'ojs/ojoffcanvas',
    'ojs/ojmodule-element',
    'ojs/ojknockout'],
  function (ko,
    KnockoutTemplateUtils,
    CoreRouter,
    ModuleRouterAdapter,
    KnockoutRouterAdapter,
    UrlParamAdapter,
    ResponsiveUtils,
    ResponsiveKnockoutUtils,
    ArrayDataProvider,
    OffcanvasUtils) {
    function ControllerViewModel() {
      var self = this;

      this.KnockoutTemplateUtils = KnockoutTemplateUtils;

      // Handle announcements sent when pages change, for Accessibility.
      self.manner = ko.observable('polite');
      self.message = ko.observable();
      self.waitForAnnouncement = false;
      self.navDrawerOn = false;

      document.getElementById('globalBody').addEventListener('announce', announcementHandler, false);

      function announcementHandler(event) {
        self.message(event.detail.message);
        self.manner(event.detail.manner);
      }

      // Media queries for repsonsive layouts
      var smQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY);
      self.smScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(smQuery);
      var mdQuery = ResponsiveUtils.getFrameworkQuery(ResponsiveUtils.FRAMEWORK_QUERY_KEY.MD_UP);
      self.mdScreen = ResponsiveKnockoutUtils.createMediaQueryObservable(mdQuery);

      var navData = [
        { path: '', redirect: 'intro' },
        { path: 'intro', detail: { label: 'Introduction', iconClass: 'demo-chart-icon-24' } },
        { path: 'resources', detail: { label: 'Resources', iconClass: 'demo-info-icon-24' } }
      ];
      // Router setup
      var router = new CoreRouter(navData, {
        urlAdapter: new UrlParamAdapter()
      });
      router.sync();

      this.moduleAdapter = new ModuleRouterAdapter(router, {});

      this.selection = new KnockoutRouterAdapter(router);

      // Setup the navDataProvider with the routes, excluding the first redirected
      // route.
      this.navDataProvider = new ArrayDataProvider(navData.slice(1), { keyAttributes: 'path' });

      // Drawer
      // Close offcanvas on medium and larger screens
      self.mdScreen.subscribe(function () { OffcanvasUtils.close(self.drawerParams); });
      self.drawerParams = {
        displayMode: 'push',
        selector: '#navDrawer',
        content: '#pageContent'
      };
      // Called by navigation drawer toggle button and after selection of nav drawer item
      self.toggleDrawer = function () {
        self.navDrawerOn = true;
        return OffcanvasUtils.toggle(self.drawerParams);
      };

      // Header
      // Application Name used in Branding Area
      self.appName = ko.observable('Accessibility Learning Path');
      // User Info used in Global Navigation area
      self.userLogin = ko.observable('john.hancock@oracle.com');

      // Footer
      function footerLink(name, id, linkTarget) {
        this.name = name;
        this.linkId = id;
        this.linkTarget = linkTarget;
      }
      self.footerLinks = ko.observableArray([
        new footerLink('About Oracle', 'aboutOracle', 'http://www.oracle.com/us/corporate/index.html#menu-about'),
        new footerLink('Contact Us', 'contactUs', 'http://www.oracle.com/us/corporate/contact/index.html'),
        new footerLink('Legal Notices', 'legalNotices', 'http://www.oracle.com/us/legal/index.html'),
        new footerLink('Terms Of Use', 'termsOfUse', 'http://www.oracle.com/us/legal/terms/index.html'),
        new footerLink('Your Privacy Rights', 'yourPrivacyRights', 'http://www.oracle.com/us/legal/privacy/index.html')
      ]);
    }

    return new ControllerViewModel();
  }
);
