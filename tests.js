function getInitialIconProperties()
{
	var docRef = app.activeDocument;
	var layers = docRef.layers;
	var targetLayer = layers["Targets"];
	var initLayer = layers["Initial Setup"];

	var settings = {};

	//everything above this line should be trimmed when
	//integrating it into the main script


	var curIcon,curTarget;
	for(var x=0,len=initLayer.pageItems.length;x<len;x++)
	{
		curIcon = initLayer.pageItems[x];
		curTarget = getCurTarget(curIcon);
	}

	function getCurTarget(item)
	{
		var curTarget,curSetting;
		for(var x=0,len=targetLayer.pageItems.length;x<len;x++)
		{
			curTarget = targetLayer.pageItems[x];
			if(intersects(item,curTarget))
			{

			}
		}
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