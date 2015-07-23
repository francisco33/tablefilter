/*!
 * jQuery tableFilter Plugin - v1.0.0
 * Copyright (c) 2014 Lenon Mauer
 * Version: 1.0.0 (23-JUL-2015)
 * Under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 * Requires: jQuery v1.7.2 or later
 */
 
(function($) {

	var methods = {
	
		init : function(settings) {
		
			return this.each(function() {
			
				var configs = {

					// input que vãi filtrar as tabelas
					'input' : '.searchTableFilter',

					'trigger': {
						
						"event" 	: "keyup", // Evento que vai chamar o a função de filtro nas tabelas
						'element' 	: undefined // Elemento que será aplicado o evento, undefined será o próprio input do filtro
					},

					'trim'	: false,

					'caseSensitive'	:  false,
					
					'timeout'	: 300,
					
					'sort'	: false, // Aplica a função de ordenação das linhas

					'notFoundElement' : null,

					'callback'	:	function(){}
				};
				
				if(typeof(settings) === "object")
					$.extend(true, configs, settings);
				
				var $table = $(this);
				var $timeout = null;

				if(configs.trigger.element == undefined)
					configs.trigger.element = $(configs.input);
					
				if(!configs.trigger.element.length)
					$.error('Trigger element not found.');

				/* Filtro das tabelas */
				configs.trigger.element.bind(configs.trigger.event, function() {

					try {
						
						clearTimeout($timeout);
						
					} catch(err){}
		
					$timeout = setTimeout(function(){

						filterTable.call(undefined, $table, configs);
						
					}, configs.timeout);
				});

				// Configuração para o sort das tabelas
				if(configs.sort) {

					var ths = $table.find("th:not([data-tsort=disabled])");
					
					ths.append("&nbsp;<span class=\"caret\"></span>").attr("data-tsort", "desc");

					ths.css("cursor", "pointer").addClass("tfsort").bind("click", function() {
						
						sort.call(undefined, this)
					});
				}

				notFoundMessage($table, configs.notFoundElement);
			});
		},
	}
	
	var filterTable = function(table, configs) {

		var textFound;
		var tdText;
		var values = $(configs.input).val() || $(configs.input).text();
		var fadeTime = 1;
		var toHide = [];
		var toShow = [];

		values = values.trim().split(" ");

		if(configs.trim)
			values = values.map("trim");

		if(!configs.caseSensitive)
			values = values.map(function(val){return val.toLowerCase();});

		values.map(function(val, index){
			
			if(!val.trim().length)
				values.splice(index, 1);
		});

		if(!values.length) {
			
			toShow = table.find('tbody tr').toArray();

		} else {
			
			var count = table.find('tbody tr').length-1;
			
			table.find('tbody tr').each(function(ind) {
			
				if($(this).find("th").length)
					return true;

				var textFound = 0;
				var arrayText = []; // TD texts

				$(this).find('td:not([data-tfilter=disabled])').each(function() {

					if($(this).closest("table").find("thead th:nth-child("+($(this).parent().find("td").index($(this).get(0))+1)+")").attr("data-tfilter") == "disabled")
						return true;

					var tdText = $(this).text().trim();

					if(!tdText.length)
						return true;
					
					if(!configs.caseSensitive)
						tdText = tdText.toLowerCase();
					
					arrayText.push(tdText);
				});

				values.forEach(function(v){

					arrayText.every(function(t){

						if(t.indexOf(v) >= 0) {
							
							textFound++;
							return false;
						}
				
						return true;
					});
				});

				textFound = textFound == values.length;

				if(!textFound && $(this).is(":visible"))
					toHide.push(this);
				else if(textFound && $(this).is(":hidden"))
					toShow.push(this);
			});
		}

		if(toShow.length)
			toShow.push(table.get(0));

		$(toShow).show(fadeTime);
		$(toHide).hide(fadeTime);

		$(toShow.concat(toHide)).promise().done(function(){

			configs.callback.call();
			notFoundMessage(table, configs.notFoundElement);
		});
	}
	
	var sort = function(th) {
		
		th = $(th);

		var tds 	= th.closest("table").find("td:nth-child("+(th.parent().find("th").index(th.get(0))+1)+")");
		var array 	= [];

		/* Altera o sentido da ordenação */
		th.filter("[data-tsort=asc]").length ? th.attr("data-tsort", "desc") : th.attr("data-tsort", "asc");

		/* Altera o sentido da ordenação do ícone */
		th.attr("data-tsort") == "asc" ? $(th).find(".caret").css("transform", "rotate(0deg)") : $(th).find(".caret").css("transform", "rotate(180deg)");
		
		/* Copia as linhas para serem ordenadas */
		tds.each(function(a) {

			array[array.length] = {
				
				text: null,
				obj : $(this).closest("tr").clone(true, true)
			};

			var text;
			
			switch(th.attr("data-tsort-type")){
				
				case "number" : text = parseFloat($(this).text().replace(/[,]/g, ".").replace(/[^0-9\.\-]/g, ""));break;
				case "date" : try{text = new Date($(this).text()).getTime();}catch(err){text = 0};break;
				
				case "date-br" : 
				
					if($(this).text().match(/[0-9\/]+[\s]+[0-9]+[:]/g)) //Datetime
						text = ($(this).text().split(" ")[0].split("/").reverse().join("-"))+($(this).text().split(" ")[1]);
					else if($(this).text().match(/[0-9]{2}[\/]{1}[0-9]{2}[\/]{1}[0-9]{4}/g))
						text = $(this).text().split("/").reverse().join("-");
					else
						text = 0;
					
					text = new Date(text).getTime();
					break;
				
				default : text = $(this).text().toLowerCase();
			};
			
			array[array.length-1]["text"] = text;
			
			$(this).closest("tr").remove();
		});
		
		/* Ordena as linhas */
		
		for(var i=0; i< array.length; i++) {

			for(var i2=0; i2< array.length; i2++) {
		
				if((array[i].text < array[i2].text && th.attr("data-tsort") == "asc") || (array[i].text > array[i2].text && th.attr("data-tsort") == "desc")) {
				
					temp 		= array[i];
					array[i] 	= array[i2];
					array[i2] 	= temp;
				}
			}
		}
		
		/* Adiciona as linhas novamente na tabela */
		
		for(i=0; i< array.length; i++)
			$(th).closest("table").find("tbody").append(array[i].obj);
	}

	var notFoundMessage = function(table, notfound) {

		if(!notfound)
			return;

		table.find("tbody tr:visible").length ? $(notfound).hide(1) : $(notfound).show(1);

		if(!table.find("tbody tr:visible").length)
			$(table).hide(1);
	};

	$.fn.tableFilter = function(method) {

		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if(typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else
			$.error( 'the method ' +  method + ' does not exist on tableFilter' );
	};
})(jQuery);