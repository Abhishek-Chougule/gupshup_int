frappe.ui.form.on('Lead', {
    refresh: async function (frm) {

        var temp = frm.doc;
        var mobileNumbers = [];
        var mobileNumber=''
        for (var prop in temp) {
        if ((prop==="mobile_no" || prop==="alternate_mobile_number" || prop==="primary_mobile" || prop==="phone") && isValidMobileNumber(temp[prop])) {
            console.log(temp[prop])
            if((temp[prop]).length===10)
            {
                mobileNumber = 91+temp[prop];
            }
            else {
                mobileNumber = temp[prop];
            }
            if (!mobileNumbers.includes(mobileNumber)) {
                    mobileNumbers.push(mobileNumber);
            }
            
        }
        }

    function isValidMobileNumber(mobile) {
        return /^\d{10}$|^\d{12}$|^\d{13}$/.test(mobile);
    }
 


    //Gupshup Whatsapp #MrAbhi ----------------------------------------------------------
    frappe.db.get_single_value('Gupshup Whatsapp Settings', 'enabled').then(function(gupshup_enabled_name) {
        if (gupshup_enabled_name) {  
            frm.add_custom_button(__('Send Whatsapp Message'), function () { 
                let d = new frappe.ui.Dialog({
                    title: 'Gupshup Whatsapp',
                    fields: [
                        {
                            label: 'Send To',
                            fieldname: 'send_to',
                            fieldtype: 'Select',
                            options: mobileNumbers
                        },
                        {
                            label: 'Type',
                            fieldname: 'type',
                            fieldtype: 'Select',
                            options: ['text','video','audio','image','file','sticker']
                        },
                        {
                            label: 'Select Template',
                            fieldname: 'template',
                            fieldtype: 'Link',
                            options: 'Gupshup Whatsapp Templates',
                            change: function() {
                                let selectedTemplate = d.get_value('template');
                                if (selectedTemplate) {
                                    frappe.call({
                                        method: 'frappe.client.get_value',
                                        args: {
                                            doctype: 'Gupshup SMS Templates',
                                            fieldname: ['message', 'dlttemplateid'],
                                            filters: { name: selectedTemplate }
                                        },
                                        callback: function(r) {
                                            if (r && r.message && r.message.message) {
                                                d.set_value('msg', r.message.message);
                                                d.set_value('dlttemplateid', r.message.dlttemplateid);
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
                    primary_action_label: 'Send',
                    primary_action(values) {
                        let msgValue = values.msg;
                        let dlttemplateidValue = values.dlttemplateid;
                        let senttoValue = values.send_to;
                        frappe.call({
                            method: "gupshup.api.sendWhatsapp",
                            args: {},
                            callback: function(r) {}
                        });
                        d.hide();
                    }
                });
            
                d.show();
            }, __("Gupshup"));
            frm.add_custom_button(__('Get Whatsapp Templates'), function () {
                frappe.call({
                    method: 'gupshup.api.fetchTemplates',
                    args: {},
                    callback: function(r) {}
                });
            }, __("Gupshup"));
            // frm.add_custom_button(__('Check Wallet Balance'), function () {
            //     frappe.call({
            //         method: 'gupshup.api.check_balance',
            //         args: {},
            //         callback: function(r) {}
            //     });
            // }, __("Gupshup"));
        }
    }).catch(function(error) {
        console.log("Error fetching gupshup_enabled_name:", error);
    });
//------------------------------------------------------------------------------------

    //GupShup MrAbhi------------------------------------------------------------------------
    frappe.db.get_single_value('Gupshup SMS Settings', 'enabled').then(function(gupshup_enabled_name) {
        if (gupshup_enabled_name) {
    frm.add_custom_button(__('Send SMS'), function() {
        let d = new frappe.ui.Dialog({
            title: 'Gupshup SMS',
            fields: [
                {
                    label: 'Send To',
                    fieldname: 'send_to',
                    fieldtype: 'Select',
                    options: mobileNumbers
                    
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
                                    fieldname: ['message', 'dlttemplateid'],
                                    filters: { name: selectedTemplate }
                                },
                                callback: function(r) {
                                    if (r && r.message && r.message.message) {
                                        d.set_value('msg', r.message.message);
                                        d.set_value('dlttemplateid', r.message.dlttemplateid);
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
                },
                {
                    label: 'dlt template id',
                    fieldname: 'dlttemplateid',
                    fieldtype: 'Data',
                    read_only: 1,
                    hidden: 1
                }
            ],
            size: 'large', 
            primary_action_label: 'Send SMS',
            primary_action(values) {
                let msgValue = values.msg;
                let dlttemplateidValue = values.dlttemplateid;
                let senttoValue = values.send_to;
                frappe.call({
                    method: "gupshup.api.send_sms",
                    args: { "primary_mobile": senttoValue, "msg": msgValue, "dlttemplateid": dlttemplateidValue },
                    callback: function(r) {}
                });
                d.hide();
            }
        });
    
        d.show();
    }, __("Gupshup"));
    frm.add_custom_button(__('Get SMS History'), function () {
        var previousUrl = window.location.href;
        frappe.set_route('Report', 'Gupshup SMS Sent History');
        window.history.replaceState({}, document.title, previousUrl);
        window.onpopstate = function(event) {
          window.location.href = previousUrl;
        };
    }, __("Gupshup"));
    }
    }).catch(function(error) {
        console.log("Error fetching gupshup_enabled_name:", error);
    });
    // ------------------------------------------------------------------------------
       
}
});