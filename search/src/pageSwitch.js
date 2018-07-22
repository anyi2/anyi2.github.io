(function($){

	/**
	 * 判断某个元素的css样式中是否存在transition属性
	 * 
	 * @param  {[type]} temp) {	})(document.createElement(PageSwitch)  临时创建的元素
	 * @return {[type]}       有则返回浏览器样式前缀，否则返回false
	 */
	var _prefix = (function(temp) {
		var aPrefix = ["webkit","Moz","o","ms"],
				 props = "";
		for (var i in aPrefix) {
			props = aPrefix[i] + "Transition";
			if (temp.style[props] !== undefined) {
				return "-" + aPrefix[i].toLowerCase() + "-";
			}
		}
	})(document.createElement(PageSwitch));

	/**
	 * [插件类]
	 */
	var PageSwitch = (function() {
		function PageSwitch(element, options) {
			this.settings = $.extend(true,$.fn.PageSwitch.defaults,options || {});
			this.element = element;
			this.init();
		}
		PageSwitch.prototype = {
			// 初始化插件，初始化dom结构，布局，分页及绑定事件
			init : function () {
				var me = this;
				me.selectors = me.settings.selectors;
				me.sections = me.element.find(me.selectors.sections);
				me.section = me.element.find(me.selectors.section);

				me.direction = me.settings.direction == "vertical" ? true : false;
				me.pagesCount = me.getPagesCount();
				me.index = (me.settings.index >= 0 && me.settings.index < me.pagesCount) ? me.settings.index : 0;

				me.canScroll = true;

				// 若为横屏
				if (!me.direction) {
					me._initLayout();
				}
				// 是否自动播放
				if (me.settings.autoPlay) {
					me.settings.loop = true;
					me.timer = null;
					me._autoPlay();
				}
				// 是否分页
				if (me.settings.pagination) {
					me._initPaging();
				}
			},

			// 获取滑动页面数量
			getPagesCount : function () {
				return this.section.length;
			},

			// 获取滑动的宽度（横屏）或高度（竖屏）
			switchLength : function () {
				return this.direction ? this.element.height() : this.element.width();
			},

			// 自动播放
			_autoPlay : function () {
				var me = this;
				function play() {
					me.timer = setTimeout(function() {
						me.next();
						play();
					},me.settings.interval);
				}
				play();
			},

			// 停止自动播放
			_stopPlay :  function() {
				clearTimeout(this.timer);
			},

			// 主要针对横屏情况进行页面布局
			_initLayout : function () {
				var me = this;
				var width = (me.pagesCount * 100) + "%",
						 cellWidth = (100/me.pagesCount).toFixed(2) + "%";
				 me.sections.width(width);
				 me.section.width(cellWidth).css("float","left");
			},

			// 实现分页的dom结构及css样式
			_initPaging : function () {
				var me = this,
						 pagesClass = me.selectors.pages.substring(1);// 去掉.
				me.activeClass = me.selectors.active.substring(1); // 去掉.
				var pageHtml = "<ul class='" + pagesClass + "'>";
				for (var i=0;i<me.pagesCount;i++) {
					pageHtml += "<li></li>";
				}
				pageHtml += "</ul>";
				me.element.append(pageHtml);
				// 给index的li添加active的class
				var pages = me.element.find(me.selectors.pages);
				me.pageItem = pages.find("li");
				me.pageItem.eq(me.index).addClass(me.activeClass);

				if (me.direction) {
					pages.addClass("vertical");
				} else {
					pages.addClass("horizontal");
				}

				me._initEvent();
			},

			// 初始化插件事件
			_initEvent : function () {
				var me = this;

				// 点击小圆点切换事件
				me.element.on('click', me.selectors.pages + " li",function() {
					me.index = $(this).index();
					me._scrollPage();
				});

				// 鼠标停留在小圆点上时，停止播放
				me.element.on('mouseover',me.selectors.pages + " li",function() {
					me._stopPlay();
				});

				// 鼠标从小圆点上移开时，开始播放
				me.element.on('mouseout',me.selectors.pages + " li",function() {
					me._autoPlay();
				});


				// 鼠标滚轮事件
				// firefox为DOMMouseScroll
				// 向下滚动时其他浏览器wheelDelta值为-120，firefox detail为3
				me.element.on('mousewheel DOMMouseScroll', function(e) {
					if(me.canScroll) {
						var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;
						// 向上滑动，不循环模式下非第一页或者循环模式下任何一页
						if (delta > 0 && (me.index && !me.settings.loop || me.settings.loop)) {
							me.prev();
						}
						// 向下滑动
						else if (delta < 0 && (me.index < (me.pagesCount - 1) && !me.settings.loop || 
							me.settings.loop)) {
							me.next();
						}
					}
				});

				// 绑定键盘事件
				if (me.settings.keyboard) {
					$(window).on('keydown',function(e) {
						var keyCode = e.keyCode;
						// 左键或者上键
						if (keyCode == 37 || keyCode == 38) {
							me.prev();
						} 
						// 右键或下键
						else if (keyCode == 39 || keyCode == 40) {
							me.next();
						}
					});
				}

				// 绑定resize事件
				$(window).resize(function() {
					var currentLength = me.switchLength(),
							 offset = me.settings.direction ? me.section.eq(me.index).offset().top : me.section.eq(me.index).offset().left;
					if (Math.abs(offset) > currentLength / 2 && me.index < (me.pagesCount-1)) {
						me.index ++;
					}
					if (me.index) {
						me._scrollPage();
					}
				});

				// 绑定transitionend事件
				me.sections.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend", function() {
					// 解锁
					me.canScroll = true;
					if (me.settings.callback && $.type(me.settings.callback) === 'function') {
						me.settings.callback();
					}
				});
			},

			// 向前滑动即上一页
			prev : function () {
				var me = this;
				if (me.index > 0) {
					me.index -- ;
				} else if (me.settings.loop) {
					me.index = me.pagesCount - 1;
				}
				me._scrollPage();
			},

			// 向后滑动即下一页
			next : function () {
				var me = this;
				if (me.index < me.pagesCount - 1) {
					me.index ++ ;
				} else if (me.settings.loop) {
					me.index = 0;
				}
				me._scrollPage();
			},

			// 滑动动画
			_scrollPage : function () {
				var me = this,
						 dest = me.section.eq(me.index).position(); // 相对父元素的偏移
				if (!dest) return;

				// 上锁
				me.canScroll = false; 

				// 支持transition的浏览器
				if (_prefix) {
					me.sections.css(_prefix+"transition","all "+me.settings.duration+"ms "+me.settings.easing);
					var translate = me.direction ? "translateY(-"+dest.top+"px)" : "translateX(-"+dest.left+"px)";
					me.sections.css(_prefix+"transform",translate);
				}
				// 不支持transition的浏览器
				else {
					var animateCss = me.direction ? {top:-dest.top} : {left: -dest.left};
					me.sections.animate(animateCss, me.settings.duration, function() {
						// 解锁
						me.canScroll = true;
						if (me.settings.callback && $.type(me.settings.callback) === 'function') {
							me.settings.callback();
						}
					});
				}

				if (me.settings.pagination) {
					me.pageItem.eq(me.index).addClass(me.activeClass).siblings("li").removeClass(me.activeClass);
				}
			}
		};
		return PageSwitch;
	})();

	/**
	 * [在jquery的原型下挂载我们的方法]
	 * @param {[type]} options [用户自定义参数]
	 */
	$.fn.PageSwitch = function (options) {
		return this.each(function() {
			var me = $(this),
					 // 将插件实例保持在对象的data属性中，实现单例模式
					 instance = me.data("PageSwitch");
			if (!instance) {
				instance = new PageSwitch(me,options);
				me.data("PageSwitch", instance);
			}
			// 调用插件的方法，如：$("div").PageSwitch("init")
			if ($.type(options) === 'string') return instance[options]();
		});
	}

	// 插件参数
	$.fn.PageSwitch.defaults = {
		selectors : {
			sections : ".sections",  // 容器
			section : ".section", // 每一页
			pages : ".pages", // 小圆点
			active : ".active" // 当前激活页
		},
		index : 0, // 开始位置
		easing :  "ease",
		duration : 500, // 毫秒
		loop : false, // 是否循环播放，自动播放时该属性为true，设置无效
		pagination : true, // 是否分页处理,是否显示小圆点
		keyboard : true, // 是否支持键盘上下左右切换
		direction : "vertical", // 竖直或水平滑动
		autoPlay: true, // 自动播放
		interval: 3000, // 自动播放间隔
		callback :  "" // 切换动画结束后回调函数
	}

	// 获取页面上所有data-PageSwitch的元素来初始化
	$(function () {
		$("[data-PageSwitch]").PageSwitch();
	});
})(jQuery);