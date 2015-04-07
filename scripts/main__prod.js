var PKP = {};

PKP.init = function() {
	PKP.$window        = $(window);
	PKP.$document      = $(document);
	PKP.$body          = $('body');
	PKP.catalogData = [
		{title: "Компьютерная техника", folder: true,
			children: [
				{title: "Ноутбуки", selected: true},
				{title: "Моноблоки"},
				{title: "Планшеты"}
			]
		},
		{title:"Бытовая техника", folder: true, selected: true,
			children: [
				{title:"Стиральные машины", selected: true},
				{title:"Телевизоры", selected: true},
				{title:"Кухонная техника", selected: true},
				{title:"Пылесосы", selected: true}
			]
		},
		{title: "Телефоны и связь"},
		{title: "Фото и оптика", folder: true,
			children: [
				{title: "Фотоаппараты"},
				{title: "Объективы"},
				{title: "Средства и химия"}
			]
		},
		{title: "Одежда, обувь, аксессуары", folder: true, expanded: true,
			children:[
				{title:"Кроссовки"},
				{title:"Кеды", folder: true, expanded: true,
					children: [
						{title: "Ботильоны", selected: true},
						{title: "Босоножки", selected: true},
						{title: "Туфли", selected: true}
					]
				},
				{title:"Сандалии"},
				{title:"Балетки"},
				{title:"Сапоги"},
				{title:"Резиновая обувь"}
			]
		},
		{title: "Подарки и праздники", folder: true,
			children: [
				{title: "Цветы"},
				{title: "Открытки"},
				{title: "Игрушки"}
			]
		},
		{title: "Книги, учебники и журналы", folder: true,
			children: [
				{title: "Цветы"},
				{title: "Открытки"},
				{title: "Игрушки"}
			]
		},
		{title: "Мебель, интерьеры и обиход", folder: true,
			children: [
				{title: "Цветы", selected: true},
				{title: "Открытки", selected: true}
			]
		},
		{title: "Другое", folder: true, lazy: true }
	];
	PKP.sidebarState  = true;

	/* Консоль */
	PKP.IE.init();
	/* Включаем модули */
	PKP.UI.init();
	PKP.Video.init();
	PKP.Sliders.init();
	PKP.Forms.init();
	PKP.Responsive.init();

	PKP.$window.on('load resize', function() {
		PKP.windowHeight     = PKP.$window.height();
		PKP.windowWidth      = PKP.$window.width();
		PKP.windowScrollTop  = PKP.$window.scrollTop();
		PKP.windowScrollLeft = PKP.$window.scrollLeft();

		PKP.Responsive.reflow();
	});
};

PKP.Responsive = {
	init: function(){
		$('#toggleNav').on('click', function(){
			$(this).toggleClass('active');
			$('.menu.b-navigation').slideToggle(400);
		});
	},
	reflow: function() {
		var displ,
			state = (800 >= PKP.windowWidth) ? false : true;

		if(state) {
			displ = 'inline-block';
		} else {
			displ = 'none';

			if( $('#toggleNav').is('.active') ){
				displ = 'block';
			}
		}

		if($('section.store .b-catalog').length > 0) {
			PKP.UI.toggleSidebar(state);
		}
		
		$('.menu.b-navigation').css({'display':displ});
		
	}
};

/* Элементы интерфейса */
PKP.UI = {
	init: function() {
		PKP.UI.popup();
		PKP.UI.cart();
		PKP.UI.tree();
		PKP.UI.voting();
		PKP.UI.diagonalHover.init();
		PKP.UI.tooltip();
		PKP.UI.inputLabels();
		PKP.UI.passwords();
		PKP.UI.maskedInputs();
		PKP.UI.emulateShopping();
		PKP.UI.modal();

		/* Селекты */
		if(typeof($.fn.chosen) !== 'undefined') {
			$('select').chosen({
				disable_search_threshold: 6,
				width: '100%'
			});
		}


		/* Скрывалка */
		PKP.$body.on("click", '.collapse-trigger', function(e) {
			e.preventDefault();
			$('#' + $(this).data('target')).slideToggle();
		});

		/* «Выпадайка» */
		PKP.$body.on("click", '.accordeon__header', function(e) {
			e.preventDefault();
			var $this = $(this);
			
			$this
				.find('.accordeon__trigger')
				.toggleClass('active')
				.closest('.accordeon')
				.toggleClass('active')
				.find('.accordeon__content')
				.slideToggle(500)
			;
		});

		/* Сворачивалка */
		PKP.$body.on("click", '.slidedown__trigger', function(e) {
			e.preventDefault();
			var $this = $(this);
			$(this)
				.closest('.slidedown')
				.toggleClass('active')
				.find('.slidedown__content[data-target="' + $this.data('target') + '"]')
				.slideToggle(500);
		});

		/* «Выпадайка» */
		PKP.$body.on("click", '.dropdown__trigger', function(e) {
			e.preventDefault();
			var $this = $(this);

			if($this.is('.disabled')) {
				return false;
			}

			if(0 < $('.dropdown__trigger.active').length) {
				$('.dropdown__trigger.active')
					.not(this).removeClass('active')
					.closest('.dropdown')
					.find('.dropdown__content').addClass('hidden');   
			}
			
			$this
				.toggleClass('active')
				.closest('.dropdown')
				.find('.dropdown__content[data-target="' + $this.data('target') + '"]')
				.toggleClass('hidden');
		});

		/* Скрываем выпадайку по клику мимо неё */
		PKP.$document.click(function(e) {
			var $this = $(e.target);

			if($this.is('.dropdown__trigger')) {
				//
			} else {
				if(1 !== $this.parents().filter('.dropdown__content').length) {
					$('.dropdown__trigger.active').
						removeClass('active').
						siblings('.dropdown__content').addClass('hidden');
				}
			}
		});

		/* По клику на внутреннюю ссылку «выпадайка» закрывается */
		PKP.$body.on("click", '.dropdown__content a', function() {
			$(this).
				closest('.dropdown__content').toggleClass('hidden').
				siblings('.dropdown__trigger').toggleClass('active');
		});

		/* Табы */
		PKP.$body.on("click", '.tab__trigger', function() {
			var $this = $(this);
			$this
				.siblings()
					.removeClass('selected');
			$this
				.addClass('selected')
				.next()
					.addClass('selected');
		});

		/* Сортировка */
		PKP.$body.on("click", '.selector__options a', function() {
			var $this = $(this);
			$this
				.closest('.menu__item').addClass('active')
				.siblings().removeClass('active')
				.closest('.selector').find('.selector__current').text($this.text());
		});

		/* Радио-селектор */
		PKP.$body.on("click", '.radio-circles a', function() {
			$(this)
				.closest('.menu__item').addClass('active')
				.siblings().removeClass('active');
		});

		/* Баян-меню */
		$('.b-sidebar').on("click", '.with-submenu', function(e) {
			var $this = $(e.target);
			if(1 !== $this.parents().filter('.submenu').length) {
				$(this)
					.toggleClass('active')
					.children('.submenu').toggleClass('active');
			}
		});
		$('.b-advanced-search').on("click", '.with-submenu', function(e) {
			var $this = $(e.target);
			if(1 !== $this.parents().filter('.submenu').length) {
				$(this)
					.find('.b-tree__folder').toggleClass('b-tree__expanded');
				$(this)
					.children('.submenu').toggleClass('hidden');
			}
		});

		/* Кнопка-индикатор "Добавить в избранное" */
		PKP.$body.on("click", '.like_button span.pseudo-link', function() { 
			$(this)
				.closest('.like_button')
				.toggleClass('active');
		});


		/* Свернуть-развернуть сообщения */
		PKP.$body.on("click", '.b-chat .b-chat__item', function() { 
			$(this).toggleClass('closed');
		});

		PKP.$body.on("click", '#js-toggleChat', function() {
			var $this = $(this);

			if($this.is('.active')) {
				$('.b-chat__item')
					.not('.closed')
					.addClass('closed');
				$this
					.removeClass('active')
					.text("Развернуть всё");
			} else {
				$('.b-chat__item.closed')
					.removeClass('closed');
				$this
					.addClass('active')
					.text("Свернуть всё");
			}
		});

		

		/* Вспомогательное, для тестирования */
		$('#js-login, #js-logout').on('click', function() {
			var t = $(this).closest('.menu-login');
			t.find('.not-logged-in').toggleClass('hidden');
			t.find('.logged-in').toggleClass('hidden');
		});

		/* Снимаем класс ошибки при фокусе */
		$('input.error').on('focus', function() {
			$(this).removeClass('error');
			$(this).closest(".input-holder").find('.error__message').hide();
		});

		/* Переключение лэйаута */
		PKP.$body.on("click", '.catalog-layout a', function() {
			 PKP.UI.toggleCatalogView($(this).data('value'));
		});

		$('#js-nosidebar').on('click', function () {
			if(640 < PKP.windowWidth){
				PKP.UI.toggleSidebar(!PKP.sidebarState);
			}
		});
	},

	toggleCatalogView: function(mode){
		$('.b-catalog__items')
			.removeClass()
			.addClass('b-catalog__items ' + mode);
	},

	toggleSidebar: function(state){
		if(state === true) {
			$('aside.b-sidebar')
				.find('a.btn')
					.removeClass('dropdown__trigger')
				.siblings('.b-sidebar__dropdown')
					.removeClass('dropdown__content hidden');

			$('section.store').removeClass('nosidebar');
		} else {
			$('aside.b-sidebar')
				.find('a.btn')
					.addClass('dropdown__trigger')
				.siblings('.b-sidebar__dropdown')
					.addClass('dropdown__content hidden');

			$('section.store').addClass('nosidebar');
		}
		PKP.sidebarState = state;
	},

	/* Инициализация диагонального хавера */
	diagonalHover: {
		init: function() {
			PKP.Aim.init();
			PKP.$menu = $(".b-navigation.menu");
			PKP.$menu__item = false;

			PKP.$menu.aim({
				activate:   this.activateSubmenu,
				deactivate: this.deactivateSubmenu,
				exitMenu: 	this.exitMenu
			});
		},

		activateSubmenu: function(row) {
			var $this = $(row);
			// console.log('Открыть меню ' + $this.find('> a span').text());

			var submenu = PKP.$menu.find('.submenu.active');

			if($this.is('.with-submenu')) {
				submenu.removeClass('active');

				if(PKP.$menu.is('.menu--opened')){
					submenu.addClass('current');
				}

				$this.children('a').addClass('bordered').addClass("maintainHover");
				$this.children('.submenu').addClass('active');
				$('.submenu-bg').addClass('active');
			}
		},

		deactivateSubmenu: function(row) {
			var $this = $(row);
			// console.log('Закрыть меню ' + $this.find('> a span').text());

			$this.children('a').removeClass('bordered');

			if(PKP.$menu.find('.submenu.current').length > 0 ) {
				$this.children('.submenu').removeClass('active');
			}

			if(PKP.$menu.is('.menu--opened')) {
				PKP.$menu.find('.submenu.current').addClass('active').removeClass('current');
			} else {
				$this.children('.submenu').removeClass('active');
				$(".submenu-bg").removeClass('active');	
			}
		},

		exitMenu: function(row) {
			// console.log('Выход');

			if(PKP.$menu.is('.menu--opened')) {
				if(PKP.$menu.find('.submenu.current').length > 0) {
					PKP.$menu.find('.submenu.active').removeClass('active').siblings('a.bordered').removeClass();
					PKP.$menu.find('.submenu.current').removeClass('current').addClass('active');
				}
			} else {
				PKP.$menu.find('.submenu').removeClass('active').siblings('a.bordered').removeClass();
				$(".submenu-bg").removeClass('active');	
			}
		}
	},

	/* Вывод цены */
	formatNumber: function (number, dSeparator, fSeparator) {
		// Default digits & fraction separators
		if (!dSeparator) {
			dSeparator = '<i class="b-price__separator"></i>';
		}
		if (!fSeparator) {
			fSeparator = ',';
		}
	 
		var str 		= number.toString(),
			isNegative  = (number < 0),
			intLength 	= str.lastIndexOf('.'),
			output = '',
			cnt    = -1;

		intLength = (intLength > -1) ? intLength : str.length;
		output    = str.substring(intLength);

		if(intLength > 4) {
			for (var i = intLength; i > 0; i--) {
				cnt++;
				if (((cnt % 3) === 0 ) && (i !== intLength) && (!isNegative || (i > 1))) {
					output = dSeparator + output;
				}
				output = str.charAt(i - 1) + output;
			}
		} else {
			output = str;
		}

		return output.replace('.', fSeparator);
	},

	/* Выпадающий блок с корзиной */
	cart: function () {
		// Уменьшить
		$(".b-increment-group__darr").on('click', function() {
			var $this       = $(this),
				$tr   	    = $this.closest(".b-order-item"),
				$price 	    = $tr.find(".b-price__number"),
				$qty        = $tr.find(".b-increment-group__qty"),
				$total_sum  = $(".b-cart-menu__amount .b-price__number"),
				$cartQty    = $('.dropdown__trigger[data-target="cart"]').find('.circles-menu__num');

			var total_sum 	= Number( $total_sum.text() ),
				item_sum 	= Number( $price.text() ),
				num 		= Number( $qty.text() ),
				cartNum 	= Number( $cartQty.text() ),
				price 		= item_sum / num;

			$price.html(PKP.UI.formatNumber(item_sum - price));
			$total_sum.html(PKP.UI.formatNumber(total_sum - price));

			num -= 1;
			cartNum -= 1;

			if(num <= 1) {
				$this.addClass("invisible");
			}

			$qty.text(num);
			$cartQty.text(cartNum);
			return false;
		});

		// Увеличить
		$(".b-increment-group__uarr").on('click', function() {
			var $this 		= $(this),
				$tr   		= $this.closest(".b-order-item"),
				$price 	 	= $tr.find(".b-price__number"),
				$qty       	= $tr.find(".b-increment-group__qty"),
				$total_sum 	= $(".b-cart-menu__amount .b-price__number"),
				$cartQty    = $('.dropdown__trigger[data-target="cart"]').find('.circles-menu__num');


			var total_sum 	= Number( $total_sum.text() ),
				item_sum 	= Number( $price.text() ),
				num 		= Number( $qty.text() ),
				cartNum 	= Number( $cartQty.text() ),
				price 		= item_sum / num;

			$price.html(PKP.UI.formatNumber(item_sum + price));
			$total_sum.html(PKP.UI.formatNumber(total_sum + price));

			num += 1;
			cartNum += 1;

			if(num > 1) {
				$this.siblings(".b-increment-group__darr").removeClass("invisible");
			}
			$qty.text(num);
			$cartQty.text(cartNum);

			return false;
		});

		// Удалить
		$(".b-order-item__drop").on('click', function() {
			var $this = $(this),
				$tr   = $this.closest(".b-order-item"),
				$price 	 = $tr.find(".b-price__number"),
				$qty       	= $tr.find(".b-increment-group__qty"),
				$cartQty    = $('.dropdown__trigger[data-target="cart"]').find('.circles-menu__num');

			var $total_sum = $(".b-cart-menu__amount .b-price__number"),
				total_sum 		 = Number($total_sum.text()),
				item_sum 		 = Number($price.text());

			$total_sum.text(total_sum - item_sum);
			$cartQty.text(Number($cartQty.text()) - Number($qty.text()));

			$tr.fadeOut();
			setTimeout(function() {
				$tr.remove();

				if($(".b-cart-menu__goods li").length === 0) {
					var t = $('.dropdown__trigger[data-target="cart"]');
					t.trigger('click').addClass('disabled').find('.circles-menu__num').addClass('invisible');
				}
			}, 500);

			return false;
		});
	},

	/* Всплываюющие окна */
	popup: function() {
		// Форма "задать ворпос"
		$("#js-join, #js-addReview").click(function() {
			var request_form = $("#request_form");

			// Скрываем результаты отправки, если уже отправляли.
			// Показываем форму, если была скрыта
			request_form.find('.send_request_result').hide();
			request_form.find('#request_form_wrapper').show();

			request_form.show(); //.find("input").eq(0).focus();
			
			return false;
		});
		
		$("#js-close_request_form, #js-cancel-request").click(function() {
			$("#request_form").hide();
			return false;
		});
		
		// Отправка заявки
		$("#js-send-request").click(function() {
			var request_name  = $("#request_name"),
				request_email = $("#request_email"),
				request 	  = $("#request_text");

			if (request_name.val().length > 0 && request_email.val().length > 0) {
				
				$.ajax({
					type: 'POST',
					url: '/api',
					data: {
						name: request_name.val(), 
						email: request_email.val(),
						text: request.val()
					},
					success: function(result){
						if (result === 'success') {
							request.val('');
							request_name.val('');
							request_email.val('');
							
							$('#request_form_wrapper').hide();
							$("#send_request_success").show();
						} else {
							$("#send_request_fail").show();
						}
					},
					error: function (xhr, ajaxOptions, thrownError) {
						console.error(xhr.status);
						console.error(thrownError);
						$('#request_form_wrapper').hide();
						$("#send_request_fail").show();
					},
					dataType: 'html'
				});
			
			} else {
				request_name.focus(); // addClass('error');
			}

			return false;
		});
		
		// Предотвращаем закрытие окна при клике внутри него
		$(".popup").click(function(event){
			event.stopPropagation();
		});

		PKP.$body.click(function() {
			$("#request_form").hide();
		});
	},

	modal: function() {
		$('.open-modal').click(function() {
			openModal($(this).data('target'));
		});

		$('.modal .close-modal').click(function() {
			var modal = $(this).closest('.modal');

			modal
				.removeClass('in');

			PKP.$body.removeClass('modal-open');

		});

		PKP.$document.click(function(event) {
			if ( $(event.target).is('.modal')) {
				closeModal();
			}
		});

		function openModal(target) {
			$('#' + target).addClass('in');
			PKP.$body.addClass('modal-open');
		}

		function closeModal(target) {
			var modal = (typeof(target) === 'undefined') ? $('.modal') : $('#' + target);

			PKP.$body.removeClass('modal-open');
			modal.removeClass('in');
		}
	},

	/* Инициализация дерева с возможностью множественного выбора узлов */
	tree: function() {
		if (typeof ($.fn.fancytree) !== 'undefined') {
			$("#multilocation").fancytree({
				minExpandLevel: 1,
				rootVisible: false,
				checkbox: true,
				selectMode: 3,
				source: PKP.catalogData,
				icons: false,

				loadChildren: function(event, ctx) {
					// ctx.node.fixSelection3AfterClick();
				},

				select: function(event, data) {
					// Get a list of all selected nodes, and convert to a key array:
					var selKeys = $.map(data.tree.getSelectedNodes(), function(node) {
						return node.key;
					});

					// Get a list of all selected TOP nodes
					var selRootNodes = data.tree.getSelectedNodes(true);
					// console.log(selRootNodes.length);

					// ... and convert to a key array:
					var selRootKeys = $.map(selRootNodes, function(node) {
						return node.key;
					});
					$("#js-multilocation").removeClass('checked').addClass('part');
					if(data.tree.getSelectedNodes().length === 0) {
						$("#js-multilocation").removeClass('part');
					}
				},

				keydown: function(event, data) {
					if( event.which === 32 ) {
						data.node.toggleSelected();
						return false;
					}
				}
			});


			$("#js-multilocation").click(function() {
				var $this  = $(this),
					$tree  = $("#multilocation");
				var is_clr = ($this.is('.checked') || $this.is('.part')) ? false : true;
				

				$tree.fancytree("getTree").visit(function(node) {
					node.setSelected( is_clr );
				});

				$this.removeClass('part');

				if(is_clr) {
					$this.addClass('checked');
				}
				
				return false;
			});
		}
	},

	/* Инициализация контрола для установки рейтинга */
	voting: function() {
		var stars = $('ul.voting').find('a');

		stars.each(function(index) {
			$(this)
				.data('rating', index + 1)
				.on('click', function() {
					stars.removeClass('current');
					$(this).addClass('current');

					console.info('Получен рейтинг «' + $(this).data('rating') + '»');
				});
		});
	},

	/* Инициализация вплывающих подписей к полям формы */
	inputLabels: function() {
		$(":input:not(:checkbox):not(:button):not([type=hidden]):not([type=search]):not(.no-label):not(.b-increment-input__input)").floatlabel();
	},

	/* Контрол для сокрытия и показа введённого пароля */
	passwords: function() {
		if (typeof ($.fn.hidePassword) !== 'undefined') {
			$('input[type="password"]').hidePassword(true);
		} 
	},

	/* Всплывающие подсказки */
	tooltip: function() {
		// if (typeof ($.fn.tooltip) !== 'undefined') $('[data-tooltip]').tooltip();
	},

	/* Маска для ввода телефона */
	maskedInputs: function() {
		$('.masked-phone').mask("+7 ?999 999 99 99");
	},

	/* Анимация при добавлении в корзину */
	emulateShopping: function() {
		$('.b-item__order-button .btn').on('click', function() {
			var $this = $(this);
			var item = $this.closest('.b-item__popover');

			var x 	= item.offset().left,
				y  	= item.offset().top,
				tx 	= $('.menu-login').offset().left + 60;


			item
				.clone()
				.appendTo(PKP.$body)
				.addClass('hallucination')
				.css({
					position: 'absolute',
					left: x,
					top: y,
					zIndex: 999
				})
				.animate({
					opacity: 0.5,   
					left: tx,
					top: 0,
					width: 50,   
					height: 100
				}, 
					600, 
					function() {
						$(this).remove();  
					}
				);

			// $this.effect( "bounce", {times:3, distance:10}, 300 );
		});
	}
};

/* Валидация форм и инициализация "визардов" */
PKP.Forms = {
	init: function() {
		if(typeof ($.fn.suggestions) !== 'undefined') {
			PKP.Suggestions.init();
		}

		var progress = 0,
			canvas,
			circle;


		if($('#registerWizard').length > 0) {
			canvas = document.getElementById('progressCircle');

			circle = new ProgressCircle({
				canvas: canvas,
			});

			circle
				.addEntry({
					fillColor: '#ffa800',
					progressListener: function() {return progress;}
				})
				.start(30);

			$('#registerWizard').wizard({
				// Events
				onShowStep: function(obj) {
					var current = (Number(obj[0].rel) * 25) / 100,
						intervalId;

					if(progress < current) {
						intervalId = setInterval(function() {
							if(progress < current) {
								progress = progress + 0.015;
							} else {
								clearInterval(intervalId);
							}
							progress = (progress < current) ? progress + 0.015 : progress;
						}, 30);

					} else {
						intervalId = setInterval(function() {
							if(progress > current) {
								progress = progress - 0.015;
							} else {
								clearInterval(intervalId);
							}
						}, 30);
					}

					return true;
				}, 
				onFinish: function() {
					progress = 1;
					return true;
				}
			});
		}

		if($('#registerShopWizard').length > 0) {
			canvas = document.getElementById('progressCircle');

			circle = new ProgressCircle({
				canvas: canvas,
			});

			circle
				.addEntry({
					fillColor: '#ffa800',
					progressListener: function() {return progress;}
				})
				.start(30);

			$('#registerShopWizard').wizard({
				// Events
				onShowStep: function(obj) {
					var current = (Number(obj[0].rel) * 33.3333) / 100,
						intervalId;

					if(progress < current) {
						intervalId = setInterval(function() {
							if(progress < current) {
								progress = progress + 0.015;
							} else {
								clearInterval(intervalId);
							}
							progress = (progress < current) ? progress + 0.015 : progress;
						}, 30);

					} else {
						intervalId = setInterval(function() {
							if(progress > current) {
								progress = progress - 0.015;
							} else {
								clearInterval(intervalId);
							}
						}, 30);
					}

					return true;
				}, 
				onFinish: function() {
					progress = 1;
					return true;
				}
			});
		}

		if($('#orderWizard').length > 0) {
			$('#orderWizard').wizard({
				labelFinish: 'Подтверждаю'
			});
		}
		
		PKP.$body.on('click', '.b-order-table__item label', function() {
			var $this = $(this);

			$this.closest('tr').addClass('active').siblings().removeClass('active');
		});
	}
};

/* Инициализация видеоплеера */
PKP.Video = {
	init: function() {
		if($('#intro-video').length > 0) {
			var pkPlayer = videojs("intro-video", { 
				"width" : "100%",
				"height": "100%",
				"controls": true, 
				"autoplay": false, 
				"preload": "auto" 
			});

			$('#js-video').on('click',function () {
				PKP.$body.addClass('locked');
				$('.video-holder').fadeIn(400, function() {
					// pkPlayer.requestFullscreen();
					pkPlayer.play();
				});
			});

			$('#js-close-video').on('click',function () {
				$('.video-holder').fadeOut(400,function() {
					PKP.$body.removeClass('locked');
					pkPlayer.pause().currentTime(0);
				});
			});
		}
	}
};

/* Диагональный хавер */
PKP.Aim = {
	init: function() {
		var $this = this;
		$.fn.aim = function(opts) {
			this.each(function() {
				$this.process.call(this, opts);
			});
			return this;
		};
	},
	process: function(opts) {
		var $menu = $(this),
			activeRow = null,
			mouseLocs = [],
			lastDelayLoc = null,
			timeoutId = null,
			options = $.extend({
				rowSelector: "> li",
				submenuSelector: "*",
				submenuDirection: "below",
				tolerance: 0,
				enter: $.noop,
				exit: $.noop,
				activate: $.noop,
				deactivate: $.noop,
				exitMenu: $.noop
			}, opts);

		var MOUSE_LOCS_TRACKED = 3, 
			DELAY = 300;

		var mousemoveDocument = function(e) {
				mouseLocs.push({x: e.pageX, y: e.pageY});

				if (mouseLocs.length > MOUSE_LOCS_TRACKED) {
					mouseLocs.shift();
				}
			};

		var mouseleaveMenu = function() {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				if (options.exitMenu(this)) {
					if (activeRow) {
						options.deactivate(activeRow);
					}
				}
				activeRow = null; // если нужно будет скрывать-показывать подменю по клику, внести эту строчку в условие
				
			};

		var mouseenterRow = function() {
				if (timeoutId) {
					clearTimeout(timeoutId);
				}

				options.enter(this);
				possiblyActivate(this);
			},
			mouseleaveRow = function() {
				options.exit(this);
			};

		var clickRow = function() {
				activate(this);
			};

		var activate = function(row) {
				if (row === activeRow) {
					return;
				}

				if (activeRow) {
					options.deactivate(activeRow);
				}

				options.activate(row);
				activeRow = row;
			};

		var possiblyActivate = function(row) {
				var delay = activationDelay();

				if (delay) {
					timeoutId = setTimeout(function() {
						possiblyActivate(row);
					}, delay);
				} else {
					activate(row);
				}
			};

		var activationDelay = function() {
				if (!activeRow || !$(activeRow).is(options.submenuSelector)) {
					return 0;
				}

				var offset = $menu.offset(),
					upperLeft = {
						x: offset.left,
						y: offset.top - options.tolerance
					},
					upperRight = {
						x: offset.left + $menu.outerWidth(),
						y: upperLeft.y
					},
					lowerLeft = {
						x: offset.left,
						y: offset.top + $menu.outerHeight() + options.tolerance
					},
					lowerRight = {
						x: offset.left + $menu.outerWidth(),
						y: lowerLeft.y
					},
					loc = mouseLocs[mouseLocs.length - 1],
					prevLoc = mouseLocs[0];

				if (!loc) {
					return 0;
				}

				if (!prevLoc) {
					prevLoc = loc;
				}

				if (prevLoc.x < offset.left || prevLoc.x > lowerRight.x ||
					prevLoc.y < offset.top || prevLoc.y > lowerRight.y) {
					return 0;
				}

				if (lastDelayLoc && loc.x === lastDelayLoc.x && loc.y === lastDelayLoc.y) {
					return 0;
				}

				function slope(a, b) {
					return (b.y - a.y) / (b.x - a.x);
				}

				var decreasingCorner = upperRight,
					increasingCorner = lowerRight;

				if (options.submenuDirection === "left") {
					decreasingCorner = lowerLeft;
					increasingCorner = upperLeft;
				} else if (options.submenuDirection === "below") {
					decreasingCorner = lowerRight;
					increasingCorner = lowerLeft;
				} else if (options.submenuDirection === "above") {
					decreasingCorner = upperLeft;
					increasingCorner = upperRight;
				}

				var decreasingSlope = slope(loc, decreasingCorner),
					increasingSlope = slope(loc, increasingCorner),
					prevDecreasingSlope = slope(prevLoc, decreasingCorner),
					prevIncreasingSlope = slope(prevLoc, increasingCorner);

				if (decreasingSlope < prevDecreasingSlope &&
						increasingSlope > prevIncreasingSlope) {
					lastDelayLoc = loc;
					return DELAY;
				}

				lastDelayLoc = null;
				return 0;
			};

				$menu
					.mouseleave(mouseleaveMenu)
					.find(options.rowSelector)
						.mouseenter(mouseenterRow)
						.mouseleave(mouseleaveRow)
						.click(clickRow);

				PKP.$document.mousemove(mousemoveDocument);
	}
};

/* Предохранитель для необычных браузеров */
PKP.IE = {
	init: function() {
		this.console();
		if(!!navigator.userAgent.match(/Trident\/7\./)) {
			// this.placeholder();
		}
		var isIE9 = document.all && !window.atob;

		if(isIE9) {
			$("input[type!='password'], textarea").placeholder();
		}
	},

	console: function() {
		if (!window.console) {
			window.console = {};
		}

		var m = [
			"log", "info", "warn", "error", "debug", "trace", "dir", "group",
			"groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
			"dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
		];

		for (var i = 0; i < m.length; i++) {
			if (!window.console[m[i]]) {
				window.console[m[i]] = function() {};
			}    
		} 
	},

	placeholder: function() {
		$('[placeholder]')
			.focus(function() {
				var input = $(this);

				if (input.val() === input.attr('placeholder')) {
					input.val('');
					input.removeClass('placeholder');
				}
			})
			.blur(function() {
				var input = $(this);
				if (input.val() === '' || input.val() === input.attr('placeholder')) {
				input.addClass('placeholder');
				input.val(input.attr('placeholder'));
				}
			})
			.blur()
			.parents('form')
			.submit(function() {
				$(this).find('[placeholder]').each(function() {
					var input = $(this);
					if (input.val() === input.attr('placeholder')) {
						input.val('');
					}
				});
			});
		// 
	}
};

/* Инициализация галерей и слайдеров */
PKP.Sliders = {
	init: function() {
		$('#cases').fotorama({
				width: '100%',
				height: 620,
				allowfullscreen: false,
				loop: true,
				autoplay: 3500,
				stopautoplayontouch: true,
				nav: 'dots',
				arrows: false,
				shadows: false,
				transition: 'crossfade'
			});

		$('.chain-slider').owlCarousel({
			items: 3,
			slideSpeed: 700,
			rewindSpeed: 700,
			navigation: true,
			navigationText: ['',''],
			scrollPerPage: true,
			pagination: false,
			responsive: true,
			theme: '',
		});

		$('.chain-slider--small').owlCarousel({
			items: 6,
			slideSpeed: 700,
			rewindSpeed: 700,
			navigation: true,
			navigationText: ['',''],
			scrollPerPage: true,
			pagination: false,
			responsive: true,
			theme: '',
		});

		$('.b-recommended__slider').fotorama({
			minheight: 440,
			click: false,
			arrows: false,
			loop: true,
			autoplay: 3500,
			allowfullscreen: false,
			nav: false
		});

		// Контролы
		$('.b-recommended__slider-control').click(function() {
			var slider = $('.b-recommended__slider').data('fotorama');

			if($(this).is('.next')) {
				slider.show('>');
			} else {
				slider.show('<');
			}
		});

		/* При необходимости инициализируем галереи на внутренних страницах */
		if($('.rates').length) {
			PKP.Sliders.rates();
		}

		if($('.catalog-banner').length > 0) {
			PKP.Sliders.catalogBanner();
		}
		if($('.b-catalog-item').length > 0) {
			PKP.Sliders.catalogItem();
		}
	},

	catalogBanner: function() {
		$('.b-catalog-banner').fotorama({
			width: '100%',
			height: 330,
			allowfullscreen: false,
			loop: true,
			autoplay: 3500,
			transitionduration: 500,
			stopautoplayontouch: true,
			nav: 'dots',
			click: false,
			swipe: true,
			arrows: true,
			shadows: false,
			transition: 'crossfade',
			fit: 'cover'
		});
	},

	catalogItem: function () {
		$('.b-catalog-item__photos').fotorama({
			width: 313,
			allowfullscreen: true,
			loop: true,
			autoplay: false,
			stopautoplayontouch: true,
			nav: 'thumbs',
			thumbwidth: 65,
			thumbheigth: 60,
			thumbmargin: 5,
			thumbborderwidth: 4,
			arrows: false,
			shadows: true,
			transition: 'slide',
		});
	},
	
	rates: function() {
		// Слайдер тарифов
		PKP.$rates = $('.slider')
			.fotorama({
				width: '100%',
				height: 657,
				allowfullscreen: false,
				loop: true,
				autoplay: 5000,
				stopautoplayontouch: true,
				nav: false,
				arrows: false,
				shadows: true,
				click: false
			});
		
		if(PKP.$rates) {

			// При хавере останавливать слайдер
			var slider = PKP.$rates.data('fotorama');

			$('.slider').hover(
				function () {
					slider.stopAutoplay();
				},
				function () {
					slider.startAutoplay(5000);
				}
			);
		
			// Контролы
			$('.slider-control').click(function() {
				if(PKP.$rates) {
					var slider = PKP.$rates.data('fotorama');

					if($(this).is('.next')) {
						slider.show('>');
					} else {
						slider.show('<');
					}
				}
			});

			// Заголовок
			$('.slider').on('fotorama:show fotorama:load',
				function (e, fotorama, extra) {
					$(this).siblings('.slider-status').text(fotorama.data[fotorama.activeIndex].title);
				}
			);
		}
	}
};

/* Подсказки */
PKP.Suggestions = {
	init: function() {
		$("#fullname").suggestions({
			serviceUrl: "https://dadata.ru/api/v2",
			token: "d89731fbdbf67193159dff06a06a50781df243af",
			type: "NAME",
			onSelect: function(suggestion) {
				var data = suggestion.data;
				$('#fullname .suggestion-input').val('');

				if(data.surname !== null) {
					$('#fullname__surname').val(data.surname).trigger("change");
				}

				if(data.name !== null) {
					$('#fullname__name').val(data.name).trigger("change");
				}

				if(data.patronymic !== null) {
					$('#fullname__patronymic').val(data.patronymic).trigger("change");
				}

				if(data.gender !== null) {
					$('#fullname__gender-' + data.gender.toLowerCase() ).attr('checked', true);
				}			
			}
		});

		$("#address").suggestions({
			serviceUrl: "https://dadata.ru/api/v2",
			token: "d89731fbdbf67193159dff06a06a50781df243af",
			type: "ADDRESS",
			geoLocation: true,
			onSelect: function(suggestion) {
				var data = suggestion.data;
				$('#address .suggestion-input').val('');

				if(data.postal_code !== null) {
					$('#address__postalcode').val(data.postal_code).trigger("change");
				}

				if(data.country !== null) {
					$('#address__country').val(data.country).trigger("change");
				}

				if(data.region !== null) {
					$('#address__region').val(data.region + ' ' + data.region_type + '.').trigger("change");
				}

				if(data.city === null) {
					if(data.settlement !== null) {
						$('#address__city').val(data.settlement_type + '. ' + data.settlement).trigger("change");
					}
				} else {
					$('#address__city').val(data.city_type + '. ' + data.city).trigger("change");
				}

				if(data.street !== null) {
					$('#address__street').val(data.street).trigger("change");
				}

				if(data.house !== null) {
					$('#address__house').val(data.house).trigger("change");
				}

				if(data.flat !== null) {
					$('#address__flat').val(data.flat).trigger("change");
				}
			}
		});
		$("#addAddress").suggestions({
			serviceUrl: "https://dadata.ru/api/v2",
			token: "d89731fbdbf67193159dff06a06a50781df243af",
			type: "ADDRESS",
			geoLocation: false,
			onSelect: function(suggestion) {
				var data = suggestion.data;
				$('#addAddress .suggestion-input').val('');

				if(data.postal_code !== null) {
					$('#addAddress__postalcode').val(data.postal_code).trigger("change");
				}

				if(data.country !== null) {
					$('#addAddress__country').val(data.country).trigger("change");
				}

				if(data.region !== null) {
					$('#addAddress__region').val(data.region + ' ' + data.region_type + '.').trigger("change");
				}

				if(data.city === null) {
					if(data.settlement !== null) {
						$('#addAddress__city').val(data.settlement_type + '. ' + data.settlement).trigger("change");
					}
				} else {
					$('#addAddress__city').val(data.city_type + '. ' + data.city).trigger("change");
				}

				if(data.street !== null) {
					$('#addAddress__street').val(data.street).trigger("change");
				}

				if(data.house !== null) {
					$('#addAddress__house').val(data.house).trigger("change");
				}

				if(data.flat !== null) {
					$('#addAddress__flat').val(data.flat).trigger("change");
				}
			}
		});
	}
};


/* Поехали! */
$($.proxy(PKP.init, PKP));