from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

import time
import os
from dotenv import load_dotenv

load_dotenv()

PATH = '/Users/haya/Desktop/chromedriver'
EMAIL = os.getenv('EMAIL')
PASS = os.getenv('PASSWORD')
print(EMAIL)

service = Service(executable_path=PATH)

driver = webdriver.Chrome(service=service)

driver.get('https://developer.spotify.com/')

#click login button
log_in = driver.find_element(By.XPATH, "//button[contains(text(), 'Log in')]")
log_in.click()

#input email
email_input = driver.find_element(By.ID, 'login-username')
email_input.send_keys(EMAIL)

#click continue button
continue_button = driver.find_element(By.ID, "login-button")
continue_button.click()

#click login w password button to go back and login w password (spotify weird like that)
log_in_w_password = driver.find_element(By.TAG_NAME, "button")[0]
print(log_in_w_password)
log_in_w_password.click()

# email_input.send_keys(EMAIL)
# pass_input = driver.find_element(By.ID, 'login-password')
# pass_input.send_keys(PASS)

# log_in = driver.find_element(By.XPATH, "//button[contains(text(), 'Log in')]")
# log_in.click()


time.sleep(10)