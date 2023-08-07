# Copyright (c) 2023, Abhishek Chougule and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
import urllib.parse

class GupshupSMSTemplates(Document):
	@frappe.whitelist()
	def before_save(self):
		query = str(self.message)
		self.message=urllib.parse.quote(query)
