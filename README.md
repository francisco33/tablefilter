# tableFilter
Plugin jQuery para filtro e ordenação de linhas de tabelas
# Examples
See <a href="https://github.com/lenonmauer/tableFilter/tree/master/examples/">examples</a>.
# Basic Usage
<pre>
	<code>
		$(document).ready(function() {

			$('table[name=example-table]').tableFilter({
			
				input : {
				
					create 		: false,
					selector 	: "input[type=search]"
				},
				
				trigger : {
				
					event 	: "keyup",
				},

				sort : true,
				
				//trCount : true, 
				
				//caseSensitive : true,
				
				//trim      :  true,

				callback : function() { /* Callback após o filtro */
				
					console.log("filtering ...");
				}
				
			});
		});
	</code>
</pre>
