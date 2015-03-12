//此程序可以大批量裁切指定目录里面的所有图片为您输入的尺寸，提前设置好参数之后，中间无需再手工操作，并可以按照原目录结构输出到你指定的文件夹里；
//使用前把你需要裁剪的图片（以jpg、png等静态图片格式为主）都统一放到一个文件夹里，除此之外，为避免程序出错，这个文件夹里不要放其他PS不支持的文件格式；
//需要注意的是你要确保裁剪的图片的核心内容都在图片的中心区（如果核心内容在图片边缘，会有被裁出的风险），因为程序会根据你输入的宽高参数最大化的在中心区裁剪，所以如果核心内容不在中心区，可以提前用PS把其先裁剪一下以使批处理后达到最佳效果；
//把此文件放到你电脑中的PS安装目录~\Adobe\Adobe Photoshop XX\Presets\Scripts下，然后打开/重启PS，通过菜单：文件>脚本>智能批量裁剪，点击即可运行；
//2015.03.09，李虎独立制作完成；
/*
<javascriptresource>
<name>智能批量裁剪v1.0</name>
<enableinfo>true</enableinfo>
</javascriptresource>
*/
#target photoshop
alert ("1，请提前把你要裁剪的原始素材都集中放到一个文件夹下;"+"\r"+"2，请确保该目录下不要放置PS不支持的文件格式，以免程序出错；"+"\r"+"3，程序的输入输出计算处理都以像素（px）为单位"+"\r"+"4，接下来请按照提示一步步操作即可;","温馨提示");
//保留PS单位预设
var startRulerUnits = app.preferences.rulerUnits
var startTypeUnits = app.preferences.typeUnits
var startDisplayDialogs = app.displayDialogs
//设置PS预设单位为PX
app.preferences.rulerUnits = Units.PIXELS
app.preferences.typeUnits = TypeUnits.PIXELS
app.displayDialogs = DialogModes.NO
//用户输入一些必要的参数
var inputPath = String(Folder.selectDialog("请选择要处理的文件路径"));
var inputPathLen = inputPath.length; //为下面拼接输出目录路径做准备
var isHandleSubfolder = confirm("是否处理该目录下子文件夹里的文件？" + "\r\r" + "提示：是：处理 ；否：不处理");
var outputPath = String(Folder.selectDialog("请选择要输出的文件路径"));
if (isHandleSubfolder) {
  var isSaveDirTree = confirm("输出文件时是否保持原目录结构？" + "\r\r" + "提示：是：保持 ；否：不保持");
};
var sampleW = parseInt(prompt("请问你要裁切成的图片的宽（width）是多少？(单位：px)", 300, "请输入"));
var sampleH = parseInt(prompt("请问你要裁切成的图片的高（height）是多少？(单位：px)", 300, "请输入"));
var jpegOptions = new JPEGSaveOptions();
var tmpJpegOptions = parseInt(prompt("请输入决定输出图片质量大小的参数（1~12）："+"\r\r"+"提示：数字越大，图片所占用的磁盘空间越大)", 12, "请输入"));
//为确保参数输入正确，这里做一下验证
while(tmpJpegOptions<1||tmpJpegOptions>12){
  tmpJpegOptions=parseInt(prompt("您输入的参数不在规定范围之内，请重新输入！"+"\r\r"+"提示：参数范围在1~12之间", 12, "请输入"));
};
jpegOptions.quality =tmpJpegOptions; 
//执行function
work(inputPath);
//恢复PS默认预设
app.preferences.rulerUnits = startRulerUnits
app.preferences.typeUnits = startTypeUnits
app.displayDialogs = startDisplayDialogs
//定义function
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
