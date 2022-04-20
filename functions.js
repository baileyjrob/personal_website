var num = 0; // global variable

function button1() {
	num++;
	document.getElementById("output").innerHTML = "Press x"+num;
}