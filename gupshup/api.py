import frappe
import requests
from frappe.utils import now_datetime
import random

@frappe.whitelist()
def fetchTemplates():
    gss=frappe.get_doc('Gupshup SMS Settings')
    appname=gss.app_name
    apikey=gss.x_api_key
    
    url = f"https://api.gupshup.io/sm/api/v1/template/list/{appname}"

    headers = {"apikey": apikey}

    response = requests.get(url, headers=headers)

    gst=frappe.db.get_list('Gupshup SMS Templates',fields=['name','template_name','message'],filters={'message':str(response.text)})
    if gst:
        pass
    else:
        new_gupshup_sms_template = frappe.new_doc("Gupshup SMS Templates")
        new_gupshup_sms_template.template_name = str(random.randint(1,100000))
        new_gupshup_sms_template.message = str(response.text)
        new_gupshup_sms_template.insert()


@frappe.whitelist()
def send_sms(primary_mobile,msg,dlttemplateid):
    
    if len(primary_mobile)==10:
        primary_mobile='91'+primary_mobile
    if len(primary_mobile)<10:
        frappe.throw("Invalid Mobile Number !")
    
    gss=frappe.get_doc('Gupshup SMS Settings')
    strPassword = gss.get_password('password')


    if gss.enabled==1:
            baseurl = "http://enterprise.smsgupshup.com/GatewayAPI/rest"
            userid= gss.userid
            password= strPassword
            send_to= primary_mobile
            msg= msg
            method= gss.method
            msg_type= gss.msg_type
            format= gss.format
            auth_scheme= gss.auth_scheme
            v= gss.v
            principalentityid= gss.principalentityid
            dlttemplateid= dlttemplateid

            url = f"{baseurl}?method={method}&send_to={send_to}&msg={msg}&msg_type={msg_type}&userid={userid}&auth_scheme={auth_scheme}&password={password}&v={v}&format={format}&principalEntityId={principalentityid}&dltTemplateId={dlttemplateid}"

            payload = {}
            headers = {}

            response = requests.request("POST", url, headers=headers, data=payload)

            
            if response.status_code == 200:
                # data = response.json()
                # status=(data['response']['status']).capitalize()
                dt=now_datetime()
                current_user = frappe.session.user
                # deatils=data['response']['details']
                
                post_gs_history("sucess",gss.userid,primary_mobile,msg,dt,current_user)
            
                frappe.msgprint("Status : Success", title='Gupshup SMS', indicator='green' if status=="Success" else 'red',wide=True)
                
       
            else:
                frappe.msgprint("API request failed:", response.text)

    else:
        frappe.msgprint('You have to activate Subscription / Enable Profile Enrichment !')


# Post GS History  -----------------------------------------------------------
@frappe.whitelist()
def post_gs_history(status,userid,primary_mobile,msg,dt,current_user):   
        
    new_gupshup_sms_sent_history = frappe.new_doc("Gupshup SMS Sent History")
    
    new_gupshup_sms_sent_history.status = status
    new_gupshup_sms_sent_history.user_id = userid
    new_gupshup_sms_sent_history.timestamp = str(dt)
    new_gupshup_sms_sent_history.message = msg
    new_gupshup_sms_sent_history.created_by = current_user
    new_gupshup_sms_sent_history.sent_to = primary_mobile

    new_gupshup_sms_sent_history.insert()