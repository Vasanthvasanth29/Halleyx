package com.example.workflow.selenium;

import io.github.bonigarcia.wdm.WebDriverManager;
import org.junit.jupiter.api.*;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertTrue;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class SystemAutomationTest {

    private WebDriver driver;
    private WebDriverWait wait;
    private static final String BASE_URL = "http://localhost:5173"; // Adjust port if needed

    @BeforeAll
    void setupClass() {
        WebDriverManager.chromedriver().setup();
    }

    @BeforeEach
    void setupTest() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless"); // Run in headless mode for CI/CD environments
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        
        driver = new ChromeDriver(options);
        wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    @AfterEach
    void tearDown() {
        if (driver != null) {
            driver.quit();
        }
    }

    @Test
    @DisplayName("Verify Login Page and Simple Login Attempt")
    void testLoginFlow() {
        driver.get(BASE_URL + "/login");
        
        // Wait for 'Identify' branding to be present in text
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.className("brand-title"), "Identify"));
        WebElement loginTitle = driver.findElement(By.className("brand-title"));
        assertTrue(loginTitle.getText().equalsIgnoreCase("Identify"), "Login page should contain branding 'Identify'.");

        // Use CSS selectors for inputs - exactly matching Login.jsx placeholders
        WebElement usernameInput = driver.findElement(By.cssSelector("input[placeholder='operator@halleyx.com']"));
        WebElement passwordInput = driver.findElement(By.cssSelector("input[type='password']"));
        WebElement loginButton = driver.findElement(By.cssSelector("button.premium-btn"));

        // Use seeded employee credentials
        usernameInput.sendKeys("employee@halleyx.com"); 
        passwordInput.sendKeys("password123");
        loginButton.click();

        // Check URL transition to dashboard
        wait.until(ExpectedConditions.urlContains("dashboard"));
        assertTrue(driver.getCurrentUrl().contains("dashboard"), "Navigation to dashboard failed. Final URL: " + driver.getCurrentUrl());
    }

    @Test
    @DisplayName("Verify Dashboard Essential UI")
    void testDashboardEssentials() {
        // Manual login simulation
        driver.get(BASE_URL + "/login");
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("input[placeholder='operator@halleyx.com']")));
        
        driver.findElement(By.cssSelector("input[placeholder='operator@halleyx.com']")).sendKeys("employee@halleyx.com");
        driver.findElement(By.cssSelector("input[type='password']")).sendKeys("password123");
        driver.findElement(By.cssSelector("button.premium-btn")).click();

        // Wait for 'Employee Portal' heading
        wait.until(ExpectedConditions.textToBePresentInElementLocated(By.tagName("h1"), "Employee Portal"));
        WebElement portalTitle = driver.findElement(By.tagName("h1"));
        assertTrue(portalTitle.isDisplayed(), "Portal title missing.");

        // Check for transition animations or specific elements
        wait.until(ExpectedConditions.visibilityOfElementLocated(By.className("animate-fade-in")));
        assertTrue(driver.getPageSource().contains("Available Benefits"), "Dashboard content should contain 'Available Benefits'.");
    }
}
