(function($){
	$.fn.wizard = function(action) {
		var options = $.extend({}, $.fn.wizard.defaults, action);
		var args = arguments;
		
		return this.each(function() {
			var obj = $(this);
			var curStepIdx = options.selected;
			var steps = $(".b-wizard__steps a", obj);
			var contentWidth = 0;
			var loader,msgBox,elmActionBar,elmStepHolder,btNext,btPrevious,btFinish;
			
			elmActionBar = $('.b-wizard__actions',obj);
			if(elmActionBar.length === 0){
				elmActionBar = $('<div></div>').addClass("b-wizard__actions");                
			}

			msgBox = $('.msgBox',obj);
			if(msgBox.length === 0){
				msgBox = $('<div class="b-wizard__message"><div class="content"></div><a href="#" class="close">&times;</a></div>');
				elmActionBar.append(msgBox);                
			}
			
			$('.close',msgBox).click(function() {
					msgBox.fadeOut("normal");
					return false;
			});
			

			// Method calling logic
			if (!action || action === 'init' || typeof action === 'object') {
				init();
			}else if (action === 'showMessage') {
				//showMessage(Array.prototype.slice.call( args, 1 ));
				var ar =  Array.prototype.slice.call( args, 1 );
				showMessage(ar[0]);
				return true;
			}else if (action === 'setError') {
				var ar =  Array.prototype.slice.call( args, 1 );
				setError(ar[0].stepnum,ar[0].iserror);
				return true;
			} else {
				$.error( 'Method ' +  action + ' does not exist' );
			}
			
			function init() {
				var allDivs = obj.children('div');              
				obj.children('ul').addClass("anchor");
				allDivs.addClass("content");

				// Create Elements
				loader           = $('<div>Loading</div>').addClass("b-wizard__loader");
				elmActionBar     = $('<div></div>').addClass("b-wizard__actions");
				elmStepHolder    = $('<div></div>').addClass("b-wizard__holder");

				btNext           = $('<a>' + options.labelNext + '</a>')
										.attr("href", "#")
										.addClass("b-wizard__action btn-next-step");

				btPrevious       = $('<a>' + options.labelPrevious + '</a>')
										.attr("href", "#")
										.addClass("b-wizard__action btn-prev-step");

				btFinish         = $('<a>' + options.labelFinish + '</a>')
										.attr("href", "/store-cart.html")
										.addClass("b-wizard__action btn-last-step");
				
				// highlight steps with errors
				if(options.errorSteps && options.errorSteps.length>0){
					$.each(options.errorSteps, function(i, n){
						setError(n,true);
					});
				}


				elmStepHolder.append(allDivs);
				elmActionBar.append(loader);
				obj.append(elmStepHolder);
				obj.append(elmActionBar); 

				

				elmActionBar.append(btPrevious).append(btNext); 
				if (options.includeFinishButton) {
					elmActionBar.append(btFinish);
				}

				contentWidth = elmStepHolder.width();

				$(btNext).click(function() {
						if($(this).hasClass('btn-disabled')){
							return false;
						}
						doForwardProgress();
						return false;
				}); 
				$(btPrevious).click(function() {
						if($(this).hasClass('btn-disabled')){
							return false;
						}
						doBackwardProgress();
						return false;
				}); 
				$(btFinish).click(function() {
						if(!$(this).hasClass('btn-disabled')){
							 if($.isFunction(options.onFinish)) {
									if(!options.onFinish.call(this,$(steps))){
										return false;
									}
							 }else{
								 var frm = obj.parents('form');
								 if(frm && frm.length){
									 frm.submit();
								 }                         
							 }                      
						}

						return false;
				}); 
				
				$(steps).bind("click", function(e){
						if(steps.index(this) == curStepIdx){
							return false;                    
						}
						var nextStepIdx = steps.index(this);
						var isDone = steps.eq(nextStepIdx).attr("isDone") - 0;
						if(isDone == 1){
							LoadContent(nextStepIdx);                    
						}
						return false;
				}); 
				
				// Enable keyboard navigation                 
				if(options.keyNavigation){
					$(document).keyup(function(e){
						if(e.which == 39){ // Right Arrow
							doForwardProgress();
						}else if(e.which == 37){ // Left Arrow
							doBackwardProgress();
						}
					});
				}
				//  Prepare the steps
				prepareSteps();
				// Show the first slected step
				LoadContent(curStepIdx);                  
			}

			function prepareSteps(){
				if(!options.enableAllSteps){
					$(steps, obj).removeClass("selected").removeClass("done").addClass("disabled"); 
					$(steps, obj).attr("isDone",0);                 
				}else{
					$(steps, obj).removeClass("selected").removeClass("disabled").addClass("done"); 
					$(steps, obj).attr("isDone",1); 
				}

				$(steps, obj).each(function(i){
							$($(this).attr("href"), obj).hide();
							$(this).attr("rel",i+1);
				});
			}
			
			function LoadContent(stepIdx){
				var selStep = steps.eq(stepIdx);
				var ajaxurl = options.contentURL;
				var hasContent =  selStep.data('hasContent');
				stepNum = stepIdx+1;
				if(ajaxurl && ajaxurl.length>0){
					 if(options.contentCache && hasContent){
							 showStep(stepIdx);                          
					 }else{
						 $.ajax({
							url: ajaxurl,
							type: "POST",
							data: ({step_number : stepNum}),
							dataType: "text",
							beforeSend: function(){ loader.show(); },
							error: function(){loader.hide();},
							success: function(res){ 
								loader.hide();       
								if(res && res.length>0){  
									 selStep.data('hasContent',true);            
									 $($(selStep, obj).attr("href"), obj).html(res);
									 showStep(stepIdx);
								}
							}
						}); 
					}
				} else{
					showStep(stepIdx);
				}
			}
			
			function showStep(stepIdx){
					var selStep = steps.eq(stepIdx); 
					var curStep = steps.eq(curStepIdx);
					if(stepIdx != curStepIdx){
						if($.isFunction(options.onLeaveStep)) {
							if(!options.onLeaveStep.call(this,$(curStep))){
								return false;
							}
						}
					}     
					if (options.updateHeight)
							elmStepHolder.height($($(selStep, obj).attr("href"), obj).outerHeight());               
					if(options.transitionEffect == 'slide'){
						$($(curStep, obj).attr("href"), obj).slideUp("fast",function(e){
							$($(selStep, obj).attr("href"), obj).slideDown("fast");
							curStepIdx =  stepIdx;                        
							SetupStep(curStep,selStep);
						});
					} else if(options.transitionEffect == 'fade'){                      
						$($(curStep, obj).attr("href"), obj).fadeOut("fast",function(e){
							$($(selStep, obj).attr("href"), obj).fadeIn("fast");
							curStepIdx =  stepIdx;                        
							SetupStep(curStep,selStep);                           
						});                    
					} else if(options.transitionEffect == 'slideleft'){
						var nextElmLeft = 0;
						var curElementLeft = 0;
						if(stepIdx > curStepIdx){
							nextElmLeft1 = contentWidth + 10;
							nextElmLeft2 = 0;
							curElementLeft = 0 - $($(curStep, obj).attr("href"), obj).outerWidth();
						} else {
							nextElmLeft1 = 0 - $($(selStep, obj).attr("href"), obj).outerWidth() + 20;
							nextElmLeft2 = 0;
							curElementLeft = 10 + $($(curStep, obj).attr("href"), obj).outerWidth();
						}
						if(stepIdx == curStepIdx){
							nextElmLeft1 = $($(selStep, obj).attr("href"), obj).outerWidth() + 20;
							nextElmLeft2 = 0;
							curElementLeft = 0 - $($(curStep, obj).attr("href"), obj).outerWidth();                           
						}else{
							$($(curStep, obj).attr("href"), obj).animate({left:curElementLeft},"fast",function(e){
								$($(curStep, obj).attr("href"), obj).hide();
							});                       
						}

						$($(selStep, obj).attr("href"), obj).css("left",nextElmLeft1);
						$($(selStep, obj).attr("href"), obj).show();
						$($(selStep, obj).attr("href"), obj).animate({left:nextElmLeft2},"fast",function(e){
							curStepIdx =  stepIdx;                        
							SetupStep(curStep,selStep);                      
						});
					} else{
						$($(curStep, obj).attr("href"), obj).hide(); 
						$($(selStep, obj).attr("href"), obj).show();
						curStepIdx =  stepIdx;                        
						SetupStep(curStep,selStep);
					}
					return true;
			}
			
			function SetupStep(curStep,selStep){
				 $(curStep, obj).removeClass("selected");
				 $(curStep, obj).addClass("done");
				 
				 $(selStep, obj).removeClass("disabled");
				 $(selStep, obj).removeClass("done");
				 $(selStep, obj).addClass("selected");
				 $(selStep, obj).attr("isDone",1);
				 adjustButton();
				 if($.isFunction(options.onShowStep)) {
					if(!options.onShowStep.call(this,$(selStep))){
						return false;
					}
				 } 
			}                
			
			function doForwardProgress(){
				var nextStepIdx = curStepIdx + 1;
				if(steps.length <= nextStepIdx){
					if(!options.cycleSteps){
						return false;
					}                  
					nextStepIdx = 0;
				}
				LoadContent(nextStepIdx);
			}
			
			function doBackwardProgress(){
				var nextStepIdx = curStepIdx-1;
				if(0 > nextStepIdx){
					if(!options.cycleSteps){
						return false;
					}
					nextStepIdx = steps.length - 1;
				}
				LoadContent(nextStepIdx);
			}  
			
			function adjustButton(){
				if(!options.cycleSteps){                
					if(0 >= curStepIdx){
						$(btPrevious).addClass("btn-disabled");
					}else{
						$(btPrevious).removeClass("btn-disabled");
					}
					if((steps.length-1) <= curStepIdx){
						$(btNext).addClass("btn-disabled");
					}else{
						$(btNext).removeClass("btn-disabled");
					}
				}
				// Finish Button 
				if(!steps.hasClass('disabled') || options.enableFinishButton){
					$(btFinish).removeClass("btn-disabled");
				}else{
					$(btFinish).addClass("btn-disabled");
				}                  
			}
			
			function showMessage(msg){
				$('.content',msgBox).html(msg);
				msgBox.show();
			}
			
			function setError(stepnum,iserror){
				if(iserror){                    
					$(steps.eq(stepnum-1), obj).addClass('error')
				}else{
					$(steps.eq(stepnum-1), obj).removeClass("error");
				}                                   
			}                        
		});  
	};  

	// Default Properties
	$.fn.wizard.defaults = {
		selected: 0,
		keyNavigation: true,
		enableAllSteps: false,
		updateHeight: true,
		transitionEffect: 'fade', /* none/fade/slide/slideleft */
		contentURL:null,
		contentCache:true,
		cycleSteps: false,
		includeFinishButton: true,
		enableFinishButton: false,
		errorSteps:[],
		labelNext: 'Продолжить',
		labelPrevious: 'Назад',
		labelFinish: 'Отправить',   


		onLeaveStep: null,
		onShowStep: null,
		onFinish: null
	};    
		
})(jQuery);
