<?php
// function to perfome input validate
if(isset($_POST["type"])){
	if($_POST["type"]=="input"){
		if(isset($_POST["b1"])){
			if($_POST["b1"] == "easy")
				echo json_encode(array("b1",true,"Hello ".$_POST["b1"]));
			else
				echo json_encode(array("b1",false,"Failed, please try typing \"easy\""));
		}else if(isset($_POST["c1"])){
			if($_POST["c1"] == "easy")
				echo json_encode(array("c1",true,"Hello ".$_POST["c1"]));
			else
				echo json_encode(array("c1",false,"Failed, please try typing \"easy\""));
		}else if(isset($_POST["c2"])){
			if($_POST["c2"] < 100)
				echo json_encode(array("c2",true,"Ok"));
			else
				echo json_encode(array("c2",false,"Failed, age must < 100"));
		}
	}
	// function to perfome form validate
	else if($_POST["type"]=="form"){
		if(isset($_POST["c1"])){ // this is validate data from form C
			$a1 = array("c1",true,"Ok");
			$a2 = array("c2",true,"Exactly");

			if($_POST["c1"] != "tuan") $a1=array("c1",false,"Failed, please try typing \"tuan\"");
			if($_POST["c2"] != "handsome" ) $a2=array("c2",false,"Failed, tuan must be \"handsome\"!");
			echo json_encode(array($a1,$a2));
		}else if(isset($_POST["d1"])){ // this is validate data from form C
			$a1 = array("d1",true,"Ok");
			$a2 = array("d2",true,"nice email!");

			if($_POST["d1"] != "easy") $a1=array("d1",false,"Failed, please try typing \"easy\"");
			if($_POST["d2"] == "") $a2=array("d2",false,"Email must not be empty");
			
			echo json_encode(array($a1,$a2));
		}
	
	}
}else{
	echo " Hello, this is Example.php, your form has been submitted.";
	echo "</br></br> Welcome co Easy Validation Engine!";
}
		 