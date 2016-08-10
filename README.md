#taxi-driver fe workflow

###Done:

* css压缩,js压缩,路径替换以及打版本号
* image压缩和移位
* 静态服务器,PC和moblie同时预览(开发阶段使用相对路径)
* html文件的路径替换

###Todo:


* 代码规范
* log


###文件目录结构

```javascript
    |-----js
    |-----css
    |-----images
    |-----pages
    |-----src
    |   |----js
    |   |----css
    |   |----images
    |   |----pages
    |   |----rev(存放了所有文件的md5值)
```

##install

```javascript

     git clone  
     npm install
     npm install electron -g
     electron .

```

###Howto

1. 点击页面`添加`按钮添加文件， 可以选择文件夹或者具体某一个文件;
2. 点击`压缩`按钮，`app`将会完成`css`或`js`或`images`的压缩,生成`manifest.json`文件，以及输出到目标文件夹，压缩完毕后弹窗提示.
`gulp-imageMin`的压缩效果不理想，可以使用**tingpng**提供的API进行压缩;
3. 点击`MD5`按钮，弹窗显示需要替换的**源路径**和**目标路径**，输入路径后点击`确定`按钮，
`app`将会完成manifest.json替换html相对于静态文件的路径，压缩完毕后弹窗提示;
4. 点击`开发`按钮, 利用`browser-sync`启动本地服务器。
默认设置服务器根目录是`src/`,如果要调试具体页面,则输入相对于的html文件的路径,静态资料使用相对路径.

> 清除页面所用操作 `cmd+r`

---

![uiDemo](https://github.com/CommanderXL/td-feworkflow/raw/master/images/ui.png)
