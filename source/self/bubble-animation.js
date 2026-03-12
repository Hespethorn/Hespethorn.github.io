/**
 * 气泡动画模块
 * 在页面头部显示气泡动画效果
 */
/*
 * @Author: tzy1997
 * @Date: 2020-12-15 20:55:25
 * @LastEditors: tzy1997
 * @LastEditTime: 2021-11-25 18:15:47
 */

/**
 * 气泡动画插件
 */
(function($) {
  /**
   * 气泡动画插件
   * @param {Object} options - 配置选项
   * @returns {jQuery} jQuery对象
   */
  $.fn.circleMagic = function(options) {
    // 默认配置
    const defaults = {
      color: 'rgba(255, 0, 0, 0.5)',
      radius: 10,
      density: 0.3,
      clearOffset: 0.2
    };

    // 合并配置
    const settings = $.extend({}, defaults, options);
    const element = this[0];
    
    if (!element) {
      console.warn('CircleMagic: No element provided');
      return this;
    }

    let canvas, context, width, height, bubbles = [], isVisible = true;

    /**
     * 检查滚动状态
     */
    const checkScroll = () => {
      isVisible = !(document.body.scrollTop > height);
    };

    /**
     * 更新画布尺寸
     */
    const updateSize = () => {
      const clientHeight = element.clientHeight;
      const windowHeight = $(window).height();
      const windowWidth = $(window).width();
      
      // 检查是否存在视频元素
      if ($('#index-video').length > 0 && windowWidth > 768) {
        height = windowHeight * 0.8;
      } else {
        height = clientHeight;
      }
      
      width = element.clientWidth;
      element.style.height = `${height}px`;
      
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    /**
     * 绘制气泡
     */
    const draw = () => {
      if (isVisible && context) {
        context.clearRect(0, 0, width, height);
        bubbles.forEach(bubble => bubble.draw());
      }
      requestAnimationFrame(draw);
    };

    /**
     * 气泡类
     */
    class Bubble {
      constructor() {
        this.pos = {};
        this.reset();
      }

      /**
       * 重置气泡状态
       */
      reset() {
        this.pos.x = Math.random() * width;
        this.pos.y = height + 100 * Math.random();
        this.alpha = 0.1 + Math.random() * settings.clearOffset;
        this.scale = 0.1 + 0.3 * Math.random();
        this.speed = Math.random();
        
        if (settings.color === 'random') {
          this.color = `rgba(${Math.floor(255 * Math.random())}, ${Math.floor(0 * Math.random())}, ${Math.floor(0 * Math.random())}, ${Math.random().toPrecision(2)})`;
        } else {
          this.color = settings.color;
        }
      }

      /**
       * 绘制气泡
       */
      draw() {
        if (this.alpha <= 0) {
          this.reset();
        }
        
        this.pos.y -= this.speed;
        this.alpha -= 0.0005;
        
        if (context) {
          context.beginPath();
          context.arc(this.pos.x, this.pos.y, this.scale * settings.radius, 0, 2 * Math.PI, false);
          context.fillStyle = this.color;
          context.fill();
          context.closePath();
        }
      }
    }

    /**
     * 初始化画布
     */
    const initCanvas = () => {
      // 创建画布
      const canvasElement = document.createElement('canvas');
      canvasElement.id = 'canvas';
      canvasElement.style.top = '0';
      canvasElement.style.zIndex = '0';
      canvasElement.style.position = 'absolute';
      element.appendChild(canvasElement);
      element.style.overflow = 'hidden';
      
      canvas = document.getElementById('canvas');
      context = canvas.getContext('2d');
      
      updateSize();
      
      // 创建气泡
      for (let i = 0; i < width * settings.density; i++) {
        bubbles.push(new Bubble());
      }
      
      // 开始绘制
      draw();
    };

    // 初始化
    try {
      updateSize();
      initCanvas();
      
      // 添加事件监听器
      window.addEventListener('scroll', checkScroll, false);
      window.addEventListener('resize', updateSize, false);
    } catch (error) {
      console.error('CircleMagic initialization error:', error);
    }

    return this;
  };
})(jQuery);

/**
 * 初始化气泡动画
 */
$(document).ready(function() {
  try {
    // 应用气泡动画到页面头部
    $('#page-header').circleMagic({
      radius: 10,
      density: 0.2,
      color: 'rgba(255, 255, 255, 0.4)',
      clearOffset: 0.99
    });
  } catch (error) {
    console.error('Bubble animation initialization error:', error);
  }
});