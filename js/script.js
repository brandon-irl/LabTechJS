/* Author: Brandon A.

*/

function LabTech(config){
    this.username = config.username;
    this.password = config.password;
    this.baseUrl = config.baseurl;
};

LabTech.prototype.isConfigured = function(){
   return (this.baseUrl != null && this.baseUrl != "" && this.token != null && this.token != "");

};

LabTech.prototype.getToken = function (error, success) {
    var path = 'APIToken';
    var url = this.baseUrl + path;
    this.doPost(url,{"username":this.username, "password":this.password}, error, success)
};

LabTech.prototype.AssignToken = function (error) {
    var success = function (response) {
        this.token = response;
        alert("assigned token: " + this.token);
    };
    this.getToken(error, success);
};

LabTech.prototype.getComputers = function (error, success) {
    if (!this.isConfigured()) {
        error("Not configured");
        return;
    }
    var path = 'Computers';
    var url = this.baseUrl + path;
    this.doRequest(url, error, success);
};

LabTech.prototype.doRequest = function (url, error, success) {
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = function () {
        if (req.status == 200) {
            success(req.response);
        }
        else {
            error(req.response);
        }
    };
    req.send();
};

LabTech.prototype.doPost = function (url, postBody, error, success) {
    var req = new XMLHttpRequest();
    req.open("POST", url, true);
    req.setRequestHeader("Accept", "application/json;odata=verbose");
    req.setRequestHeader("Content-Type", "application/json");
    req.onload = function () {
        if (req.status == 200) {
            success(req.response);
        }
        else {
            error(req.response);
        }
    };
    req.send(JSON.stringify(postBody));
};


$("#executebutton").click(function () {
    var un = $("#uninput").val();
    var pw = $("#pwinput").val();
    var ep = $("#endpointinput").val();
    var success = function (response) { alert("Success! " + response); };
    var error = function (response) { alert("Failure! " + response); };
    var lt = new LabTech({ "baseurl": ep, "username": un, "password": pw });
    lt.AssignToken(error);

});


