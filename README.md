# tableFilter
Plugin jQuery para filtro e ordenação de linhas de tabelas
# Examples
See <a href="https://github.com/lenonmauer/tableFilter/tree/master/examples/">examples</a>.
# Basic Usage
<pre>
	<code>
		$(document).ready(function() {
		
			/* The filter is triggered when keyup is triggered on input[type=search] */

			$('table[name=example-table]').tableFilter({
			
				input : "input[type=search]",
				
				trigger : {
				
					event 	: "keyup",
				},

				sort : true, /* Add sort function */
				
				callback : function() {
	        
	            			console.log("filter ...");
	        		},

				notFoundElement : "[name=teste]"
			});
		});
	</code>
</pre>
