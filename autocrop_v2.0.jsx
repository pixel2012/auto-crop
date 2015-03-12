//此程序可以大批量裁切指定目录里面的所有图片为您输入的尺寸，提前设置好参数之后，中间无需再手工操作，并可以按照原目录结构输出到你指定的文件夹里；
//使用前把你需要裁剪的图片（以jpg、png等静态图片格式为主）都统一放到一个文件夹里，除此之外，为避免程序出错，这个文件夹里不要放其他PS不支持的文件格式；
//需要注意的是你要确保裁剪的图片的核心内容都在图片的中心区（如果核心内容在图片边缘，会有被裁出的风险），因为程序会根据你输入的宽高参数最大化的在中心区裁剪，所以如果核心内容不在中心区，可以提前用PS把其先裁剪一下以使批处理后达到最佳效果；
//把此文件放到你电脑中的PS安装目录 X:\Program Files\Adobe\Adobe Photoshop XX\Presets\Scripts下，然后打开/重启PS，通过菜单：文件>脚本>智能批量裁剪v2.0，点击即可运行；
//2015.03.11，李虎独立制作完成；
/*
<javascriptresource>
<name>智能批量裁剪v2.0</name>
<enableinfo>true</enableinfo>
</javascriptresource>
*/
#target photoshop
//保留PS单位预设
var startRulerUnits = app.preferences.rulerUnits
var startTypeUnits = app.preferences.typeUnits
var startDisplayDialogs = app.displayDialogs
//设置PS预设单位为PX
app.preferences.rulerUnits = Units.PIXELS
app.preferences.typeUnits = TypeUnits.PIXELS
app.displayDialogs = DialogModes.NO
//用户输入一些必要的参数
//控件初始化，绘制窗口
var dlg = new Window("dialog", "智能批量裁剪设置向导 V2.0", [420,300,800,700]);
//绘制输入元素
dlg.inputPnl = dlg.add("panel", [10,10,370,100], "输入设置");
dlg.inputPnl.inputTitle=dlg.inputPnl.add("statictext",[14,20,70,50],"源文件夹：");
dlg.inputPnl.inputField=dlg.inputPnl.add("edittext",[80,20,290,40],"");
dlg.inputPnl.inputButton=dlg.inputPnl.add("button",[300,20,350,40],"浏览");
dlg.inputPnl.inputCheckbox=dlg.inputPnl.add("checkbox",[14,50,200,70],"包含所有子文件夹");
//绘制输出元素
dlg.outputPnl = dlg.add("panel", [10,120,370,320], "输出设置");
dlg.outputPnl.outTitle1 = dlg.outputPnl.add("statictext",[14,20,80,50],"目标文件夹：");
dlg.outputPnl.outputField1 = dlg.outputPnl.add("edittext",[90,20,290,40],"");
dlg.outputPnl.outputButton = dlg.outputPnl.add("button",[300,20,350,40],"浏览");
dlg.outputPnl.outTitle2 = dlg.outputPnl.add("statictext",[14,60,80,80],"裁剪宽度：");
dlg.outputPnl.outputField2 = dlg.outputPnl.add("edittext",[80,60,130,80],"");
dlg.outputPnl.outTitle3 = dlg.outputPnl.add("statictext",[144,60,200,80],"裁剪高度：");
dlg.outputPnl.outputField3 = dlg.outputPnl.add("edittext",[210,60,260,80],"");
dlg.outputPnl.outTitle4 = dlg.outputPnl.add("statictext",[280,62,360,80],"(单位：px)");
dlg.outputPnl.outCheckbox = dlg.outputPnl.add("checkbox",[14,100,200,120],"保持原目录结构输出");
dlg.outputPnl.outTitle5 = dlg.outputPnl.add("statictext",[14,140,90,160],"图片存储质量：");
dlg.outputPnl.outputSlider = dlg.outputPnl.add("slider",[110,140,290,160]);
dlg.outputPnl.outputField4 = dlg.outputPnl.add("edittext",[300,140,350,160],"12");
//绘制执行元素
dlg.run=dlg.add("button",[140,340,220,370],"开始执行");
//为控件添加事件
dlg.inputPnl.inputButton.onClick=function(){
  dlg.inputPnl.inputField.text=String(Folder.selectDialog("请选择要处理的文件路径"));
};
dlg.outputPnl.outputButton.onClick=function(){
  dlg.outputPnl.outputField1.text=String(Folder.selectDialog("请选择要处理的文件路径"));
};

dlg.outputPnl.outputSlider.minvalue = 1;
dlg.outputPnl.outputSlider.maxvalue = 12;
dlg.outputPnl.outputSlider.value = 12;

dlg.outputPnl.outputSlider.onChange=function(){
  dlg.outputPnl.outputField4.text = parseInt(dlg.outputPnl.outputSlider.value);
};
dlg.outputPnl.outputField4.onChanging=function(){
  if(dlg.outputPnl.outputField4.text<1){
     dlg.outputPnl.outputField4.text=1;
  }else if(dlg.outputPnl.outputField4.text>12){
    dlg.outputPnl.outputField4.text=12;
  }
  dlg.outputPnl.outputField4.text=parseInt(dlg.outputPnl.outputField4.text);
  dlg.outputPnl.outputSlider.value=dlg.outputPnl.outputField4.text;
};

dlg.run.onClick=function(){
    //参数验证
  if(dlg.inputPnl.inputField.text==""||dlg.inputPnl.inputField.text=="null"){
    alert("源文件夹不能为空或输入路径不正确！");
    return;
  };
   if(dlg.outputPnl.outputField1.text==""||dlg.outputPnl.outputField1.text=="null"){
    alert("目标文件夹不能为空或输入路径不正确！");
    return;
  };
  if(parseInt(dlg.outputPnl.outputField2.text)<=0||parseInt(dlg.outputPnl.outputField2.text)==NaN){
    alert("裁剪宽度不能为空或输入字符不是数字！");
    return;
  };
  if(dlg.outputPnl.outputField3.text<=0||dlg.outputPnl.outputField3.text==NaN){
    alert("裁剪高度不能为空或输入字符不是数字！");
    return;
  };
//定义裁剪所需的必要全局变量，
inputPath=dlg.inputPnl.inputField.text;
inputPathLen = inputPath.length; //为下面拼接输出目录路径做准备
isHandleSubfolder=dlg.inputPnl.inputCheckbox.value;
isSaveDirTree=dlg.outputPnl.outCheckbox.value;
outputPath=dlg.outputPnl.outputField1.text;
sampleW = parseInt(dlg.outputPnl.outputField2.text);
sampleH = parseInt(dlg.outputPnl.outputField3.text);
jpegOptions = new JPEGSaveOptions();
jpegOptions.quality=dlg.outputPnl.outputField4.text;
dlg.close ();
  //执行函数体
work(inputPath);
  //恢复PS默认预设
app.preferences.rulerUnits = startRulerUnits
app.preferences.typeUnits = startTypeUnits
app.displayDialogs = startDisplayDialogs
alert("处理完成");
};
dlg.show();
function work(inputPath) {
    //选中要处理目录里的所有对象
    var samplesFolder = Folder(inputPath);
    var fileList = samplesFolder.getFiles();
    //遍历它
    for (var i = 0; i < fileList.length; i++) {
      //分辨出文件夹和文件
      if (fileList[i] instanceof File) {
        //如果是文件，就打开它
        var imgDoc = open(fileList[i]);
        //执行裁剪程序
        var cropVal = 0; //初始化裁切最小值
        var rawW = imgDoc.width.value;
        var rawH = imgDoc.height.value;
        //假设原始素材的高为裁切矩形的最小值是合理的
        var cropVal = Math.floor((sampleW * rawH) / sampleH);
        //比较裁切矩形的宽是否超出原始素材的宽
        if (cropVal <= rawW) {
          //没有超出，假设成立
          imgDoc.resizeCanvas(cropVal, rawH);
        } else {
          //超出了，则假设不成立，那么原始素材的宽是裁切矩形的最小值是合理的，重新计算
          cropVal = Math.floor((sampleH * rawH) / sampleW);
          imgDoc.resizeCanvas(rawW, cropVal);
        }; //end if
        //应用图像大小命令使裁切后的图片为指定大小
        imgDoc.resizeImage(sampleW, sampleH);
        //裁剪结束
        //判断一下，如果用户要求保存原目录结构，则拼接出目录结构
        if (isSaveDirTree) {
          //得到打开的这个文件的路径
          var newInputPath = fileList[i].path;
          //拼接出和原目录结构的一样的路径
          var tempPath = outputPath + newInputPath.substr(inputPathLen);
          //判断输出目录是否有原目录中的子文件夹
          if (!Folder(tempPath).exists) {
            //如果没有则创建之
            Folder(tempPath).create();
          }; //end if
          //在拼接的路径中加入文件原始的名字
          var newOutputPath = tempPath + "/" + imgDoc.name;
        } else {
          //在拼接的路径中加入文件原始的名字
          var newOutputPath = outputPath + "/" + imgDoc.name;
        };
        //保存
        imgDoc.saveAs(new File(newOutputPath), jpegOptions);
        //关闭打开的文件
        imgDoc.close(SaveOptions.DONOTSAVECHANGES);
      } else {
        //如果用户要求处理目录下的子文件夹的文件，则再次执行work(),这里是一个递归函数
        if (isHandleSubfolder) {
          work(fileList[i]);
        }
      } //end if
    } //end for
  } //end function
