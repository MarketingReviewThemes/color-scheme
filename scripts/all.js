jQuery.noConflict();
jQuery('html').addClass('pkp_html');
jQuery('body').addClass('pkp_body');

jQuery(document).ready(function($) {
    $(window).on('load', function(){
        $('.j-template').each(function(){
            var html = $(this).html(),
                htmlHolder = $('#pkp-container');
            htmlHolder.append(html);
            $(this).remove();

            $(".j-pkp-select").selecter({
                label: "По умолчанию"
            });

            /*scrollbar*/
            $(".j-scroll").mCustomScrollbar();

            /*rollup*/
            $('.j-pkp-rollup__trigger').on('click', function(e){
                $(this).toggleClass('pkp-rollup__trigger_closed').parent().find('.j-pkp-rollup__content').slideToggle();
                e.preventDefault();
            });

            /*валидация*/
            $('.j-pkp-payment').on('submit', function(){
                var form = $(this);
                var input = form.find('.j-pkp-req-input');
                var pattern = /\w+@\w+\.\w{2,6}/gi;
                var errorMsg = input.siblings('.pkp-error-msg'); 
                if(input.val().length === 0) {
                    input.addClass('pkp-input_error');
                    errorMsg.text('Обязательное поле').fadeIn();
                    return false;
                }  
                if(!pattern.test(input.val())) {
                    input.addClass('pkp-input_error');
                    errorMsg.text('Введите e-mail корректно').fadeIn();
                    return false;
                }
                if(pattern.test(input.val())) {
                    input.removeClass('pkp-input_error');
                    errorMsg.fadeOut();
                }
            });  

            /* tooltips */
            function toolTips() {
                var container = $('#pkp-container'),
                    containerWidth = container.outerWidth();
                if(containerWidth <= 800 && containerWidth >= 784){
                    console.log(containerWidth);
                    $('.pkp-payment-method .pkp-payment-method__item:nth-child(3n + 1)').each(function(){
                        $(this).find('.pkp-tooltip__content').removeAttr('class').addClass('pkp-tooltip__content pkp-tooltip__content_left');
                    });
                    $('.pkp-payment-method .pkp-payment-method__item:nth-child(3n + 2)').each(function(){
                        $(this).find('.pkp-tooltip__content').removeAttr('class').addClass('pkp-tooltip__content pkp-tooltip__content_center');
                    });
                    $('.pkp-payment-method .pkp-payment-method__item:nth-child(3n + 3)').each(function(){
                        $(this).find('.pkp-tooltip__content').removeAttr('class').addClass('pkp-tooltip__content pkp-tooltip__content_right');
                    });
                }

                if(containerWidth < 785 && containerWidth >= 550){
                    console.log(containerWidth);
                    $('.pkp-payment-method .pkp-payment-method__item:nth-child(2n+1)').each(function(){
                        $(this).find('.pkp-tooltip__content').removeAttr('class').addClass('pkp-tooltip__content pkp-tooltip__content_left');
                    });
                    $('.pkp-payment-method .pkp-payment-method__item:nth-child(2n)').each(function(){
                        $(this).find('.pkp-tooltip__content').removeAttr('class').addClass('pkp-tooltip__content pkp-tooltip__content_right');
                    });
                }

                if(containerWidth < 550){
                    console.log(containerWidth);
                    $('.pkp-payment-method .pkp-payment-method__item').each(function(){
                        $(this).find('.pkp-tooltip__content').removeAttr('class').addClass('pkp-tooltip__content pkp-tooltip__content_center');
                    });
                }
            }

            /*стили привязаны к размеру контейнера*/
            function media() {
                var container = $('#pkp-container'),
                    containerWidth = container.outerWidth();
                if(containerWidth <= 800 && containerWidth > 784) {
                    container.removeAttr('class').addClass('pkp-container_800');
                }
                else if(containerWidth < 785 && containerWidth > 715) {
                    container.removeAttr('class').addClass('pkp-container_784');
                }
                else if(containerWidth < 715 && containerWidth > 640) {
                    container.removeAttr('class').addClass('pkp-container_715');
                }
                else if(containerWidth < 640) {
                    container.removeAttr('class').addClass('pkp-container_640');
                }
            }

            toolTips();
            media();

            $(window).on('resize', function(){
                toolTips();
                media();
            });
        });
    }); 
});

