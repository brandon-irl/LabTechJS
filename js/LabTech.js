var LabTech = (function () {

    /* U R L S */
    LabTech.Urls = LabTech.Urls || {};
    LabTech.Urls.API = "/WCC2/api/";
    Labte.Urls.Token = "/WCC2/api/APIToken";
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
    /*****************************************************************/

    /* P R O P E R T I E S */
    LabTech.Props = LabTech.Props || {};
    LabTech.Props.Token = "";
    /*****************************************************************/

    function LabTech(username, password) {
        this._username = username;
        this._password = password;

        this.Computers = new BaseRepository(LabTech.Urls.Computers);

        /* TODO: Add these back as they are needed/tested
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
       //TODO: NEXT
    }

})();