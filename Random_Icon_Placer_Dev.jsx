function RandomIconPlacer()
{
	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var swatches = docRef.swatches;
	var exportDest = getExportDest();
	var epsDest,jpgDest;
	if(!exportDest)
	{
		return false;
	}


	var EPS_OPTS = new EPSSaveOptions();
		EPS_OPTS.saveMultipleArtboards = true;
		EPS_OPTS.artboardRange = "1";

	var JPG_OPTS = new ExportOptionsJPEG();
		JPG_OPTS.artBoardClipping = true;

	var iconLayer = layers["Icons"];
	var iconLength = iconLayer.pageItems.length;
	var targetLayer = layers["Targets"];
	var targetLength = targetLayer.pageItems.length;
	var exportLayer = layers["Export Layer"];


	//prompt the user for the number of random groups
	//and parse an integer out of the input
	var numOfOutputs = parseInt(prompt ("Enter the number of combinations needed","50 - 200"));

	if(!numOfOutputs)
	{
		alert("You must enter an integer.");
		return false;
	}

	//actually do the work
	for(var x=0,len=numOfOutputs;x<len;x++)
	{
		createRandomArrangement(x);
	}

	exportGroups();



	//
	//define the logic
	//

	function createRandomArrangement(seq)
	{
		var icons = getRandomIcons(targetLength);
		var dest = exportLayer.groupItems.add();
		dest.name = "Group_" + (seq + 1);
		var curIcon,curTarget;
		for(var x=0;x<targetLength;x++)
		{
			curIcon = icons[x].duplicate(dest);
			curTarget = targetLayer.pageItems[x];
			centerOnTarget(curIcon,curTarget);
		}
		dest.hidden = true;
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
		var scale = getScale(icon,target)
		icon.resize(scale,scale);
	}

	function getScale(icon,target)
	{
		var scale
		if(icon.width > icon.height)
		{
			scale = ((target.width * .65) / icon.width) * 100;
		}
		else
		{
			scale = ((target.height * .65) / icon.height) * 100;
		}
		return scale;
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
		epsDest = Folder(dest.fsName + "/EPS_Files/");
		jpgDest = Folder(dest.fsName + "/JPG_Files/");
		if(!epsDest.exists)
		{
			epsDest.create();
		}
		if(!jpgDest.exists)
		{
			jpgDest.create();
		}
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
		curGroup.hidden = false;
		var epsFile = File(epsDest + "/" + curGroup.name + ".eps");
		var jpgFile = File(jpgDest + "/" + curGroup.name + ".jpg");

		docRef.exportFile(jpgFile,ExportType.JPEG,JPG_OPTS);
		docRef.saveAs(epsFile,EPS_OPTS);
		curGroup.hidden = true;

	}


	// function generateRandomColors(numColors)
	// {
		
	// }
}
RandomIconPlacer();