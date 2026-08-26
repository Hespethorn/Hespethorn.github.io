---

title: Python PIL库使用指南
tags:
  - Python
  - PIL
  - Pillow
  - 图像处理
categories: [Languages, Python]
series: [Python]
abbrlink: python-pil-library-guide
date: 2024-10-02

---

## 一、什么是PIL？

PIL（Python Imaging Library）是Python中最常用的图像处理库，它提供了丰富的图像处理功能，如打开、保存、调整大小、裁剪、旋转、滤镜等。PIL已经被Pillow库所取代，Pillow是PIL的一个分支，提供了更多的功能和更好的支持。

## 二、安装Pillow

```bash
pip install Pillow
```

## 三、基本操作

### 1. 打开和显示图像

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 显示图像
img.show()

# 查看图像信息
print(f"图像大小：{img.size}")
print(f"图像模式：{img.mode}")
print(f"图像格式：{img.format}")
```

### 2. 保存图像

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 保存为不同格式
img.save('image.png')
img.save('image.bmp')
```

### 3. 调整图像大小

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 调整大小
resized_img = img.resize((800, 600))

# 保存调整后的图像
resized_img.save('resized_image.jpg')
```

### 4. 裁剪图像

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 裁剪图像 (left, top, right, bottom)
cropped_img = img.crop((100, 100, 500, 400))

# 保存裁剪后的图像
cropped_img.save('cropped_image.jpg')
```

### 5. 旋转图像

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 旋转图像 (角度)
rotated_img = img.rotate(45)

# 保存旋转后的图像
rotated_img.save('rotated_image.jpg')
```

### 6. 翻转图像

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 水平翻转
horizontal_flip = img.transpose(Image.FLIP_LEFT_RIGHT)

# 垂直翻转
vertical_flip = img.transpose(Image.FLIP_TOP_BOTTOM)

# 保存翻转后的图像
horizontal_flip.save('horizontal_flip.jpg')
vertical_flip.save('vertical_flip.jpg')
```

## 四、高级操作

### 1. 应用滤镜

```python
from PIL import Image, ImageFilter

# 打开图像
img = Image.open('image.jpg')

# 应用模糊滤镜
blurred_img = img.filter(ImageFilter.BLUR)

# 应用边缘检测滤镜
edge_img = img.filter(ImageFilter.FIND_EDGES)

# 应用锐化滤镜
sharpened_img = img.filter(ImageFilter.SHARPEN)

# 保存滤镜效果
blurred_img.save('blurred_image.jpg')
edge_img.save('edge_image.jpg')
sharpened_img.save('sharpened_image.jpg')
```

### 2. 图像转换

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 转换为灰度图像
gray_img = img.convert('L')

# 转换为RGBA图像
rgba_img = img.convert('RGBA')

# 保存转换后的图像
gray_img.save('gray_image.jpg')
rgba_img.save('rgba_image.png')
```

### 3. 调整亮度和对比度

```python
from PIL import Image, ImageEnhance

# 打开图像
img = Image.open('image.jpg')

# 调整亮度
enhancer = ImageEnhance.Brightness(img)
bright_img = enhancer.enhance(1.5)  # 增加50%的亮度

# 调整对比度
enhancer = ImageEnhance.Contrast(img)
contrast_img = enhancer.enhance(1.5)  # 增加50%的对比度

# 调整饱和度
enhancer = ImageEnhance.Color(img)
saturation_img = enhancer.enhance(1.5)  # 增加50%的饱和度

# 保存调整后的图像
bright_img.save('bright_image.jpg')
contrast_img.save('contrast_image.jpg')
saturation_img.save('saturation_image.jpg')
```

### 4. 图像合成

```python
from PIL import Image

# 打开背景图像
background = Image.open('background.jpg')

# 打开前景图像
foreground = Image.open('foreground.png')

# 调整前景图像大小
foreground = foreground.resize((200, 200))

# 计算前景图像的位置
x = (background.width - foreground.width) // 2
y = (background.height - foreground.height) // 2

# 合成图像
background.paste(foreground, (x, y), foreground)  # 第三个参数是蒙版

# 保存合成后的图像
background.save('composite_image.jpg')
```

## 五、实际应用示例

### 1. 批量处理图像

```python
from PIL import Image
import os

# 输入和输出目录
input_dir = 'input_images'
output_dir = 'output_images'

# 创建输出目录
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 遍历输入目录中的所有图像
for filename in os.listdir(input_dir):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        # 打开图像
        img = Image.open(os.path.join(input_dir, filename))
        
        # 调整大小
        resized_img = img.resize((800, 600))
        
        # 转换为灰度
        gray_img = resized_img.convert('L')
        
        # 保存处理后的图像
        output_filename = os.path.splitext(filename)[0] + '_processed.jpg'
        gray_img.save(os.path.join(output_dir, output_filename))

print("批量处理完成")
```

### 2. 创建缩略图

```python
from PIL import Image

# 打开图像
img = Image.open('image.jpg')

# 创建缩略图(最大尺寸)
img.thumbnail((300, 300))

# 保存缩略图
img.save('thumbnail.jpg')
```
