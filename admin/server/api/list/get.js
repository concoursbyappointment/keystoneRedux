var async = require('async');
var assign = require('object-assign');
var listToArray = require('list-to-array');

module.exports = function (req, res) {
	console.log('in list get.js---------------------------->',req.originalUrl);
	var where = {};
	var fields = req.query.fields;
	var includeCount = req.query.count !== 'false';
	var includeResults = req.query.results !== 'false';
	if (includeResults && fields) {
		if (fields === 'false') {
			fields = false;
		}
		if (typeof fields === 'string') {
			fields = listToArray(fields);
		}
		if (fields && !Array.isArray(fields)) {
			return res.status(401).json({ error: 'fields must be undefined, a string, or an array' });
		}
	}
	var filters = req.query.filters;

	console.log('filters',filters);

	if (filters && typeof filters === 'string') {
		try { filters = JSON.parse(req.query.filters); }
		catch (e) { } // eslint-disable-line no-empty
	}
	if (typeof filters === 'object') {
		assign(where, req.list.addFiltersToQuery(filters));
	}
		var sq =(req.query.search) ? true: false;
  console.log('sq:',sq);
    
	if (req.query.search) {
		assign(where, req.list.addSearchToQuery(req.query.search,req.query.sort));
	}
  console.log('where1',where);
	//hack the sort param into the where query operator
	if (typeof req.query.sort != 'undefined' && typeof req.query.search !='undefined') {	
	var searchPathType=req.list.schema.paths[req.query.sort].instance;
		console.log('sort path type',searchPathType);

		var newSearch=req.query.sort;

		for(var path in where) break;
			var term=where[path];
			where = {};

			where[newSearch] = term;

	}

	console.log('final search where2',where);
	var query = req.list.model.find(where);

	if (req.query.populate) {
		query.populate(req.query.populate);
	}
	if (req.query.expandRelationshipFields && req.query.expandRelationshipFields !== 'false') {
		req.list.relationshipFields.forEach(function (i) {
			query.populate(i.path);
		});
	}
	var sort = req.list.expandSort(req.query.sort);
	async.waterfall([
		function (next) {
			if (!includeCount) {
				return next(null, 0);
			}
			query.count(next);
		},
		function (count, next) {
			if (!includeResults) {
				return next(null, count, []);
			}
			query.find();
			query.limit(Number(req.query.limit) || 100);
			query.skip(Number(req.query.skip) || 0);
			if (sort.string) {
				query.sort(sort.string);
			}
			query.exec(function (err, items) {
				next(err, count, items);
			});
		},
	], function (err, count, items) {
		if (err) {
			res.logError('admin/server/api/list/get', 'database error finding items', err);
			return res.apiError('database error', err);
		}

		return res.json({
			results: includeResults
				? items.map(function (item) {
					return req.list.getData(item, fields, req.query.expandRelationshipFields);
				})
				: undefined,
			count: includeCount
				? count
				: undefined,
		});
	});
};
