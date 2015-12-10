define(['require',
'exports'], function (require, exports) {
    /// <reference path="../../Typescript Definitions/modernizr-2.6.d.ts" />
    /// <reference path="Models.d.ts" />
    /// <reference path="../../Typescript Definitions/jquery-1.8.d.ts" />
    var Repository = (function () {
        function Repository(url, cached, idName) {
            if (typeof cached === 'undefined') {
                cached = false;
            }
            if (typeof idName === 'undefined') {
                idName = '';
            }
            this._entityCache = [
            ];
            /**
                  * Reduces the size of entities returned from the server by removing unneeded
                  * properties. Reducing is only appropriate for entities that will NOT be sent
                  * back to the server. By default it simply returns the entity passed in.
                  * @param {number} indexInArray - The index of the entity in the array.
                  * @param {any} entity - The entity to reduce.
                  * @reutnrs {any} The reduced entity.
                  */
            this.EntityReduction = function (entity) {
                return entity;
            };
            if (typeof url !== 'string' || url.length === 0) {
                throw 'url is invalid';
            }
            this._url = url;
            this._useCache = cached;
            this._idName = idName;
            this._localStorageSupported = Modernizr.localstorage;
        }
        /**
            * Checks this repository's immediate cache for the specified data. If the
            * data isn't in the immediate cache, and the browser supports localStorage,
            * check localStorage for the data.
            * @param {number} ID - The identifier that refers to the data uniquely.
            * @returns {?any} The data retrieved from either the immediate or
            *     localStorage cache. Null if the data wasn't found from either location.
            */

        Repository.prototype.GetFromCache = function (ID) {
            // Check the immediate cache for the data.
            if (typeof this._entityCache[ID] !== 'undefined') {
                return this._entityCache[ID];
            } else if (this._localStorageSupported) {
                try {
                    var localStorageCachedEntity = JSON.parse(localStorage[this._url + '|' + ID]);
                } catch (e) {
                    return null;
                }
                if (typeof localStorageCachedEntity !== 'undefined') {
                    return localStorageCachedEntity;
                }
            }
            // If we got here, then we didn't find the ID in the cache.

            return null;
        };
        /**
            * Add the data to this repository's immediate cache and, if the browser
            * supports localStorage, convert the data to a JSON string, and add it to
            * the localStorage using a combination of this repository's url and the ID
            * of the data as the key.
            * @param {number} ID - The id that references the data uniquely.
            * @param {any} data - The data to be cached.
            */
        Repository.prototype.CacheEntity = function (ID, data) {
            this._entityCache[ID] = data;
            if (this._localStorageSupported) {
                localStorage[this._url + '|' + ID] = JSON.stringify(data);
            }
        };
        /**
            * Interate through the entries in data adding them to the cache using
            * CacheEntity with the property specified by idName as each entity's ID.
            * @param {any[]} data - An array of data to be cached.
            * @param {string} idName - Name of the parameter on each entry to use as ID.
            */
        Repository.prototype.CacheEntities = function (data, idName) {
            // First test that the data is formed as we expect
            if (data instanceof Array) {
                for (var i = 0; i < data.length; i++) {
                    this.CacheEntity(data[i][idName], data[i]);
                }
            }
        };
        /**
            * Get an entry by its unique ID number from either the cache, if enabled,
            * or the server.
            * @param {number} ID - The unique identifier of the data to retrieve.
            * @returns {jQuery.Promise} A Promise that will resolve() on the successful
            *     retrieval of the data, no matter if it's from the server or cache,
            *     or reject() on an error.
            */
        Repository.prototype.GetByID = function (ID, subProperties) {
            var _this = this;
            if (typeof subProperties === 'undefined') {
                subProperties = null;
            }
            // If using caching, check it for the data and return deferred if found.

            if (this._useCache) {
                var data = this.GetFromCache(ID);
                if (data !== null) {
                    return $.Deferred(function (defObject) {
                        defObject.resolve(data);
                    });
                }
            }
            var returnPromise = $.Deferred();
            var url = this._url + '(' + ID + ')?';
            if (subProperties) {
                url += this.GetExpandPropertiesUrl(subProperties);
            }
            // If we get here go to the server for the data.

            var promise = $.ajax({
                dataType: 'json',
                url: url,
                headers: {
                    'ACCEPT': 'application/json;odata.metadata=full'
                }
            }).done(function (data) {
                if (typeof data !== 'object') {
                    returnPromise.reject();
                }
                data.d = _this.EntityReduction(data);
                returnPromise.resolve(data.d);
            }).fail(returnPromise.reject);
            // If we're caching then cache the data returned when done.
            if (this._useCache) {
                promise.done(function (data) {
                    if (typeof data === 'object' && typeof data.d === 'object') {
                        _this.CacheEntity(ID, data.d);
                    }
                });
            }
            return returnPromise;
        };
        /**
            * Get a page worth of entries from the server.
            * Note: The cache will NOT be checked for the data, however the cache WILL
            * be updated with the retrieved data.
            * @param {Models.GetPageSettings} pageSettings - A set of key/value pairs
            *     that configure the page request. All settings are optional.
            */
        Repository.prototype.GetPage = function (pageSettings) {
            var _this = this;
            if (typeof pageSettings !== 'object' && typeof pageSettings !== 'undefined') {
                throw 'pageSettings is invalid';
            }
            var defaults = {
                pageNumber: 1,
                pageSize: null,
                sort: '',
                sortDir: '',
                filter: '',
                inlinecount: 'allpages',
                queryParameters: ''
            };
            pageSettings = $.extend({
            }, defaults, pageSettings);
            var returnPromise = $.Deferred();
            // Go to server for the data (no checking of the cache is implemented by design)
            // when it comes back change "odata.count" to recordCount and apply the
            // EntityReduction function to the entities then signal the completion
            // to the returned Promise passing the data.
            var promise = $.ajax({
                dataType: 'json',
                url: this.CreateParameterizedUrl(pageSettings),
                headers: {
                    'ACCEPT': 'application/json;odata.metadata=full'
                }
            }).done(function (data) {
                if (typeof data !== 'object' || typeof data.value !== 'object' || !(data.value instanceof Array)) {
                    returnPromise.reject();
                    return;
                }
                data.d = {
                };
                data.d.results = [
                ];
                if (typeof data['@odata.count'] !== 'undefined') {
                    data.d.recordCount = data['@odata.count'];
                }
                for (var i = 0; i < data.value.length; i++) {
                    data.d.results[i] = _this.EntityReduction(data.value[i]);
                }
                returnPromise.resolve(data.d);
            }).fail(returnPromise.reject);
            // If we're caching, then cache the data returned
            if (this._useCache) {
                returnPromise.done(function (data) {
                    if (typeof data === 'object' && typeof data.d === 'object' && data.d.results instanceof Array) {
                        _this.CacheEntities(data.d.results, _this._idName);
                    }
                });
            }
            return returnPromise;
        };
        Repository.prototype.GetCount = function (filter, queryParameters) {
            var returnPromise = $.Deferred();
            var counturl = this._url + '/$count?';
            if (filter != null) {
                counturl += '$filter=' + filter;
            }
            if (queryParameters != null) {
                counturl += '&' + queryParameters;
            }
            var promise = $.ajax({
                dataType: 'json',
                url: counturl,
                headers: {
                    'ACCEPT': 'application/json;odata.metadata=full'
                }
            }).done(function (data) {
                if (typeof data !== 'number') {
                    returnPromise.reject();
                    return;
                }
                returnPromise.resolve(data);
            }).fail(returnPromise.reject);
            return returnPromise;
        };
        Repository.prototype.GetAll = function (pageSettings) {
            var _this = this;
            if (typeof pageSettings !== 'object' && typeof pageSettings !== 'undefined') {
                throw 'pageSettings is invalid';
            }
            var defaults = {
                sort: '',
                sortDir: '',
                filter: '',
                inlinecount: 'allpages',
                queryParameters: ''
            };
            pageSettings = $.extend({
            }, defaults, pageSettings);
            pageSettings.pageNumber = 1;
            pageSettings.pageSize = null;
            // Go to server for the data (no checking of the cache is implemented by design)
            // when it comes back change "odata.count" to recordCount and apply the
            // EntityReduction function to the entities then signal the completion
            // to the returned Promise passing the data.
            var returnPromise = $.ajax({
                dataType: 'json',
                url: this.CreateParameterizedUrl(pageSettings),
                headers: {
                    'ACCEPT': 'application/json;odata.metadata=full'
                }
            }).then(function (data) {
                return _this.ProcessPage(data, new Object());
            });
            // If we're caching, then cache the data returned
            if (this._useCache) {
                returnPromise.done(function (data) {
                    if (typeof data === 'object' && typeof data.d === 'object' && data.d.results instanceof Array) {
                        _this.CacheEntities(data.d.results, _this._idName);
                    }
                });
            }
            return returnPromise;
        };
        Repository.prototype.ProcessPage = function (data, fullData) {
            var _this = this;
            var returnPromise = $.Deferred();
            if (typeof data !== 'object' || typeof data.value !== 'object' || !(data.value instanceof Array)) {
                returnPromise.reject();
                return;
            }
            if (typeof data['@odata.count'] !== 'undefined') {
                fullData.recordCount = data['@odata.count'];
            }
            if (typeof fullData.results == 'undefined') {
                fullData.results = new Array();
            }
            var currentCount = fullData.results.length;
            for (var i = 0; i < data.value.length; i++) {
                fullData.results[currentCount + i] = this.EntityReduction(data.value[i]);
            }
            if (typeof data['@odata.nextLink'] !== 'undefined') {
                return $.ajax({
                    dataType: 'json',
                    url: data['@odata.nextLink'],
                    headers: {
                        'ACCEPT': 'application/json;odata.metadata=full'
                    }
                }).then(function (data) {
                    return _this.ProcessPage(data, fullData);
                }).fail(returnPromise.reject);
            }
            returnPromise.resolve(fullData);
            return returnPromise;
        };
        Repository.prototype.CreateParameterizedUrl = function (pageSettings) {
            var odata = [
            ];
            if (pageSettings.filter !== '') {
                odata.push('$filter=' + pageSettings.filter);
            }
            if (pageSettings.inlinecount !== '') {
                if (pageSettings.inlinecount == 'allpages') {
                    odata.push('$count=true');
                } else {
                    odata.push('$inlinecount=' + pageSettings.inlinecount);
                }
            }
            if (pageSettings.pageSize != null && pageSettings.pageNumber > 0) {
                odata.push('$skip=' + pageSettings.pageSize * (pageSettings.pageNumber - 1));
                odata.push('$top=' + pageSettings.pageSize);
            }
            if (pageSettings.sort !== '') {
                odata.push('$orderby=' + pageSettings.sort + ' ' + pageSettings.sortDir);
            }
            if (pageSettings.queryParameters !== '') {
                odata.push(pageSettings.queryParameters);
            }
            var getUrl = this._url;
            if (odata.length > 0) {
                getUrl += '?' + odata.join('&');
            }
            return getUrl;
        };
        Repository.prototype.Expand = function (entities, keyPropertyName, targetPropertyName, pageSettings) {
            var _this = this;
            var promises = [
            ];
            if (typeof targetPropertyName === 'object') {
                pageSettings = targetPropertyName;
                targetPropertyName = void 0;
            }
            var defaults = {
                pageNumber: 1,
                pageSize: 0,
                sort: '',
                sortDir: '',
                filter: '',
                inlinecount: 'allpages',
                queryParameters: ''
            };
            pageSettings = $.extend({
            }, defaults, pageSettings);
            for (var a = 0; a < entities.length; a++) {
                (function (entity) {
                    // If a property isn't specified go through all properties looking for deferred
                    // to call expand on, pushing the returned promise onto our promise stack.
                    if (typeof targetPropertyName === 'undefined') {
                        for (var propertyName in entity) {
                            if (_this.IsDeferredProperty(entity, propertyName)) {
                                promises.push(_this.Expand([entity], keyPropertyName, propertyName, pageSettings));
                            }
                        }
                    } else {
                        // If the property on this entity isn't a deferred property move to the next one.
                        if (!_this.IsDeferredProperty(entity, targetPropertyName)) {
                            return;
                        }
                        // Construct url by getting all applicable odata query options then
                        // combining them with the base url.

                        var odata = [
                        ];
                        if (pageSettings.filter !== '') {
                            pageSettings.filter = pageSettings.filter.replace('\'', '\'\'');
                            odata.push('$filter=' + pageSettings.filter);
                        }
                        if (pageSettings.inlinecount !== '') {
                            url += '/$count';
                        }
                        if (pageSettings.pageSize > 0 && pageSettings.pageNumber > 0) {
                            odata.push('$skip=' + pageSettings.pageSize * (pageSettings.pageNumber - 1));
                            odata.push('$top=' + pageSettings.pageSize);
                        }
                        if (pageSettings.sort !== '') {
                            odata.push('$orderby=' + pageSettings.sort + ' ' + pageSettings.sortDir);
                        }
                        if (pageSettings.queryParameters !== '') {
                            odata.push(pageSettings.queryParameters);
                        }
                        var url = _this._url + '(' + entity[keyPropertyName] + ')/' + targetPropertyName;
                        if (odata.length > 0) {
                            url += '?' + odata.join('&');
                        }
                        var tmpPromise = $.Deferred();
                        promises.push(tmpPromise);
                        $.ajax({
                            url: url,
                            dataType: 'json',
                            headers: {
                                'ACCEPT': 'application/json;odata.metadata=full'
                            }
                        }).then(function (data) {
                            if (typeof data === 'object') {
                                if (data.value instanceof Array) {
                                    entity[targetPropertyName] = data.value;
                                } else {
                                    entity[targetPropertyName] = data;
                                }
                            }
                            tmpPromise.resolve();
                        }, function (jqXHR, textStatus, errorThrown) {
                            if (jqXHR.status === 404) {
                                tmpPromise.resolve();
                            } else {
                                tmpPromise.rejectWith(_this, [
                                  jqXHR,
                                  textStatus,
                                  errorThrown
                                ]);
                            }
                        });
                    }
                })(entities[a]);
            }
            return $.when.apply($, promises);
        };
        Repository.prototype.ExpandDown = function (entities, keyPropertyName, propertiesArray) {
            var _this = this;
            var promises = [
            ];
            //If there are no properties, we don't need to do anything TODO: we can make this robust by loop over each property and expanding it as necessary in this scenario
            if (propertiesArray === null || propertiesArray.length < 1)
                return $.when.apply($, promises);
            for (var a = 0; a < entities.length; a++) {
                (function (entity) {
                    var url = _this._url + '(' + entity[keyPropertyName] + ')?' + _this.GetExpandPropertiesUrl(propertiesArray);
                    var tmpPromise = $.Deferred();
                    promises.push(tmpPromise);
                    $.ajax({
                        url: url,
                        dataType: 'json',
                        headers: {
                            'ACCEPT': 'application/json'
                        }
                    }).then(function (data) {
                        if (typeof data === 'object') {
                            entity = data;
                        }
                        tmpPromise.resolve();
                    }, function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status === 404) {
                            tmpPromise.resolve();
                        } else {
                            tmpPromise.rejectWith(_this, [
                              jqXHR,
                              textStatus,
                              errorThrown
                            ]);
                        }
                    });
                })(entities[a]);
                return $.when.apply($, promises);
            }
        };
        Repository.prototype.GetExpandPropertiesUrl = function (propertyNameArray) {
            var _this = this;
            if (propertyNameArray === null || propertyNameArray.length < 1)
                return '';
            return '$expand=' + propertyNameArray.map(function (pn) {
                var x = _this.GetExpandPropertiesUrl(pn.subProperties);
                if (x.length < 1) {
                    return pn.propertyName;
                } else {
                    return pn.propertyName + '(' + x + ')';
                }
            }).join(',');
        };
        Repository.prototype.IsDeferredProperty = function (entity, propertyName) {
            if (typeof entity !== 'object') {
                throw 'Entity must be an object';
            }
            var propertyVal = entity[propertyName + '@odata.navigationLink'];
            return (typeof propertyVal !== undefined && typeof propertyVal === 'string');
        };
        return Repository;
    })();
    exports.Repository = Repository;
});

var LabTech = LabTech || {};
LabTech.Urls = LabTech.Urls || {};
LabTech.Props = LabTech.Props || {};

LabTech.Urls.API = "/WCC2/api/";
LabTech.Urls.Clients = "/WCC2/api/Clients";
LabTech.Urls.Locations = "/WCC2/api/Locations";
LabTech.Urls.TicketStubs = "/WCC2/api/TicketStubs";
LabTech.Urls.Tickets = "/WCC2/api/Tickets";
LabTech.Urls.TicketTemplate = "/WCC2/Tickets/Detail";
LabTech.Urls.TicketData = "/WCC2/api/TicketData";
LabTech.Urls.TicketPriorities = "/WCC2/api/TicketPriorities";
LabTech.Urls.ClientStubs = "/WCC2/api/ClientStubs";
LabTech.Urls.ComputerStubs = "/WCC2/api/ComputerStubs";
LabTech.Urls.Computers = "/WCC2/api/Computers";
LabTech.Urls.Users = "/WCC2/api/Users";
LabTech.Urls.ScriptStubs = "/WCC2/api/ScriptStubs";
LabTech.Urls.ScriptFolders = "/WCC2/api/ScriptFolders";
LabTech.Urls.Commands = "/WCC2/api/Commands";
LabTech.Urls.Passwords = "/WCC2/api/Passwords";
LabTech.Urls.ProductKeys = "/WCC2/api/ProductKeys";
LabTech.Urls.Reports = "/WCC2/api/Reports";
LabTech.Urls.ReportFolders = "/WCC2/api/ReportFolders";
LabTech.Urls.ReportViewer = "/WCC2/ReportViewer.aspx";
LabTech.Urls.generateInstallPackage = "/Labtech/Deployment.aspx";
LabTech.Urls.Timers = "/WCC2/api/Timers";
LabTech.Urls.TimeCategories = "/WCC2/api/TimeCategories";
LabTech.Urls.PluginsApi = "/WCC2/api/Plugins";

var BaseRepository = (function () {
    /*Constructor*/
    function BaseRepository(url) {
        if (typeof url !== 'string' || url.length === 0) {
            throw 'invalid url'
        }
    }

    BaseRepository.prototype.GetByID = function (ID, subProperties) {
        
    };

    BaseRepository.prototype.GetPage = function (pageSettings) {

    };

    BaseRepository.prototype.GetCount = function (pageSettings) {

    };

    BaseRepository.prototype.GetAll = function (pageSettings) {

    };

    BaseRepository.prototype.ProcessPage = function (data, fullData) {

    };

    BaseRepository.prototype.CreateParameterizedUrl = function (pageSettings) {

    };

    BaseRepository.prototype.Expand = function (entities, keyPropertyName, targetPropertyName, pageSettings) {

    };

    BaseRepository.prototype.ExpandDown = function (entities, keyPropertyName, propertiesArray) {

    };

    BaseRepository.prototype.GetExpandPropertiesUrl = function (propertyNameArray) {

    };

    BaseRepository.prototype.IsDefferedProperty = function (entity, propertyName) {

    };

    return BaseRepository;
})();
exports.BaseRepository = BaseRepository;

var Context = (function () {

    /* Constructor */
    function Context() {
        this.Alerts = new AlertRepository();
        this.AutoStartups = new AutoStartups();
        this.AutoStartupsStubs = new BaseRepository(LabTech.Urls.AutoStartupsStubs);
        this.Clients = new ClientRepository();
        this.ClientStubs = new BaseRepository(LabTech.Urls.ClientStubs);
        this.CommandLookup = new BaseRepository(LabTech.Urls.CommandLookup);
        this.Commands = new CommandsRepository();
        this.Computers = new ComputerRepository();
        this.ComputerStubs = new BaseRepository(LabTech.Urls.ComputerStubs);
        this.Contracts = new ContractsRepository();
        this.DriveStubs = new DriveStubsRepository();
        this.Hotfixes = new HotfixRepository();
        this.HotfixStubs = new BaseRepository(LabTech.Urls.HotfixStubs);
        this.Locations = new LocationRepository();
        this.Monitors = new MonitorRepository();
        this.Passwords = new PasswordRepository();
        this.Printers = new PrintersRepository();
        this.ProcessDefinitions - new ProcessDefinitionsRepository();
        this.Processes = new ProcessRepository();
        this.ProcessStubs = new BaseRepository(LabTech.Urls.ProcessStubs);
        this.ProductKeys = new ProductKeysRepository();
        this.ReportFolders = new ReportFoldersRepository();
        this.Reports = new ReportRepository();
        this.ScriptFolders = new ScriptFolderepository();
        this.ScriptHistoryStubs = new BaseRepository(LabTech.Urls.ScriptHistoryStubs);
        this.ScriptStubs = new BaseRepository(LabTech.Urls.ScriptStubs);
        this.Services = new ServiceRepository();
        this.Software = new SoftwareRepository();
        this.SoftwareStubs = new BaseRepository(LabTech.Urls.SoftwareStubs);
        this.TicketData = new TicketDataRepository();
        this.TicketPriorities = new BaseRepository(LabTech.Urls.TicketPriorities);
        this.Tickets = new BaseRepository(LabTech.Urls.Tickets);
        this.TicketStatuses = new BaseRepository(LabTech.Urls.TicketStatuses);
        this.TicketStubs = new BaseRepository(LabTech.Urls.TicketStubs);
        this.TicketCategories = new BaseRepository(LabTech.Urls.TicketCategories);
        this.Timers = new BaseRepository(LabTech.Urls.Timers);
        this.TimeSlips = new BaseRepository(LabTech.Urls.TimeSlips);
        this.UserPermissionsStubs = new UserPermissionsStubsRepository();
        this.Users = new UsersRepository();
    }

    var ClientsRepository = (function () { })();

    var ComputersRepository = (function () { })();

    var LocationsRepository = (function () { })();

    var TicketDataRepository = (function () { })();

    var TicketRepository = (function () { })();

    var ProcessesRepository = (function () { })();

    var UserPermissionsStubsRepository = (function () {
    })();


})();
exports.Context = Context;
