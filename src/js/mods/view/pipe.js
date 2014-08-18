/**
 * @fileoverview 数据管道 / 过滤器
 * @authors liangdong2 <liangdong2@staff.sina.com.cn>
 */
define('mods/view/pipe',function(require,exports,module){

	var $view = require('lib/mvc/view');
	var $tpl = require('lib/kit/util/template');
	var $mustache = require('lib/more/mustache');
	var $dataList = require('mods/view/datalist');
	var $tip = require('mods/dialog/tip');
	var $channel = require('mods/channel/global');

	var TPL = $tpl({
		box : [
			'<div class="pt10 pb10 bdb1 pipe">',
				'<div class="box header">',
					'<div class="fl">',
						'<span>名称：</span>',
						'<span data-role="name"></span>',
						'<span class="ml10" data-role="data-info"></span>',
					'</div>',
					'<div class="fr">',
						'<a class="button" data-role="pipe-toggle">显示配置</a>',
						'<a class="button" data-role="pipe-del">移除</a>',
						'<a class="button" data-role="pipe-refresh">刷新</a>',
					'</div>',
				'</div>',
				'<div class="conf" data-role="conf" style="display:none;">',
					'<div class="mb5">',
						'<a class="button" data-role="add-entry" title="入口数据将根据下面的代码格式，作为过滤器可访问的变量">添加入口数据</a>',
						'<a class="button" data-role="output-entry" title="将经过管道过滤的数据输出到控制台">输出到控制台</a>',
					'</div>',
					'<ul data-role="entries" class="entries mb10"></ul>',
					'<div class="code mb5">',
						'<textarea data-role="code" placeholder="请填入数据过滤代码"></textarea>',
					'</div>',
					'<div class="datalist" data-role="list"></div>',
				'</div>',
			'</div>'
		],
		entry : [
			'<li class="mb5">',
				'<span>',
					'var ',
					'<input type="text" name="name" value="" placeholder="变量名"/>',
					' = ',
					'<input type="text" name="path" value="" placeholder="选择数据"/>',
					' ;',
				'</span>',
				'<a data-role="remove-entry" title="删除" class="fr delete">-</a>',
			'</li>'
		]
	});

	var Pipe = $view.extend({
		defaults : {
			parent : null,
			model : null,
			template : TPL.box,
			events : {
				'[data-role="pipe-toggle"] tap' : 'toggleConf',
				'[data-role="add-entry"] tap' : 'addEntry',
				'[data-role="remove-entry"] tap' : 'removeEntry',
				'[data-role="output-entry"] tap' : 'outputEntry',
				'[data-role="pipe-refresh"] tap' : 'refresh'
			}
		},
		build : function(){
			var conf = this.conf;
			this.model = conf.model;
			this.insert();
			this.render();
			this.buildList();
		},
		insert : function(){
			var conf = this.conf;
			this.role('root').appendTo($(conf.parent));
		},
		setEvents : function(action){
			this.delegate(action);
			var proxy = this.proxy();
			var model = this.model;
			model[action]('change', proxy('render'));
		},
		toggleConf : function(){
			var button = this.role('pipe-toggle');
			var box = this.role('conf');
			if(box.css('display') === 'none'){
				box.show();
				button.html('隐藏配置');
			}else{
				box.hide();
				button.html('显示配置');
			}
		},
		refresh : function(){
			var model = this.model;
			var source = {};
			this.role('entries').find('li').each(function(){
				var li = $(this);
				var key = li.find('input[name="name"]').val();
				var value = li.find('input[name="path"]').val();
				if(key && value){
					source[key] = value;
				}
			});
			model.set('source', source);
		},
		outputEntry : function(){
			var model = this.model;
			if(!model.get('data')){
				model.compute();
			}
			console.log(model.get('data'));
		},
		addEntry : function(){
			var tpl = TPL.get('entry');
			$(tpl).appendTo(this.role('entries'));
		},
		removeEntry : function(evt){
			var target = $(evt.currentTarget);
			var li = target.parent();
			li.remove();
		},
		render : function(){
			var model = this.model;
			this.role('name').html(model.get('name'));
		},
		buildList : function(){
			var data = this.model.get('data');
			
			var count = 0;
			if($.isArray(data)){
				count = data.length;
			}else if($.isPlainObject(data)){
				count = Object.keys(data);
			}else{
				count = 1;
			}
			this.role('data-info').html('数据数量:' + count);

			if(this.list){
				this.list.update(data);
			}else{
				this.list = new $dataList({
					name : this.model.get('name'),
					parent : this.role('list'),
					data : data
				});
			}
		},
		destroy : function(){
			if(this.list){
				this.list.destroy();
				delete this.list;
			}
			this.role('root').remove();
			Pipe.superclass.destroy.apply(this,arguments);
		}
	});

	module.exports = Pipe;

});