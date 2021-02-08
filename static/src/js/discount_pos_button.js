odoo.define('discount_on_pos.DiscountPosButton', function (require) {
"use strict";

// require pos screens
var core = require('web.core');
var pos_screens = require('point_of_sale.screens');

var _t = core._t;


// create a new button by extending the base ActionButtonWidget
var DiscountPosButton = pos_screens.ActionButtonWidget.extend({
    template: 'DiscountPosButton',
    button_click: function(){
//        alert("Discount button clicked");

        console.log("hello test");
        var self = this;
        var discount_pos_type = this.pos.config.discount_pos_type;
        console.log(discount_pos_type)
//        alert(discount_pos_type);

        if (discount_pos_type == 'amount'){
            this.gui.show_popup('number',{
                'title': _t('Discount Amount'),
                'value': this.pos.config.discount_value,
                'confirm': function(val) {
//                    val = Math.round(Math.max(0,Math.min(100,val)));
//                    console.log("value ",value)
                    console.log("value ",val)
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
//                    console.log("value ",value)
                    console.log("val ",val)
                    self.apply_discount(val);
                },
            });
        }
    },

    apply_discount: function(pc) {
        var order    = this.pos.get_order();
        var discount_pos_type = this.pos.config.discount_pos_type;
        var lines    = order.get_orderlines();
//        var product  = this.pos.db.get_product_by_id('54')
        var product  = this.pos.db.get_product_by_id(this.pos.config.discount_pos_product_id[0]);

        if (product === undefined) {
            this.gui.show_popup('error', {
                title : _t("No discount product found"),
                body  : _t("The discount product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."),
            });
            return;
        }



        console.log("product ", product)
        console.log("product.display_name ", product.display_name)
        console.log("pc ", pc)
//        console.log("tot with tax ", order.get_total_with_tax())
//        console.log("tot without tax ", order.get_total_without_tax())


        // Remove existing discounts
//        var dis_name = 'Discount';
        var i = 0;
        while ( i < lines.length ) {
            if (lines[i].get_product() === product) {
                order.remove_orderline(lines[i]);

//                console.log('before name change done', product.display_name);
//                product.display_name = dis_name;
//                console.log('name change done', product.display_name);


                console.log("done");

            } else {
                console.log('lines[i].get_product()-', lines[i].get_product())
                console.log('lines[i].get_product().info-', lines[i].get_product().info)
                console.log('lines[i].get_discount_str() -', lines[i].get_discount_str())
                console.log('order' ,order )
                console.log('lines' ,lines )
//                console.log('' , )
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


        // Add discount_value
        if (discount_pos_type == 'amount'){
            var n = pc.toString();
//            product.display_name += '(Amount)';
            product.description = n ;
            product.description_sale = 'amount';
            var discount_value = -pc;

        }
        if (discount_pos_type == 'percentage'){
            var n = pc.toString();
//            product.display_name += '('+ n + '%)';
              product.description = n + '%';
              product.description_sale = 'percentage';

            var discount_value =  - (pc / 100.0 * base_to_discount);
        }

        if( discount_value < 0 ){
            order.add_product(product, { price: discount_value });

        }
//        get_discount_value: function(){
////            if(this.discount_value){
////                return this.discount_value;
////            }
////            else{
////                return 0;
////            }
//        return 5;
//
//        },
        var j=0;
        while ( j < lines.length ) {

            if (lines[j].get_product() === product) {

                console.log('lines[j].getproduct',lines[j].get_product());
                console.log('lines[j].getDiscount',lines[j].get_discount_str() );
                console.log('lines[j]p.desc',lines[j].get_product().description);
//                console.log('Symbol',widget.format_currency(lines[j].get_unit_display_price()));
                console.log('Symbol', this.pos.company);
                console.log('Symbol', this.pos.company.currency_id);


            }
            j++;

        }




    },
});



// define the button
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