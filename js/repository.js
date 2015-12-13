function BaseRepository(url, idName, token) {
    if (typeof url !== 'string' || url.length === 0) {
        throw 'invalid url'
    }
    if (typeof idName === 'undefined') {
        idName = '';
    }
    if (typeof token !== 'string' || token.length === 0) {
        throw 'must have token';
    }
    this._url = url;
    this._idName = idName;
    this._token = token;

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
}

BaseRepository.prototype.GetByID = function (ID, subProperties) {
        
};

BaseRepository.prototype.GetPage = function (pageSettings) {

};

BaseRepository.prototype.GetCount = function (pageSettings) {

};

BaseRepository.prototype.GetAll = function (pageSettings) {
    var defaults = {
        sort: '',
        sortDir: '',
        filter: '',
        inlinecount: 'allpages',
        queryParameters: ''
    };
    return this.doRequest(this._url);
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

BaseRepository.prototype.doPost = function (url, postBody) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("POST", url, true);
        req.setRequestHeader("Accept", "application/json;odata=verbose");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "LTToken " + _this._token);
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(req.response);
            }
        };
        req.send(JSON.stringify(postBody));
    });
};

BaseRepository.prototype.doRequest = function (url) {
    var _this = this;
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open('GET', url, true);
        req.setRequestHeader("Accept", "application/json;odata=verbose");
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("Authorization", "LTToken " + _this._token);
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(req.response);
            }
        };
        req.send();
    });
};

/* EXTENSION REPOS */
var ClientRepository = function (_super) {
__extends(ClientRepository, _super);
function ClientRepository() {
    _super.call(this, LabTech.Urls.Clients, "ClientID");
    this.EntityReduction = function (entity) {
        if (typeof entity.ClientID !== "undefined") {
            return {
                ClientID: entity.ClientID,
                Name: entity.Name
            };
        }
        return entity;
    };
}
return ClientRepository;
}