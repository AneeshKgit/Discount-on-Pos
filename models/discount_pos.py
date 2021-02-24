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
