/*!
 * jQuery tableFilter Plugin - v1.1
 * Copyright (c) 2014 Lenon Mauer
 * Version: 1.1 (17-JUN-2015)
 * Under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 * Requires: jQuery v1.7.2 or later
 */
 
(function($) {

	var methods = {
	
		init : function(settings) {
		
			return this.each(function() {
			
				var configs = {

					// inputs que vão filtrar as tabelas

					'input' : {
						// Cria o input de filtro automaticamente
						create    : true,
						
						// Classe do input de filtro
						selector  : '.searchTableFilter',
						
						// CSS o input de filtro automaticamente
						css     : {}
					},

					'trigger': {
						
						"event" 			: "keyup", // Evento que vai chamar o a função de filtro nas tabelas
						'triggerElement' 	: undefined // Elemento que será aplicado o evento, undefined será o próprio input do filtro
					},

					// Compara os valores com trim
					'trim'      :  false,
					
					'sort'		: false, // Aplica a função de ordenação das linhas

					'caseSensitive'  :  false, // Filtro case sensitive
					
					'trCount'  :  false,  // Aplciar numero de linhas
					
					'callback'	:	function(){}
				};
				
				if(typeof(settings) === "object")
					$.extend(true, configs, settings);
				
				var $table = $(this);
				
				// Define o trigger que vai ser utilizado)
				
				switch(configs.trigger.event) {
					case 'keyup'    : break;
					case 'click'    : break;
					case 'keypress' : break;
					case 'change'   : break;
					case 'blur'     : break;
					default         : configs.trigger.event = 'keyup';
				}
				
				if(configs.input.create)
					$table.before("<input type=\"text\" class=\""+configs.input.selector.replace(".", "")+"\">");
	
				for(var index in configs.input.css) //Aplica o css definido nas configs
					$(configs.input.selector).css(index, configs.input.css[index]);				
				
				if(configs.trigger.element == undefined)
					configs.trigger.element = configs.input.selector;
					
				if(!$(configs.trigger.element).length)
					$.error('Trigger element not found.');

				/* Filtro das tabelas */

				$(configs.trigger.element).bind(configs.trigger.event, function() {

					filterTable.call(undefined, $table, configs);
				});

				// Configuração para o sort das tabelas
				if(configs.sort) {

					var ths = $table.find("th:not([data-tsort=disabled])");
					
					ths.append("&nbsp;<span class=\"caret\"></span>").attr("data-tsort", "desc");

					ths.css("cursor", "pointer").addClass("tfsort").bind("click", function() {
						
						sort.call(undefined, this)
					});
				}
				
				// Contador de linhas
				
				if(configs.trCount)
					trCount.call(undefined, $table);
			});
		},
	}
	
	var filterTable = function(table, configs) {
		
		var textFound;
		var tdText;
		var value = $(configs.input.selector).val() || $(configs.input.selector).text();
		var fadeTime = 1;

		if(configs.trim)
			value = value.trim();

		if(!configs.caseSensitive)
			value = value.toLowerCase();
		
		if(!value.length) {
			table.find('tbody tr').length ? table.show(fadeTime).find('tbody tr').show(fadeTime) : table.hide(fadeTime);
			setTimeout(configs.callback, fadeTime);
			
		} else {
			
			var count = table.find('tbody tr').length-1;
			
			table.find('tbody tr').each(function(ind) {
			
				if($(this).find("th").length)
					return true;

				textFound = false;
		
				$(this).find('td').each(function() {

					tdText = $(this).text();
				
					if(configs.trim)
						tdText = tdText.trim();
					
					if(!configs.caseSensitive)
						tdText = tdText.toLowerCase();

					if(tdText.indexOf(value) >= 0)
						textFound = true;
				});

				if(!textFound && $(this).is(":visible"))
					$(this).hide(fadeTime);
				else if(textFound && $(this).is(":hidden"))
					$(this).show(fadeTime);
				
				if(count == ind)
					setTimeout(configs.callback, fadeTime+30);
			});
		}
	}
	
	var trCount = function(table) {
		
		table.find('th').first().before("<th></th>");

		table.find('tbody tr').each(function(i) {
		
			$(this).find("td").first().before("<td>"+i+"</td>")
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

	$.fn.tableFilter = function(method) {

		if (methods[method])
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		else if(typeof method === 'object' || !method)
			return methods.init.apply(this, arguments);
		else
			$.error( 'the method ' +  method + ' does not exist on tableFilter' );
	};
})(jQuery);