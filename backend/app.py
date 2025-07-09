from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By

import time

PATH = '/Users/haya/Desktop/chromedriver'
print(PATH)

service = Service(executable_path=PATH)

driver = webdriver.Chrome(service=service)

driver.get('https://developer.spotify.com/')

search = driver.find_element(By.CLASS_NAME, 'Button-sc-1dqy6lx-0')

print(search)

time.sleep(10)