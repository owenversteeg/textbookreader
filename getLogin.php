<?php
//Make sure we know it's a JSON
header("Content-Type: application/json");

//Don't ever cache. Ever.
header("Cache-Control: no-cache, must-revalidate");
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");

if (!array_key_exists("username", $_GET) || !array_key_exists("password", $_GET))
	die(json_encode(array(
	    "error" => "missing_params",
	    "result" => null
	)));

$url = "http://www.classzone.com/cz/login.htm";
$postdata = array(
	"username" => $_GET["username"],
	"password" => $_GET["password"],
	"Submit" => "Submit",

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

//open connection
$ch = curl_init();

//set the url, number of POST vars, POST data
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_POST, count($postdata));
curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($ch, CURLOPT_HEADER, TRUE);

//execute post
$result = curl_exec($ch);

//Parse result
//see success.result.html and failure.result.html

//Check is whether or not the login succeeded
$check = !(preg_match("/color=\"red/", $result));

if ($check) {
	// get cookie
	preg_match('/^Set-Cookie: JSESSIONID=(.*?);/m', $result, $jsessionid);
	preg_match('/^Set-Cookie: userGuid=(.*?);/m',   $result, $userGuid);
	preg_match('/^Set-Cookie: userRole=(.*?);/m',   $result, $userRole);
//	$connection = mysql_connect("localhost", "root", "");
	die(json_encode(array(
	    	"error" => null,
	    	"result" => array(
	    	   "jsessionID" => $jsessionid[1],
	    	   "userGuid" => $userGuid[1],
	    	   "userRole" => $userRole[1]
	    	)
	   )));
} else
	die(json_encode(array(
	    "error" => "invalid_user_pass",
	    "result" => null
	)));

?>
