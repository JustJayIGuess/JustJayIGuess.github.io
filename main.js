function updateData(obj) {
    let file = obj.files[0];
    read = new FileReader();

    read.readAsBinaryString(file);

    read.onloadend = function() {
        console.log(read.result);
        // let script = document.createElement("script");
        // script.setAttribute("src", "sketch.js");
        // document.body.appendChild(script);
    }

}