frappe.ui.form.on('Contact', {
    refresh: async function (frm) {

    //GupShup MrAbhi------------------------------------------------------------------------
    frm.add_custom_button(__('Send SMS'), function() {
        let d = new frappe.ui.Dialog({
            title: 'Gupshup SMS',
            fields: [
                {
                    label: 'Send To',
                    fieldname: 'send_to',
                    fieldtype: 'Data',
                    default: (frm.doc.mobile_no ? frm.doc.mobile_no : frm.doc.phone)
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
    frm.add_custom_button(__('Get SMS History'), function () {
        var previousUrl = window.location.href;
        frappe.set_route('Report', 'Gupshup SMS Sent History');
        window.history.replaceState({}, document.title, previousUrl);
        window.onpopstate = function(event) {
          window.location.href = previousUrl;
        };
    }, __("SMS"));
    
    // ------------------------------------------------------------------------------
       
}
});