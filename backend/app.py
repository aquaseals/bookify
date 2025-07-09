from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import threading

app = Flask(__name__)

SPOTIFY_USERNAME = "your_spotify_login"
SPOTIFY_PASSWORD = "your_spotify_password"
APP_URL = "https://developer.spotify.com/dashboard/app/YOUR_APP_ID"
SPOTIFY_OAUTH_URL = "https://accounts.spotify.com/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI"

def run_selenium(email, name):
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # Run without opening Chrome GUI (optional)
    driver = webdriver.Chrome(options=options)
    wait = WebDriverWait(driver, 15)

    try:
        # Login
        driver.get("https://developer.spotify.com/dashboard/login")
        wait.until(EC.presence_of_element_located((By.ID, "login-username"))).send_keys(SPOTIFY_USERNAME)
        driver.find_element(By.ID, "login-password").send_keys(SPOTIFY_PASSWORD)
        driver.find_element(By.ID, "login-button").click()

        # Go to app
        wait.until(EC.url_contains("dashboard"))
        driver.get(APP_URL)

        # Users and Access
        wait.until(EC.element_to_be_clickable((By.LINK_TEXT, "Users and Access"))).click()
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='email']"))).send_keys(email)

        try:
            driver.find_element(By.CSS_SELECTOR, "input[type='text']").send_keys(name)
        except:
            pass

        driver.find_element(By.XPATH, "//button[contains(text(), 'Add')]").click()
    finally:
        driver.quit()

@app.route('/add-user', methods=['POST'])
def add_user():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')

    threading.Thread(target=run_selenium, args=(email, name)).start()

    return jsonify({'redirectUrl': SPOTIFY_OAUTH_URL})

if __name__ == '__main__':
    app.run(debug=True)
