#taxi-driver fe workflow

###Done:

* css压缩,js压缩以及打版本号
* image压缩和移位
* 静态服务器,PC和moblie同时预览(开发阶段使用相对路径)
* html文件的路径替换

###Todo:


* 代码规范
* log


###文件目录结构

|-----js<br/>
|-----css<br/>
|-----images<br/>
|-----pages<br/>
|-----src<br/>
|&nbsp;&nbsp;&nbsp;&nbsp;|----js<br/>
|&nbsp;&nbsp;&nbsp;&nbsp;|----css<br/>
|&nbsp;&nbsp;&nbsp;&nbsp;|----images<br/>
|&nbsp;&nbsp;&nbsp;&nbsp;|----pages<br/>
|&nbsp;&nbsp;&nbsp;&nbsp;|----rev<br/>


###Howto

1. 点击页面“添加”按钮添加文件， 可以选择文件夹或者具体某一个文件;
2. 点击"压缩"按钮，app将会完成css或js或images的压缩,生成manifest.json文件，以及输出到目标文件夹，压缩完毕后弹窗提示(gulp-imageMin的压缩效果不理想，可以使用tingpng提交的API进行压缩);
3. 点击"MD5"按钮，app将会完成manifest.json替换html相对于静态文件的路径，压缩完毕后弹窗提示;
4. 点击“开发”按钮, 利用browser-sync启动本地服务器。默认设置服务器根目录是src/,如果要调试具体页面,则输入相对于的html文件的路径,静态资料使用相对路径.

! [demo ui] (./images/ui.png)