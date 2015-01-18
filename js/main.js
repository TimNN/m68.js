check_google_chrome();

document.addEventListener("DOMContentLoaded", function() {
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/assembly_m68");
    editor.getSession().setNewLineMode("windows");
    editor.focus();

    editor.commands.addCommand({
        name: "openFile",
        bindKey: {win: 'Ctrl-O', mac: 'Command-O'},
        exec: open_file
    });

    editor.commands.addCommand({
        name: "saveFile",
        bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
        exec: save_file
    })
});

function open_file(editor) {
    var input = document.getElementById("file_chooser");
    input.click();
    input.onchange = function(event) {
        if (event.target.files.length < 1) return;

        var file = event.target.files[0];

        var reader = new FileReader();

        reader.onload = function () {
            editor.setValue(reader.result, -1);
        };

        reader.readAsText(file, "utf8");

    };
}

function save_file(editor) {
    var data = new Blob([editor.getValue()]);
    var url = URL.createObjectURL(data);

    var filename = "";

    var files = document.getElementById("file_chooser").files;

    if (files.length > 0) {
        filename = files[0].name
    }

    var el = document.getElementById("file_dl");
    el.href = url;
    el.download = filename;
    el.click();
}

function check_google_chrome() {
    if(!(window.chrome !== null && window.chrome !== undefined && window.navigator.vendor === "Google Inc.")) {
        // is not Google chrome
        if (!localStorage.getItem("chrome-warned")) {
            alert("This Website was made for and tested with Google Chrome (on OS X and Windows). Other browsers may or may not work.");
            localStorage.setItem("chrome-warned", true);
        }
    }
}
