# auto-crop

这是一个photoshop小插件，它可以根据用户设置的宽度和高度，按照其比例自动最大化的在中间区域批量裁剪图片，并且能够按照原目录结构输出文件。

使用说明：

1、此程序可以大批量裁切指定目录里面的所有图片为您输入的尺寸，提前设置好参数之后，中间无需再手工操作，并可以按照原目录结构输出到你指定的文件夹里；

2、使用前把你需要裁剪的图片（以jpg、png等静态图片格式为主）都统一放到一个文件夹里，除此之外，为避免程序出错，这个文件夹里不要放其他PS不支持的文件格式；

3、需要注意的是你要确保裁剪的图片的核心内容都在图片的中心区（如果核心内容在图片边缘，会有被裁出的风险），因为程序会根据你输入的宽高参数最大化的在中心区裁剪，所以如果核心内容不在中心区，可以提前用PS把其先裁剪一下以使批处理后达到最佳效果；

4、把此文件放到你电脑中的PS安装目录
X:\Program Files\Adobe\Adobe Photoshop XX\Presets\Scripts下，
然后打开/重启PS，通过菜单：文件>脚本>智能批量裁剪，点击即可运行；
