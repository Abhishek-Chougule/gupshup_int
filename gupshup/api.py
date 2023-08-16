import frappe
import requests
from frappe.utils import now_datetime
import random
import json

@frappe.whitelist()
def check_balance():
    gws=frappe.get_doc('Gupshup Whatsapp Settings')
    apikey=gws.apikey
    
    url = f"https://api.gupshup.io/sm/api/v2/wallet/balance"

    headers = {"apikey": apikey}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        frappe.msgprint(response.text)
    else:
        frappe.msgprint(response.text)


@frappe.whitelist()
def sendWhatsapp():
    pass  


@frappe.whitelist()
def fetchTemplates():
    gws=frappe.get_doc('Gupshup Whatsapp Settings')
    appname=gws.srcname
    apikey=gws.apikey
    
    url = f"https://api.gupshup.io/sm/api/v1/template/list/{appname}"

    headers = {"apikey": apikey}

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        frappe.msgprint(response.text)
    else:
        frappe.msgprint(response.text)
    


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
            mask= gss.mask

            url = f"{baseurl}?method={method}&send_to={send_to}&msg={msg}&msg_type={msg_type}&userid={userid}&auth_scheme={auth_scheme}&password={password}&v={v}&format={format}&principalEntityId={principalentityid}&dltTemplateId={dlttemplateid}&mask={mask}"

            payload = {}
            headers = {}

            response = requests.request("POST", url, headers=headers, data=payload)

            response_text = response.text.strip()
            response_parts = response_text.split("|")
            if response.status_code == 200:
                status = response_parts[0].strip().capitalize()
                dt=now_datetime()
                current_user = frappe.session.user
                
                post_gs_history(status,gss.userid,primary_mobile,msg,dt,current_user)
            
                frappe.msgprint(status, title='Gupshup SMS', indicator='green',wide=True)
                
       
            else:
                frappe.msgprint("API request failed:", response.text)

    else:
        frappe.msgprint('You have to activate Subscription / Enable Gupshup Settings !')


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