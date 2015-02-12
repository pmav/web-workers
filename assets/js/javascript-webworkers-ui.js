/**
 * Firefox Web Workers Example v1.4.0
 *
 * http://pmav.eu/stuff/javascript-webworkers
 *
 * User interface code.
 *
 * pmav, 2009-2010
 */

var DATA = {
    currentTestSelected : -1,

    mod : 97777,
    
    tests : [
    {
        value: 256000000,
        display: "256M"
    },
    {
        value: 512000000,
        display: "512M"
    },
    {
        value: 1024000000,
        display: "1024M"
    },
    {
        value: 2048000000,
        display: "2048M"
    },
    {
        value: 4096000000,
        display: "4096M"
    },
    {
        value: 8192000000,
        display: "8192M"
    }
    ]
};

$(function(){

    var suportWebWorkers = function() {
        try {
            (new Worker("assets/js/javascript-webworkers-v1.4.0.js")).terminate();
            return true;
        } catch (e) {
            return false;
        }
    };

    var refreshValueWorkers = function(dom1, dom2) {
        $(dom1).html($(dom2).slider('option', 'value'));
    };

    var refreshValue = function(dom1, dom2) {
        var index = $(dom2).slider('option', 'value');
        $(dom1).html(DATA.tests[index].display);
        DATA.currentTestSelected = index;
    };

    $("#slider1").slider({
        min: 1,
        max: 24,
        value: 2,
        stop : function() {
            refreshValueWorkers("#webWorkersNumber", "#slider1");
            $("#webWorkersNumber2").html($("#slider1").slider('option', 'value')+" thread"+($("#slider1").slider('option', 'value') == 1 ? "" : "s"));
        }
    });

    $("#slider2").slider({
        min: 0,
        max: DATA.tests.length - 1,
        value: 2,
        stop: function() {
            refreshValue("#powerNumber", "#slider2");
        }
    });

    refreshValueWorkers("#webWorkersNumber", "#slider1");
    $("#webWorkersNumber2").html($("#slider1").slider('option', 'value')+" thread"+($("#slider1").slider('option', 'value') == 1 ? "" : "s"));
    refreshValue("#powerNumber", "#slider2");

    $("#runTest").bind("click", JQ.buttonRunClick);
    $("#runBenchmark").bind("click", JQ.buttonBenchmarkClick);

    if (!suportWebWorkers()) {
        $("#header").after("<div id=\"message\">This example will not work, you need a browser with Web Workers support (e.g.: <a href=\"http://www.mozilla.com/firefox/\" title=\"Firefox 3.5+\">Firefox 3.5+</a>, <a href=\"http://www.google.com/chrome\" title=\"Chrome 4+\">Chrome 4+</a>)");
    }

    JQ.enableButtons();

});

var JQ = {
    callback : function() {
        JQ.enableButtons();
    },

    buttonRunClick : function() {
        JQ.disableButtons();

        var workersNumber = parseInt(document.getElementById("webWorkersNumber").innerHTML, 10);
        var base = 2;
        var power = DATA.tests[DATA.currentTestSelected].value;
        var mod = DATA.mod;

        MAIN.run(workersNumber, base, power, mod);
    },

    buttonBenchmarkClick : function() {
        JQ.disableButtons();
        $("#benchmark-log").html(""+JQ.currentTime()+", Benchmarking, please wait...<br>"+$("#benchmark-log").html());
        MAIN.runBenchmark();
    },

    currentTime : function() {
        var date = new Date();
        return ((date.getHours() < 10 ? "0" : "") + date.getHours()) + ":" + ((date.getMinutes() < 10 ? "0" : "") + date.getMinutes())
    },

    enableButtons : function() {
        $("#runTest").removeAttr('disabled').bind("click", JQ.buttonRunClick);
        $("#runBenchmark").removeAttr('disabled').bind("click", JQ.buttonBenchmarkClick);
    },

    disableButtons : function() {
        $("#runTest").unbind("click", JQ.buttonRunClick).attr("disabled", "true");
        $("#runBenchmark").unbind("click", JQ.buttonBenchmarkClick).attr("disabled", "true");
    },

    show : function(objectId, eventObject) {
        if ($(objectId).is(':hidden')) {
            $(objectId).slideDown('slow');
            $(eventObject).html('hide');
        } else {
            $(objectId).slideUp('slow');
            $(eventObject).html('show');
        }
    }
}