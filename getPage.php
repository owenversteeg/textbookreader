<?php
define("SavePDF", true);

//Make sure we know it's a PDF
//header("Content-Type: application/pdf");


function formatPage($page) {
	$prefix = strtolower(substr($page, 0, 1));
	$intVal = intVal(substr($page, 1));
	if ($prefix === "r")
		return "R" . $intVal;
	if ($prefix === "c")
		return "cover";
	if ($prefix === "a")
		return "A" . $intVal;
	if ($prefix === "s")
		return "S" . $intVal;
	return intVal($page);
}

if (!array_key_exists("page", $_GET) || !array_key_exists("jsessionid", $_GET) || !array_key_exists("userguid", $_GET) || !array_key_exists("userrole", $_GET))
	die();

$page = formatPage($_GET["page"]);
$cachedFile = "./pdf/page{$page}.pdf";
if (SavePDF && file_exists($cachedFile)) {
	$pdffile = file_get_contents($cachedFile);

	$hash = md5($pdffile);
	$headers = getallheaders();
	if (isset($headers["If-None-Match"]) && (strtotime($headers["If-Modified-Since"]) == filemtime($cachedFile)))
		header("Last-Modified: " . date("D, d M Y H:i:s T", filemtime($cachedFile)), true, 304);
	else {
		header("Last-Modified: " . date("D, d M Y H:i:s T", filemtime($cachedFile)), true, 200);
		header("Content-Length: " . strlen($pdffile));
		header("Content-Type: application/pdf");
		header("Content-Disposition: inline; filename=\"page{$_GET["page"]}.pdf\"");

		echo($pdffile);
	}
	die();
}
$url = "http://www.classzone.com/cz/books/wh_survey05/secured/resources/applications/ebook/accessibility/patterns_survey/page_$page.pdf";
$postdata = array(
	"Host" => "www.classzone.com",
	"User-Agent" => $_SERVER["HTTP_USER_AGENT"],
	"Accept" => "*/*",
	"DNT" => "1",
	"Referer" => "http://www.classzone.com/");

$data_string = "";

//url-ify the data for the POST
foreach ($postdata as $key => $value)
	$data_string .= $key . '=' . $value . '&';
rtrim($data_string, '&');

$cookieText  = "JSESSIONID={$_GET["jsessionid"]}; userGuid={$_GET["userguid"]}; userRole={$_GET["userrole"]};";

header("Content-Type: application/pdf");

//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, count($postdata));
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($ch, CURLOPT_COOKIE, $cookieText);

if (SavePDF)
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

//execute post
$result = curl_exec($ch);

if (SavePDF) {
	//Write it?
	if (!is_dir("./pdf"))
		mkdir("./pdf");

	file_put_contents($cachedFile, $result);

	header("Last-Modified: " . date("D, d M Y H:i:s T", filemtime($cachedFile)), true, 200);
	header("Content-Disposition: inline; filename=\"page{$_GET["page"]}.pdf\"");

	echo($result);
}

?>
