# -*- coding: utf-8 -*-

from odoo import api, fields, models


class PosConfig(models.Model):
    _inherit = 'pos.config'

    module_discount_on_pos = fields.Boolean("Discount")

    discount_pos_type = fields.Selection([('amount', 'Amount'),
                                          ('percentage', 'Percentage')],
                                         string='Discount Type',
                                         default='amount')

    discount_value = fields.Float(string='Discount Value', default=0)

    discount_pos_product_id = fields.Many2one('product.product',
                                              compute='_compute_product')

    def _compute_product(self):
        self.discount_pos_product_id = self.env.ref(
                                        'discount_on_pos.product_discount_pos')
        # self.discount_pos_product_id.taxes_id = False
    # print("disc ", discount_product_id)

    @api.onchange('module_discount_on_pos')
    def _onchange_discount_pos_type(self):
        print("test")
        print("self ", self.discount_pos_product_id)
        print("self ", self.env.ref('discount_on_pos.product_discount_pos'))
        print("self ", self.discount_pos_product_id.taxes_id)
        print("module_discount_on_pos ", self.module_discount_on_pos)
