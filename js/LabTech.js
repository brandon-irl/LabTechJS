function LabTech(url, username, password) {
    this._url = url;
    this._username = username;
    this._password = password;
    var _this = this;
    this.buildConstants();
}

LabTech.prototype.buildConstants = function () {
    /* U R L S */
    this.Urls = this.Urls || {};
    this.Urls.API = "/WCC2/api/";
    this.Urls.Token = "/WCC2/api/APIToken";
    this.Urls.Clients = "/WCC2/api/Clients";
    this.Urls.Locations = "/WCC2/api/Locations";
    this.Urls.TicketStubs = "/WCC2/api/TicketStubs";
    this.Urls.Tickets = "/WCC2/api/Tickets";
    this.Urls.TicketTemplate = "/WCC2/Tickets/Detail";
    this.Urls.TicketData = "/WCC2/api/TicketData";
    this.Urls.TicketPriorities = "/WCC2/api/TicketPriorities";
    this.Urls.ClientStubs = "/WCC2/api/ClientStubs";
    this.Urls.ComputerStubs = "/WCC2/api/ComputerStubs";
    this.Urls.Computers = "/WCC2/api/Computers";
    this.Urls.Users = "/WCC2/api/Users";
    this.Urls.ScriptStubs = "/WCC2/api/ScriptStubs";
    this.Urls.ScriptFolders = "/WCC2/api/ScriptFolders";
    this.Urls.Commands = "/WCC2/api/Commands";
    this.Urls.Passwords = "/WCC2/api/Passwords";
    this.Urls.ProductKeys = "/WCC2/api/ProductKeys";
    this.Urls.Reports = "/WCC2/api/Reports";
    this.Urls.ReportFolders = "/WCC2/api/ReportFolders";
    this.Urls.ReportViewer = "/WCC2/ReportViewer.aspx";
    this.Urls.generateInstallPackage = "/Labtech/Deployment.aspx";
    this.Urls.Timers = "/WCC2/api/Timers";
    this.Urls.TimeCategories = "/WCC2/api/TimeCategories";
    this.Urls.PluginsApi = "/WCC2/api/Plugins";
    /*****************************************************************/

    /* P R O P E R T I E S */
    this.Props = this.Props || {};
    this.Props.Token = "";
    /*****************************************************************/

}

LabTech.prototype.buildRepositories = function (token) {

    this.Computers = new BaseRepository(this._url + this.Urls.Computers, "ComputerID", token);

    /* TODO: Add these as they are needed/tested
    this.Alerts = new AlertRepository();
    this.AutoStartups = new AutoStartups();
    this.AutoStartupsStubs = new BaseRepository(LabTech.Urls.AutoStartupsStubs);
    this.Clients = new ClientRepository();
    this.ClientStubs = new BaseRepository(LabTech.Urls.ClientStubs);
    this.CommandLookup = new BaseRepository(LabTech.Urls.CommandLookup);
    this.Commands = new CommandsRepository();
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
    */
}

LabTech.prototype.AssignToken = function(){
    var url = this._url + this.Urls.Token;
    var _this = this;
    return this.doPost(url, { "username": this._username, "password": this._password }).then(function (result) {
        result = result.replace(/^"(.*)"$/, '$1');  //Strip the " " from the beginning and end
        _this.Props.Token = result;
        _this.buildRepositories(result);
        return result;
    }, function (err) {
        console.log(err);
        return err;
    });
}

LabTech.prototype.doPost = function (url, postBody) {
    return new Promise(function (resolve, reject) {
        var req = new XMLHttpRequest();
        req.open("POST", url, true);
        req.setRequestHeader("Accept", "application/json;odata=verbose");
        req.setRequestHeader("Content-Type", "application/json");
        req.onload = function () {
            if (req.status == 200) {
                resolve(req.response);
            }
            else {
                reject(Error(req.response));
            }
        };
        req.onerror = function () {
            reject(Error("Network Error"));
        };
        req.send(JSON.stringify(postBody));
    });
};
