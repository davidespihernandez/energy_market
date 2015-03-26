'use strict';

module.exports = {
	app: {
		title: 'Energy Market',
		description: 'Energy Market data',
		keywords: 'Energy Market, SPP, Day Ahead, Real Time'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				 'public/lib/angular-chart.js/dist/angular-chart.css',
				 'public/lib/datatables-colvis/css/dataTables.colVis.css',
				 'public/lib/datatable-bootstrap/css/dataTables.bootstrap.css',
				 'public/lib/simple-line-icons/css/simple-line-icons.css',
				 'public/lib/animate.css/animate.min.css',
				 'public/lib/whirl/dist/whirl.css',
                 'public/lib/eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css',
                 'public/lib/chosen_v1.2.0/chosen.min.css',
                 'public/lib/angular-ui-select/dist/select.css',
                 'public/lib/ui-grid/ui-grid.min.css'
			],
			js: [
				'public/lib/jquery/dist/jquery.js',
				'public/lib/angular/angular.js',
				'public/lib/angular-route/angular-route.js',
				'public/lib/angular-cookies/angular-cookies.js',
				'public/lib/angular-animate/angular-animate.js',
				'public/lib/angular-touch/angular-touch.js',
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/ngstorage/ngStorage.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-sanitize/angular-sanitize.js',
				'public/lib/angular-resource/angular-resource.js',
				'public/lib/angular-translate/angular-translate.js',
				'public/lib/angular-translate-loader-url/angular-translate-loader-url.js',
				'public/lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
				'public/lib/angular-translate-storage-local/angular-translate-storage-local.js',
				'public/lib/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
				'public/lib/oclazyload/dist/ocLazyLoad.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
				'public/lib/angular-loading-bar/build/loading-bar.js',
                'public/lib/datatables/media/js/jquery.dataTables.min.js',
                'public/lib/datatables-colvis/js/dataTables.colVis.js',
                'public/lib/datatable-bootstrap/js/dataTables.bootstrap.js',
                'public/lib/datatable-bootstrap/js/dataTables.bootstrapPagination.js',
                'public/lib/Chart.js/Chart.js',
                'public/lib/angular-chart.js/dist/angular-chart.js',
                'public/lib/modernizr/modernizr.js',
                'public/lib/jQuery-Storage-API/jquery.storageapi.js',
                'public/lib/animo.js/animo.js',
                'public/lib/angular-chart.js/dist/angular-chart.js',
                'public/lib/slimScroll/jquery.slimscroll.min.js',
                'public/lib/jquery-localize-i18n/dist/jquery.localize.js',
                'public/lib/moment/min/moment.min.js',
                'public/lib/eonasdan-bootstrap-datetimepicker/build/js/bootstrap-datetimepicker.min.js',
                'public/lib/ng-csv.min.js',
                'public/lib/chosen_v1.2.0/chosen.jquery.min.js',
                'public/lib/angular-chosen-localytics/chosen.js',
                'public/lib/angular-ui-select/dist/select.js',
                'public/lib/ui-grid/ui-grid.min.js'
				// 'public/lib/jquery/dist/jquery.js',
				// 'public/lib/angular/angular.js',
				// 'public/lib/angular-resource/angular-resource.js',
				// 'public/lib/angular-cookies/angular-cookies.js',
				// 'public/lib/angular-animate/angular-animate.js',
				// 'public/lib/angular-touch/angular-touch.js',
				// 'public/lib/angular-sanitize/angular-sanitize.js',
				// 'public/lib/angular-ui-router/release/angular-ui-router.js',
				// 'public/lib/angular-ui-utils/ui-utils.js',
				// 'public/lib/angular-bootstrap/ui-bootstrap-tpls.js'
			]
		},
		css: [
			// 'public/modules/**/css/*.css'
            'public/application.min.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};