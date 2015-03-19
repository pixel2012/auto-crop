//此程序可以大批量裁切指定目录里面的所有图片为您输入的尺寸，提前设置好参数之后，中间无需再手工操作，并可以按照原目录结构输出到你指定的文件夹里；
//使用前把你需要裁剪的图片（以jpg、png等静态图片格式为主）都统一放到一个文件夹里，除此之外，为避免程序出错，这个文件夹里不要放其他PS不支持的文件格式；
//需要注意的是你要确保裁剪的图片的核心内容都在图片的中心区（如果核心内容在图片边缘，会有被裁出的风险），因为程序会根据你输入的宽高参数最大化的在中心区裁剪，所以如果核心内容不在中心区，可以提前用PS把其先裁剪一下以使批处理后达到最佳效果；
//把此文件放到你电脑中的PS安装目录X:\Program Files\Adobe\Adobe Photoshop XX\Presets\Scripts下，然后打开/重启PS，通过菜单：文件>脚本>智能批量裁剪，点击即可运行；
//2015.03.15，李虎独立制作完成；
/*
<javascriptresource>
<name>智能批量裁剪v2.5</name>
</javascriptresource>
*/
#target photoshop
var startRulerUnits = app.preferences.rulerUnits;
var startTypeUnits = app.preferences.typeUnits;
var startDisplayDialogs = app.displayDialogs;
app.preferences.rulerUnits = Units.PIXELS;
app.preferences.typeUnits = TypeUnits.PIXELS;
app.displayDialogs = DialogModes.NO;
res =
"dialog { text:'智能批量裁剪设置向导 v2.5', \
	input: Panel { orientation: 'column', alignChildren:'left', \
		text: '输入设置', \
		inputG1: Group { orientation: 'row', \
      st: StaticText { text:'文件路径:' }, \
      et: EditText {text:'', characters: 30 } \
      bp: Button { text:'浏览'}, \
		} \
	  inputG2:Group{ orientation: 'row',\
	    cb:Checkbox {text:'包含所有文件夹', value:false }, \
	  }\
	}, \
	output: Panel { orientation: 'column', alignChildren:'left',\
		text: '输出设置', \
		outputG1: Group { orientation: 'row', \
      st: StaticText { text:'存储路径:' }, \
      et: EditText { text:'',characters: 30 } \
      bp: Button { text:'浏览'}, \
		} \
	  outputG2: Group { orientation: 'row',\
			st1: StaticText { text:'裁切宽度:' }, \
			et1: EditText { text:'', characters:8 } \
    	st2: StaticText { text:'裁切高度:' }, \
			et2: EditText { text:'', characters:8 } \
    	st3: StaticText { text:'单位：px' }, \
		}\
	  outputG3: Group { orientation: 'row',\
			st1: StaticText { text:'图片质量:' }, \
			sl: Slider { minvalue:1, maxvalue:12, value:12 }, \
			st2: StaticText {text:'12',  } \
		} \
	  outputG4:Group{ orientation: 'row',\
	     cb1:Checkbox { text:'保持原目录结构', value:false }, \
       cb2:Checkbox { text:'用数字序列作为输出文件名', value:false }, \
		} \
	} \
  buttons: Group { orientation: 'row', alignment: 'center', \
		okBtn: Button { text:'开始执行', properties:{name:'ok'} }, \ } \
}";

win = new Window (res);

win.input.inputG1.bp.onClick=function(){
  win.input.inputG1.et.text=String(Folder.selectDialog("请选择文件路径"));
};

win.output.outputG1.bp.onClick=function(){
  win.output.outputG1.et.text=String(Folder.selectDialog("请选择文件路径"));
};
win.output.outputG3.sl.onChanging=function(){
  win.output.outputG3.st2.text=Math.floor(win.output.outputG3.sl.value);
};



win.buttons.okBtn.onClick=function(){
  //alert(isHandleSubfolder+","+isSaveDirTree);
  if(win.input.inputG1.et.text==""||win.input.inputG1.et.text=="null"){
    alert("文件路径不能为空！");
    return;
  };//end if
  if(win.output.outputG1.et.text==""||win.output.outputG1.et.text=="null"){
    alert("存储路径不能为空！");
    return;
  };//end if
  reg=/^[1-9][0-9]*$/;//正整数的正则匹配表达式
  if(Number(win.output.outputG2.et1.text.search(reg)==-1){
    alert("裁剪宽度不合法！");
    return;
  };//end if
  if(Number(win.output.outputG2.et2.text.search(reg)==-1){
    alert("裁剪高度不合法！");
    return;
  };//end if
 //alert(Number(win.output.outputG2.et1.text));
inputPath=win.input.inputG1.et.text;
inputPathLen = inputPath.length;
outputPath=win.output.outputG1.et.text;
sampleW = Number(win.output.outputG2.et1.text);
sampleH = Number(win.output.outputG2.et2.text);
isHandleSubfolder=win.input.inputG2.cb.value;
isSaveDirTree=win.output.outputG4.cb1.value;
isSeqName=win.output.outputG4.cb2.value;
jpegOptions = new JPEGSaveOptions();
jpegOptions.quality=win.output.outputG3.st2.text;
win.close ();
work(inputPath);
app.preferences.rulerUnits = startRulerUnits;
app.preferences.typeUnits = startTypeUnits;
app.displayDialogs = startDisplayDialogs;
alert("处理完成");
};//end onClick
win.center(); 
win.show();

function work(inputPath) {
    var samplesFolder = Folder(inputPath);
    var fileList = samplesFolder.getFiles(/\.(jpg|png|tif|)$/i);
    for (var i = 0; i < fileList.length; i++) {
      if (fileList[i] instanceof File) {
        var imgDoc = open(fileList[i]);
        crop(imgDoc);
        if (isSaveDirTree) {
          var newInputPath = fileList[i].path;
          var tempPath = outputPath + newInputPath.substr(inputPathLen);
          if (!Folder(tempPath).exists) {
            Folder(tempPath).create();
          }; //end if
          var newOutputPath = tempPath + "/" + rename(imgDoc,i);
        } else {
          var newOutputPath = outputPath + "/" + rename(imgDoc,i);
        };
        imgDoc.saveAs(new File(newOutputPath), jpegOptions);
        imgDoc.close(SaveOptions.DONOTSAVECHANGES);
      } else {
        if (isHandleSubfolder) {
          work(fileList[i]);
        }
      } //end if
    } //end for
  } //end function

function crop(imgDoc){
  var cropVal = 0;
  var rawW = imgDoc.width.value;
  var rawH = imgDoc.height.value;
  var cropVal = Math.floor((sampleW * rawH) / sampleH);
  if (cropVal <= rawW) {
     imgDoc.resizeCanvas(cropVal, rawH);
  } else {
     cropVal = Math.floor((sampleH * rawH) / sampleW);
     imgDoc.resizeCanvas(rawW, cropVal);
  }; //end if
  imgDoc.resizeImage(sampleW, sampleH);
}//end function

function rename(imgDoc,i){
  j+=1;
  if(isSeqName){
    if(isHandleSubfolder){
      return (i+1)+".jpg";
    }else{
      return j+".jpg"; 
    };
  }else{
    return imgDoc.name;
  };
}//end function
