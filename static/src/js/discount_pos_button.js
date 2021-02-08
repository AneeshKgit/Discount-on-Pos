odoo.define('discount_on_pos.DiscountPosButton', function(require) {
    'use strict';

    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');

    class DiscountPosButton extends PosComponent {
           constructor () {
               super (... arguments);
               useListener ('click', this.onClick);
           }
            async onClick() {
               var self = this;
               var discount_pos_type = this.env.pos.config.discount_pos_type;

                   if (discount_pos_type == 'amount'){
                        console.log('AAMOUNT')
                        const { confirmed, payload } = await this.showPopup('NumberPopup', {
                           title: this.env._t('Discount Amount'),
                           body: this.env._t('This click is successfully done.'),
                           startingValue: this.env.pos.config.discount_pos_value,

                       });
                       if (confirmed) {
                           console.log('Button clicked')
                           console.log('discount_pos_type', discount_pos_type)
                           const val = Math.round(Math.max(0,Math.min(100,parseFloat(payload))));
                           console.log('val ', val)
                           await self.apply_discount(val);
                       }
                   }

                if (discount_pos_type == 'percentage'){
                    console.log('PPercentage')
                    const { confirmed, payload } = await this.showPopup('NumberPopup', {
                        title: this.env._t('Discount Percentage'),
//                        body: this.env._t('This click is successfully done.'),
                        startingValue: this.env.pos.config.discount_pos_value,
                    });
                    if (confirmed) {
                        console.log('Button clicked')
                        console.log('discount_pos_type', discount_pos_type)
                        const val = Math.round(Math.max(0,Math.min(100,parseFloat(payload))));
                        console.log('val ', val)
                        await self.apply_discount(val);
                    }


               }


            }//ASYNC

            async apply_discount(pc) {
                var order = this.env.pos.get_order();
                var lines = order.get_orderlines();
                var discount_pos_type = this.env.pos.config.discount_pos_type;
                var product  = this.env.pos.db.get_product_by_id(this.env.pos.config.discount_pos_product_id[0]);
                if (product === undefined) {
                    await this.showPopup('ErrorPopup', {
                        title : this.env._t("No discount product found"),
                        body  : this.env._t("The discount product seems misconfigured. Make sure it is flagged as 'Can be Sold' and 'Available in Point of Sale'."),
                    });
                    return;
                }

                // Remove existing discounts
//                var dis_name = 'Discount';
                var i = 0;
                while ( i < lines.length ) {
                    if (lines[i].get_product() === product) {
                        order.remove_orderline(lines[i]);
//                        product.display_name = dis_name;
                    } else {
                        i++;
                    }
                }

                // Add discount
                // We add the price as manually set to avoid recomputation when changing customer.
                var base_to_discount = order.get_total_without_tax();
                if (product.taxes_id.length){
                    var first_tax = this.env.pos.taxes_by_id[product.taxes_id[0]];
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
//                    product.display_name += '('+ n + '%)';
                    product.description = n + '%';
                    product.description_sale = 'percentage';

                    var discount_value =  - (pc / 100.0 * base_to_discount);
                }

                if( discount_value < 0 ){
                    order.add_product(product, { price: discount_value });
                }

                var j=0;
                while ( j < lines.length ) {

                    if (lines[j].get_product() === product) {

                        console.log('lines[j].getproduct',lines[j].get_product());
                        console.log('lines[j].getDiscount',lines[j].get_discount_str() );
                        console.log('lines[j]p.desc',lines[j].get_product().description);

                    }
                    j++;

                }
            }

        }//CLASS


    DiscountPosButton.template = 'DiscountPosButton';

    ProductScreen.addControlButton({
        component: DiscountPosButton,
        condition: function() {
            return this.env.pos.config.module_discount_on_pos;
        },
//       position: ['before', 'SetPricelistButton'],

    });

    Registries.Component.add(DiscountPosButton);

    return DiscountPosButton;

});
