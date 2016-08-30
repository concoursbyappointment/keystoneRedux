var assign = require('object-assign');
var utils = require('keystone-utils');
var debug = require('debug')('keystone:core:list:addSearchToQuery');

function trim (i) { return i.trim(); }
function truthy (i) { return i; }

function getNameFilter (field, searchString) {
	var searchWords = searchString.split(' ').map(trim).filter(truthy).map(utils.escapeRegExp);
	var nameSearchRegExp = new RegExp(searchWords.join('|'), 'i');
	var first = {};
	first[field.paths.first] = nameSearchRegExp;
	var last = {};
	last[field.paths.last] = nameSearchRegExp;
	return {
		$or: [first, last],
	};
}

function getStringFilter (path, searchRegExp) {
	var filter = {};
	filter[path] = searchRegExp;
	return filter;
}

function addSearchToQuery (searchString,searchPath = null) {


	searchString = String(searchString || '').trim();
	var query = {};
	var searchFilters = [];
	if (!searchString) return query;

	if (this.options.searchUsesTextIndex) {
		console.log('Using text search index for value: "' + searchString + '"');
		searchFilters.push({
			$text: {
				$search: searchString,
			},
		});

		if (this.autokey) {
			var strictAutokeyFilter = {};
			var autokeyRegExp = new RegExp('^' + utils.escapeRegExp(searchString));
			strictAutokeyFilter[this.autokey.path] = autokeyRegExp;
			searchFilters.push(strictAutokeyFilter);
		}
	} else {
		debug('Using regular expression search for value: "' + searchString + '"');

    searchString=searchString.replace(/^,/, '');
    searchString=searchString.replace(/,$/, '');
    searchString=searchString.trim(',').replace(/,/g,'|')
		var searchRegExp = new RegExp(utils.escapeRegExp(searchString), 'i');

   // console.log('addSearchtoQ regexp',searchRegExp);

		searchFilters = this.searchFields.map(function (i) {
			console.log('i',i);
			if (i.field && i.field.type === 'name') {
				return getNameFilter(i.field, searchString);
			} else {
						console.log('search fields:::::',i.field.type);
						console.log('search path:::::',i.path);
						var path = ((searchPath !=null) && (i.path !=searchPath)) ? searchPath : i.path;
						console.log('using path',path);
				//override
				return getStringFilter(path, searchRegExp);
			}
		}, this);

		if (this.autokey) {
			var autokeyFilter = {};
			autokeyFilter[this.autokey.path] = searchRegExp;
			searchFilters.push(autokeyFilter);
		}
	}

	if (utils.isValidObjectId(searchString)) {
		searchFilters.push({
			_id: searchString,
		});
	}

	if (searchFilters.length > 1) {
		query.$or = searchFilters;
	} else if (searchFilters.length) {
		assign(query, searchFilters[0]);
	}

	console.log('Built search query for value: "' + searchString + '"', query);
	return query;
}

module.exports = addSearchToQuery;
