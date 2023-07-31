frappe.ui.form.on('Lead', {
    refresh: async function (frm) {

    //GupShup MrAbhi------------------------------------------------------------------------
    frm.add_custom_button(__('Gupshup'), function() {
        let d = new frappe.ui.Dialog({
            title: 'Gupshup SMS',
            fields: [
                {
                    label: 'Send To',
                    fieldname: 'send_to',
                    fieldtype: 'Data',
                    default: (frm.doc.mobile_no ? frm.doc.mobile_no : frm.doc.primary_mobile)
                },
                {
                    label: 'Select Template',
                    fieldname: 'template',
                    fieldtype: 'Link',
                    options: 'Gupshup SMS Templates',
                    change: function() {
                        let selectedTemplate = d.get_value('template');
                        if (selectedTemplate) {
                            frappe.call({
                                method: 'frappe.client.get_value',
                                args: {
                                    doctype: 'Gupshup SMS Templates',
                                    fieldname: 'message',
                                    filters: { name: selectedTemplate }
                                },
                                callback: function(r) {
                                    if (r && r.message && r.message.message) {
                                        d.set_value('msg', r.message.message);
                                    }
                                }
                            });
                        }
                    }
                },
                {
                    label: 'Message',
                    fieldname: 'msg',
                    fieldtype: 'Long Text',
                    read_only: 1
                }
            ],
            size: 'large', 
            primary_action_label: 'Send SMS',
            primary_action(values) {
                let msgValue = values.msg;
                let senttoValue = values.send_to;
                frappe.call({
                    method: "gupshup.api.send_sms",
                    args: { "primary_mobile": senttoValue, "msg": msgValue },
                    callback: function(r) {}
                });
                d.hide();
            }
        });
    
        d.show();
    }, __("SMS"));
    
    // ------------------------------------------------------------------------------
       
}
});