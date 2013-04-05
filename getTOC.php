<?php
define("SaveTOC", true);

if (!array_key_exists("jsessionid", $_GET) || !array_key_exists("userguid", $_GET) || !array_key_exists("userrole", $_GET))
	die(json_encode(array("error" => 1)));

$base = "http://www.classzone.com/cz/books/wh_survey05/secured/resources/applications/ebook/accessibility/patterns_survey";

function cookieCurl($address) {
   $cookieText  = "JSESSIONID={$_GET["jsessionid"]}; userGuid={$_GET["userguid"]}; userRole={$_GET["userrole"]}; ck_book_search_form=VT_&_null; ck_last_user_state=VT;";

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

   //open connection
   $ch = curl_init();

   //set the url, number of POST vars, POST data
   curl_setopt($ch, CURLOPT_URL, $address);
   curl_setopt($ch, CURLOPT_POST, count($postdata));
   curl_setopt($ch, CURLOPT_POSTFIELDS, $data_string);
   curl_setopt($ch, CURLOPT_COOKIE, $cookieText);

   curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);

   $result = curl_exec($ch);
   return $result;
}

//Interpret $result
//var linkTextArray = new Array("...", "...", ...)
//var linkPageArray = new Array("...", "...", ...)
function TOCdictionary($page, $depth = 1) {
	global $base;
	$result = cookieCurl("$base/$page");
	if (preg_match_all("/new Array\\(([^\\)]*)/", $result, $arrayMatches)) {
		$textArrayString = substr($arrayMatches[1][0], 1, -1); //Strip " "
		$textArray = explode("\",\"", $textArrayString);

		$linkArrayString = substr($arrayMatches[1][1], 1, -1); //Strip " "
		$linkArray = explode("\",\"", $linkArrayString);

		$subpages = array();
		if ($depth == 1) {

			for ($i = 0; $i < count($linkArray); $i ++) {
				$file = $linkArray[$i];
				$info = pathinfo($file);
				if ($info["extension"] == "html")
					$subpages[$i] = TOCdictionary($file, $depth ++);
			}
		}

		$dictionary = array("titles" => $textArray, "pages" => $linkArray, "error" => 0, "pages" => count($textArray), "subpages" => $subpages);
	}
	return $dictionary;
}

$result = "";
if (SaveTOC) {
	//Write it?
	if (!is_dir("./pdf"))
		mkdir("./pdf");

	$file = "./pdf/toc.dat";
	if (file_exists($file)) {
		$result = file_get_contents($file);
		die($result);
	} else {
		$result = TOCdictionary("toc.html");
		$result = json_encode($result);
		file_put_contents($file, $result);
		die($result);
	}
} else {
	$result = TOCdictionary("toc.html");
	$result = json_encode($result);
	die($result);
}

?>
