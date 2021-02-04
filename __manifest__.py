# -*- coding: utf-8 -*-
{
    'name': "Discount on POS",

    'summary': """
        Discount on POS""",

    'description': """
         Discount on POS.
    """,

    'author': "My Company",
    'website': "http://www.yourcompany.com",

    'category': 'Uncategorized',
    'version': '14.0.1.0.0',

    'depends': ['base', 'point_of_sale'],

    # always loaded
    'data': [
        'views/discount_pos.xml',
        'views/button_view.xml',
        'data/discount_product.xml'
        # 'views/pos_templates.xml'
    ],
    'qweb': [
        # 'static/src/xml/*.xml',
        'static/src/xml/pos_button.xml',
    ],
}
