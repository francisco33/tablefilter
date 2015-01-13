/*!
 * jQuery tableFilter Plugin - v1.0
 * Copyright (c) 2014 Lenon Mauer
 * Version: 1.0 (13-JAN-2014)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * Requires: jQuery v1.7.2 or later
 * Updates:
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
					
					// Trigger que vai chamar o a função de filtro nas tabelas
					'trigger'        : 'change',
					
					// Elemento que receberá o trigger. O valor default indica que o elemento será o próprio input
					'triggerElement' : 'default',
					
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
				var $input;
				var triggerElement;
				
				// Define o trigger que vai ser utilizado)
				
				switch(configs.trigger) {
					case 'keyup'    : break;
					case 'click'    : break;
					case 'keypress' : break;
					case 'change'   : break;
					case 'blur'     : break;
					default         : configs.trigger = 'keyup';
				}
				
				if(configs.input.create)
					$table.before("<input type=\"text\" class=\""+configs.input.selector.replace(".", "")+"\">");
					
				$input = $(configs.input.selector);
				
				for(var index in configs.input.css)
					$input.css(index, configs.input.css[index]);				
				
				if(configs.triggerElement == 'default')
					triggerElement = $input;
				else
					triggerElement = $(configs.triggerElement);
					
				if(!triggerElement.length)
					$.error('Trigger element not found.');
					
				if(configs.trCount) {
				
					$table.find('th').first().before("<th>n&ordm;</th>");
					
					$table.find('tbody tr').each(function(i) {
					
						$(this).find("td").first().before("<td>"+i+"</td>")
					});
				}

				triggerElement.bind(configs.trigger, function() {

					var textFound;
					var tdText;
					var value = $(this).val() || $(this).text();					
						
					if(configs.trim)
						value = value.trim();
					
					if(!configs.caseSensitive)
						value = value.toLowerCase();
							
					if(!value.length) {
					
						$table.find('tbody tr').length ? $table.show().find('tbody tr').show() : $table.hide();
					}
					else {
						
						$table.find('tbody tr').each(function() {
						
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
								$(this).hide();
							else if(textFound && $(this).is(":hidden"))
								$(this).show();
						});
					}
					
					configs.callback.call();
				});
				
				if(configs.sort) {

					var ths = $table.find("th");
					
					ths.append("<span class=\"caret\"></span>&nbsp;");
					ths.attr("data-tsort", "desc");
						
					ths.css("cursor", "pointer").addClass("tfsort").bind("click", function() {

						var th  = $(this);

						var tds = th.closest("table tbody").find("td:nth-child("+(th.index()+1)+")");

						$(th).filter("[data-tsort=asc]").length ? $(th).attr("data-tsort", "desc") : $(th).attr("data-tsort", "asc");
					
						var array = Array();
						
						$(th).attr("data-tsort") == "asc" ? $(this).find(".caret").css("transform", "rotate(0deg)") : $(this).find(".caret").css("transform", "rotate(180deg)");
						
						tds.each(function(a) {
						
							array[array.length] = {
								
								text 	: $(this).text().toLowerCase(),
								obj 	: $(this).closest("tr").clone(true),
							};
							
							$(this).closest("tr").remove();
						});
						
						for(i=0; i< array.length; i++) {
						
							for(i2=0; i2< array.length; i2++) {
						
								if((array[i].text < array[i2].text && $(th).attr("data-tsort") == "asc") || (array[i].text > array[i2].text && $(th).attr("data-tsort") == "desc")) {
								
									temp 		= array[i];
									array[i] 	= array[i2];
									array[i2] 	= temp;
								}
							}
						}
						
						for(i=0; i< array.length; i++)
							$table.find("tbody").append(array[i].obj);
					});
				}
			});
		},
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