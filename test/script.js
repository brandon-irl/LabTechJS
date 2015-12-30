/* Author: Brandon A.

*/

$("#executebutton").click(function () {
    var un = $("#uninput").val();
    var pw = $("#pwinput").val();
    var ep = $("#endpointinput").val();
    var success = function (response) { alert("Success! :" + response); };
    var error = function (response) { alert("Failure! :" + response); };
    var lt = new LabTech(ep, un, pw);
    lt.AssignToken().then(function(response){
        lt.Computers.GetAll().then(function (result) {
            success(result);
        });
    }).catch(function(err){
        error(err);
    });
});
