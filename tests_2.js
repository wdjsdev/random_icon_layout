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

		settings.push(curSetting);
	}

	function getCurOpacity(item)
	{
		return item.opacity;
	}

	function getCurFillColor(item)
	{
		var result,colorName;
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
getInitialIconProperties()