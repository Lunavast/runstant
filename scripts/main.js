
var $ = function(q) { return document.querySelector(q) };
var data = {};
var editor = null;

window.onload = function() {
	setup();
	run();
};


var setup = function() {
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");

    var command = {
        name: "run",
        bindKey: {
            mac: "Command-Enter",
            win: "Ctrl-Enter",
        },
        exec: function() {
            console.log("run");
            run();
        }
    };
    editor.commands.addCommand(command);

    var command = {
        name: "save",
        bindKey: {
            mac: "Command-S",
            win: "Ctrl-S",
        },
        exec: function() {
            console.log("save");
            save();
            run();
        }
    };
    editor.commands.addCommand(command);

    // 編集の度
    editor.getSession().on('change', function(e) {
    	var current = data.current;
    	data[current] = editor.getValue();
    	// console.log(e.type);
    });


    // デフォルト
    var html = null;

    load();

    var txt = data[data.current];
    editor.setValue(txt);

    editor.getSession().setMode("ace/mode/" + getType(data.current));

    // ボタンの設定
    var buttons = document.querySelectorAll(".code-button");
    var each = Array.prototype.forEach;

    each.call(buttons, function(button) {
	    button.onclick = function(e) {
	    	var key = this.innerHTML;
	    	
	    	data.current = key;

	    	editor.setValue(data[key]);
		    editor.getSession().setMode("ace/mode/" + getType(data.current));

		    return false;
	    };
    });

    $("#btn-run").onclick  = function() { run(); return false; };
    $("#btn-save").onclick = function() { save(); return false; };
};


var run = function() {
    var preview = document.querySelector("#preview");
    var iframe = document.createElement("iframe");

    preview.innerHTML = "";
    preview.appendChild(iframe);

    var idoc = iframe.contentDocument;
    var html = data.html;

    html = html.replace("{script}", data.js);
    html = html.replace("{style}", data.css);

    // console.log(html);

    idoc.open();
    idoc.write(html);
    idoc.close();
};


var save = function() {
	// object -> string -> encode uri -> btoa -> zip
	// ↓こっちにする
	// object -> json stringify -> btoa -> zip -> encode uri
    var html = editor.getValue();
    var dataString = encodeURI(JSON.stringify(data));

	location.hash = window.btoa(dataString);
};

var load = function() {
	// decode uri -> unzip -> atob -> json parse -> object
    if (location.hash) {
    	var dataString = window.atob(location.hash.substr(1));
    	data = JSON.parse(decodeURI(dataString));
    	html = data.html;
    }
    else {
    	data = {
			version: '0.0.1',
			current: 'js',
    		html: document.querySelector("#template").innerHTML.replace(/__script__/g, 'script'),
    		css: document.querySelector("#template-css").innerHTML,
    		js: document.querySelector("#template-js").innerHTML,
    	};
    }
};


var zip = function(data) {
	var zip = new JSZip();
	zip.file('data', data);

	return zip.generate();
};


var unzip = function(data) {
	var zip = new JSZip();
	var files = zip.load(data, {
		base64: true
	});

	return files.file('data').asText();
};

var getType = function(key) {
	return {
		'html': 'html',
		'css': 'css',
		'js': 'javascript',
	}[key];
};





