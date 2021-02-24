odoo.define('discount_on_pos.DiscountPosButton', function (require) {
"use strict";

var core = require('web.core');
var pos_screens = require('point_of_sale.screens');

var _t = core._t;

var DiscountPosButton = pos_screens.ActionButtonWidget.extend({
    template: 'DiscountPosButton',
    button_click: function(){

        var self = this;
        var discount_pos_type = this.pos.config.discount_pos_type;

        if (discount_pos_type == 'amount'){
            this.gui.show_popup('number',{
                'title': _t('Discount Amount'),
                'value': this.pos.config.discount_value,
                'confirm': function(val) {
                    self.apply_discount(val);
                },
            });
        }

        if (discount_pos_type == 'percentage'){
            this.gui.show_popup('number',{
                'title': _t('Discount %'),
                'value': this.pos.config.discount_value,
                'confirm': function(val) {
                    val = Math.round(Math.max(0,Math.min(100,val)));
                    self.apply_discount(val);
                },
            });
        }
    },

    apply_discount: function(pc) {
        var order    = this.pos.get_order();
        var discount_pos_type = this.pos.config.discount_pos_type;
        var lines    = order.get_orderlines();
        var product  = this.pos.db.get_product_by_id(this.pos.config.discount_pos_product_id[0]);

        if (product === undefined) {
            this.gui.show_popup('error', {
                title : _t("No discount product found"),
                body  : _t("The discount product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."),
            });
            return;
        }

        var i = 0;
        while ( i < lines.length ) {
            if (lines[i].get_product() === product) {
                order.remove_orderline(lines[i]);

            } else {
                i++;
            }
        }

        var base_to_discount = order.get_total_without_tax();
        if (product.taxes_id.length){
            var first_tax = this.pos.taxes_by_id[product.taxes_id[0]];
            if (first_tax.price_include) {
                base_to_discount = order.get_total_with_tax();
            }
        }

        if (discount_pos_type == 'amount'){
            var n = pc.toString();
            product.description = n ;
            product.description_sale = 'amount';
            var discount_value = -pc;

        }
        if (discount_pos_type == 'percentage'){
            var n = pc.toString();
            product.description = n + '%';
            product.description_sale = 'percentage';
            var discount_value =  - (pc / 100.0 * base_to_discount);
        }

        if( discount_value < 0 ){
            order.add_product(product, { price: discount_value });

        }
    },
});

pos_screens.define_action_button({
    'name': 'DiscountPos',
    'widget': DiscountPosButton,
    'condition': function(){
        return this.pos.config.module_discount_on_pos},
});

return {
    DiscountPosButton: DiscountPosButton,
}

});